import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CarService } from "../../services/car.service";
import { Bill, Car, Customer, CreateSaleRequest } from "../../models/car.model";

@Component({
  selector: "app-billing",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./billing.component.html",
  styleUrl: "./billing.component.css",
})
export class BillingComponent implements OnInit {
  readonly cgstPercentage = 9;
  readonly sgstPercentage = 9;
  private readonly indianCurrencyFormatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  cars: Car[] = [];
  customers: Customer[] = [];
  bills: Bill[] = [];

  selectedCarId: number | null = null;
  selectedCustomerId: number | null = null;
  paymentMethod = "";
  isLoading = false;
  isProcessingSale = false;
  showSaleValidationErrors = false;
  historyOpen = false;
  errorMessage = "";
  invoiceToView: Bill | null = null;

  historyPageNumber = 1;
  historyPageSize = 10;

  constructor(private readonly carService: CarService) {}

  ngOnInit(): void {
    this.loadData();
  }

  get availableCars(): Car[] {
    return this.cars.filter(
      (car) => car.status?.trim().toLowerCase() === "available",
    );
  }

  get selectedCar(): Car | undefined {
    return this.availableCars.find(
      (car) => car.carId === Number(this.selectedCarId),
    );
  }

  get selectedCustomer(): Customer | undefined {
    return this.customers.find(
      (customer) => customer.customerId === Number(this.selectedCustomerId),
    );
  }

  get saleSelectionIsValid(): boolean {
    return Boolean(
      this.selectedCar?.status === "Available" &&
        this.selectedCustomer &&
        this.isPaymentMethodValid,
    );
  }

  get isPaymentMethodValid(): boolean {
    return ["UPI", "Bank Transfer", "Car Loan / Finance", "Cash"].includes(
      this.paymentMethod,
    );
  }

  get cgstAmount(): number {
    return ((this.selectedCar?.price ?? 0) * this.cgstPercentage) / 100;
  }

  get sgstAmount(): number {
    return ((this.selectedCar?.price ?? 0) * this.sgstPercentage) / 100;
  }

  get estimatedTotal(): number {
    return (this.selectedCar?.price ?? 0) + this.cgstAmount + this.sgstAmount;
  }

  formatIndianCurrency(amount: number): string {
    return this.indianCurrencyFormatter.format(amount);
  }

  customerOptionLabel(customer: Customer): string {
    const hasMatchingCustomer = this.customers.some(
      (other) =>
        other.customerId !== customer.customerId &&
        other.fullName.trim().toLocaleLowerCase() ===
          customer.fullName.trim().toLocaleLowerCase() &&
        other.city.trim().toLocaleLowerCase() ===
          customer.city.trim().toLocaleLowerCase(),
    );
    const location = `${customer.city}, ${customer.state}`;

    if (!hasMatchingCustomer) {
      return `${customer.fullName} — ${location}`;
    }

    return `${customer.fullName} — ${location} · ${customer.phone}`;
  }

  get historyTotalPages(): number {
    return Math.ceil(this.bills.length / this.historyPageSize);
  }

  get pagedBills(): Bill[] {
    const start = (this.historyPageNumber - 1) * this.historyPageSize;
    return this.bills.slice(start, start + this.historyPageSize);
  }

  get firstHistoryRecord(): number {
    return this.bills.length
      ? (this.historyPageNumber - 1) * this.historyPageSize + 1
      : 0;
  }

  get lastHistoryRecord(): number {
    return Math.min(
      this.historyPageNumber * this.historyPageSize,
      this.bills.length,
    );
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = "";

    this.carService.getCars().subscribe({
      next: (cars) => {
        this.cars = cars;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = "Unable to load vehicle list.";
        this.isLoading = false;
      },
    });

    this.carService.getAllCustomers().subscribe({
      next: (customers) => (this.customers = customers),
      error: () => (this.errorMessage = "Unable to load customer list."),
    });

    this.loadBills();
  }

  loadBills(): void {
    this.carService.getBills().subscribe({
      next: (bills) => {
        this.bills = bills;
        this.historyPageNumber = Math.min(
          this.historyPageNumber,
          Math.max(this.historyTotalPages, 1),
        );
      },
      error: () => (this.errorMessage = "Unable to load billing history."),
    });
  }

  toggleHistory(): void {
    this.historyOpen = !this.historyOpen;
  }

  changeHistoryPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.historyTotalPages) return;
    this.historyPageNumber = pageNumber;
  }

  changeHistoryPageSize(pageSize: number): void {
    if (!Number.isInteger(pageSize) || pageSize < 1) return;
    this.historyPageSize = pageSize;
    this.historyPageNumber = 1;
  }

  executeSale(): void {
    if (this.isProcessingSale) return;
    this.showSaleValidationErrors = true;
    if (!this.saleSelectionIsValid) return;

    const car = this.selectedCar!;
    const customer = this.selectedCustomer!;
    const payload: CreateSaleRequest = {
      carId: car.carId!,
      customerId: customer.customerId!,
      paymentMethod: this.paymentMethod,
    };

    this.isProcessingSale = true;
    this.errorMessage = "";
    this.carService.processSale(payload).subscribe({
      next: (bill) => {
        this.invoiceToView = {
          ...bill,
          car: bill.car ?? car,
          customer: bill.customer ?? customer,
        };
        this.selectedCarId = null;
        this.selectedCustomerId = null;
        this.paymentMethod = "";
        this.showSaleValidationErrors = false;
        this.isProcessingSale = false;
        this.loadData();
      },
      error: (error) => {
        this.isProcessingSale = false;
        this.errorMessage = this.getSaleErrorMessage(error);
      },
    });
  }

  viewInvoice(bill: Bill): void {
    this.invoiceToView = bill;
  }

  closeInvoice(): void {
    this.invoiceToView = null;
  }

  printInvoice(): void {
    window.print();
  }

  private getSaleErrorMessage(error: { error?: unknown }): string {
    const details = error.error;
    if (typeof details === "string" && details.trim()) return details;

    if (details && typeof details === "object") {
      const response = details as { message?: unknown; title?: unknown };
      if (typeof response.message === "string") return response.message;
      if (typeof response.title === "string") return response.title;
    }

    return "Unable to process the sale. Please verify the selections and try again.";
  }
}
