export interface Car {
  carId?: number;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  registrationNumber: string;
  imageUrl?: string;
  status?: string;
}

export interface Customer {
  customerId?: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

export interface CustomerPage {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  data: Customer[];
}

export interface Bill {
  billId?: number;
  invoiceNumber: string;
  carId: number;
  car?: Car;
  customerId: number;
  customer?: Customer;
  salePrice: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  paymentMethod: string;
  saleDate: string;
}

export interface CreateSaleRequest {
  carId: number;
  customerId: number;
  paymentMethod: string;
}
