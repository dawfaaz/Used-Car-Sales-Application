import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { map } from "rxjs";
import { CarService } from "../../services/car.service";
import { UiFeedbackService } from "../../services/ui-feedback.service";
import { Customer } from "../../models/car.model";

@Component({
  selector: "app-customers",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./customers.component.html",
  styleUrl: "./customers.component.css",
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalRecords = 0;
  isLoading = false;
  isRegistrationOpen = false;
  editingCustomerId: number | null = null;
  isSaving = false;
  showValidationErrors = false;
  errorMessage = "";

  newCustomer: Customer = this.createEmptyCustomer();

  constructor(
    private readonly carService: CarService,
    private readonly feedback: UiFeedbackService,
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  createEmptyCustomer(): Customer {
    return { fullName: "", email: "", phone: "", city: "", state: "" };
  }

  get allRequiredFieldsFilled(): boolean {
    return Boolean(
      this.newCustomer.fullName.trim() &&
        this.newCustomer.email.trim() &&
        this.newCustomer.phone.trim() &&
        this.newCustomer.city.trim() &&
        this.newCustomer.state.trim(),
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get firstRecordNumber(): number {
    return this.totalRecords === 0 ? 0 : (this.pageNumber - 1) * this.pageSize + 1;
  }

  get lastRecordNumber(): number {
    return Math.min(this.pageNumber * this.pageSize, this.totalRecords);
  }

  toggleRegistration(): void {
    if (this.isRegistrationOpen) {
      this.cancelRegistration();
      return;
    }

    this.startRegistration();
  }

  startRegistration(): void {
    this.newCustomer = this.createEmptyCustomer();
    this.editingCustomerId = null;
    this.showValidationErrors = false;
    this.isRegistrationOpen = true;
  }

  editCustomer(customer: Customer): void {
    this.newCustomer = { ...customer };
    this.editingCustomerId = customer.customerId ?? null;
    this.showValidationErrors = false;
    this.errorMessage = "";
    this.isRegistrationOpen = true;
  }

  loadCustomers(pageNumber = this.pageNumber): void {
    this.isLoading = true;
    this.errorMessage = "";
    this.carService.getCustomers(pageNumber, this.pageSize).subscribe({
      next: (response) => {
        this.customers = response.data;
        this.pageNumber = response.pageNumber;
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage =
          "Unable to load customers. Check whether the backend API is running.";
        this.isLoading = false;
      },
    });
  }

  changePage(pageNumber: number): void {
    if (this.isLoading || pageNumber < 1 || pageNumber > this.totalPages) return;
    this.loadCustomers(pageNumber);
  }

  changePageSize(pageSize: number): void {
    if (!Number.isInteger(pageSize) || pageSize < 1) return;
    this.pageSize = pageSize;
    this.loadCustomers(1);
  }

  saveCustomer(): void {
    if (this.isSaving) return;
    this.showValidationErrors = true;

    if (!this.allRequiredFieldsFilled) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newCustomer.email.trim())) {
      this.feedback.error(
        "Please enter a valid email address, such as name@example.com.",
      );
      return;
    }

    if (!/^\d{10}$/.test(this.newCustomer.phone.trim())) {
      this.feedback.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    const customer = {
      ...this.newCustomer,
      fullName: this.newCustomer.fullName.trim(),
      email: this.newCustomer.email.trim(),
      phone: this.newCustomer.phone.trim(),
      city: this.newCustomer.city.trim(),
      state: this.newCustomer.state.trim(),
    };

    const request = this.editingCustomerId === null
      ? this.carService.addCustomer(customer).pipe(map(() => undefined))
      : this.carService.updateCustomer(this.editingCustomerId, customer);

    this.isSaving = true;
    request.subscribe({
      next: () => {
        const wasEditing = this.editingCustomerId !== null;
        this.feedback.success(
          wasEditing
            ? `Customer record for ${customer.fullName} was updated successfully.`
            : `Customer record for ${customer.fullName} was saved successfully.`,
        );
        this.newCustomer = this.createEmptyCustomer();
        this.editingCustomerId = null;
        this.isRegistrationOpen = false;
        this.isSaving = false;
        this.loadCustomers(
          wasEditing
            ? this.pageNumber
            : Math.ceil((this.totalRecords + 1) / this.pageSize),
        );
      },
      error: (error) => {
        this.isSaving = false;
        this.feedback.error(this.getRegistrationErrorMessage(error));
      },
    });
  }

  cancelRegistration(): void {
    this.newCustomer = this.createEmptyCustomer();
    this.editingCustomerId = null;
    this.showValidationErrors = false;
    this.isRegistrationOpen = false;
  }

  private getRegistrationErrorMessage(error: {
    error?: unknown;
  }): string {
    const details = error.error;
    if (typeof details === "string" && details.trim()) return details;

    if (details && typeof details === "object") {
      const response = details as { message?: unknown; title?: unknown };
      if (typeof response.message === "string") return response.message;
      if (typeof response.title === "string") return response.title;
    }

    return "Unable to register the customer. Please check the details and try again.";
  }

  async deleteCustomer(id: number): Promise<void> {
    const confirmed = await this.feedback.confirm({
      title: "Remove customer?",
      message: "This customer will be removed from the active directory.",
      confirmLabel: "Remove customer",
    });
    if (!confirmed) return;

    this.carService.deleteCustomer(id).subscribe({
      next: () => {
        this.feedback.success("Customer was removed successfully.");
        this.loadCustomers(
          this.customers.length === 1 && this.pageNumber > 1
            ? this.pageNumber - 1
            : this.pageNumber,
        );
      },
      error: (error) =>
        this.feedback.error(this.getRegistrationErrorMessage(error)),
    });
  }
}
