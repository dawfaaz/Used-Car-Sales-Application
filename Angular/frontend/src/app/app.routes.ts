import { Routes } from '@angular/router';
import { CarsComponent } from './components/cars/cars.component';
import { CustomersComponent } from './components/customers/customers.component';
import { BillingComponent } from './components/billing/billing.component';
import { CarDetailsComponent } from './components/car-details/car-details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'cars', pathMatch: 'full' },
  { path: 'cars', component: CarsComponent },
  { path: 'cars/:id', component: CarDetailsComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'billing', component: BillingComponent },
  { path: '**', redirectTo: 'cars' }
];
