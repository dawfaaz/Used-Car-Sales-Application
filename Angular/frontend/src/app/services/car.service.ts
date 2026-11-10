import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { EMPTY, Observable, expand, map, reduce } from "rxjs";
import { environment } from "../../environments/environment";
import {
  Bill,
  Car,
  CreateSaleRequest,
  Customer,
  CustomerPage,
} from "../models/car.model";

@Injectable({
  providedIn: "root",
})
export class CarService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.apiUrl}/cars`);
  }

  getCar(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.apiUrl}/cars/${id}`);
  }

  addCar(car: Car): Observable<Car> {
    return this.http.post<Car>(`${this.apiUrl}/cars`, car);
  }

  uploadCarImage(image: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("image", image);
    return this.http.post<{ imageUrl: string }>(
      `${this.apiUrl}/cars/upload-image`,
      formData,
    );
  }

  updateCar(id: number, car: Car): Observable<Car> {
    return this.http.put<Car>(`${this.apiUrl}/cars/${id}`, car);
  }

  deleteCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cars/${id}`);
  }

  getCustomers(
    pageNumber = 1,
    pageSize = 10,
    searchTerm = "",
  ): Observable<CustomerPage> {
    const params = new HttpParams()
      .set("pageNumber", pageNumber)
      .set("pageSize", pageSize)
      .set("searchTerm", searchTerm);

    return this.http.get<CustomerPage>(`${this.apiUrl}/customers`, { params });
  }

  getAllCustomers(searchTerm = ""): Observable<Customer[]> {
    const pageSize = 100;

    return this.getCustomers(1, pageSize, searchTerm).pipe(
      expand((page) =>
        page.pageNumber * page.pageSize < page.totalRecords
          ? this.getCustomers(page.pageNumber + 1, pageSize, searchTerm)
          : EMPTY,
      ),
      map((page) => page.data),
      reduce((customers, page) => customers.concat(page), [] as Customer[]),
    );
  }

  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, customer);
  }

  updateCustomer(id: number, customer: Customer): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/customers/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/customers/${id}`);
  }

  processSale(saleData: CreateSaleRequest): Observable<Bill> {
    return this.http.post<Bill>(
      `${this.apiUrl}/billing/process-sale`,
      saleData,
    );
  }

  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.apiUrl}/billing`);
  }
}
