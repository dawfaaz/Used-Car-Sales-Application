# Indian Used Car Dealership — Frontend

Angular standalone frontend for the Indian Used Car Dealership Management API.

## Components

- `CarsComponent` — add, list, edit, and remove used cars (with image upload).
- `CustomersComponent` — register, list, edit, and remove customers.
- `BillingComponent` — process vehicle sales, preview GST totals, and view/print invoices.
- `CarDetailsComponent` — view full car profile/details.
- `AppFeedbackComponent` — toast notifications and confirmation dialogs.

Each component has its own TypeScript, HTML, and CSS files. Angular Router keeps the screens separate.

## Requirements

- Node.js (LTS recommended)
- npm
- Angular CLI 18

## Backend

This frontend expects a **.NET Web API** running locally with the following endpoints:

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/api/cars` | Get cars |
| POST | `/api/cars` | Add car |
| PUT | `/api/cars/{id}` | Update car |
| DELETE | `/api/cars/{id}` | Remove car |
| POST | `/api/cars/upload-image` | Upload car image |
| GET | `/api/customers` | Get customers (paginated) |
| POST | `/api/customers` | Add customer |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Remove customer |
| GET | `/api/billing` | Get invoices |
| POST | `/api/billing/process-sale` | Process sale |

The backend must allow the Angular origin `http://localhost:4200` through its CORS policy.

## Run Locally

1. Extract the `frontend` folder.
2. Open a terminal inside the folder.
3. Install dependencies:

```bash
npm install
```

4. Configure the API URL (optional):

   Edit `src/environments/environment.ts` and change `apiUrl` to match your .NET backend:

   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:YOUR_PORT/api',
   };
   ```

   The default is `http://localhost:58805/api`.

5. Start Angular:

```bash
npm start
```

6. Open `http://localhost:4200`.

## Build for Production

```bash
npm run build
```

The production build replaces `src/environments/environment.ts` with `src/environments/environment.prod.ts` automatically.

## Key Entities

- **Car** — brand, model, variant, year, price, mileage, fuel type, transmission, registration number, image URL, status
- **Customer** — full name, email, phone, city, state
- **Billing / Sale** — invoice number, car, customer, sale price, CGST, SGST, total, payment method, sale date

## Important

- GST is calculated at 9% CGST + 9% SGST on the frontend estimate. The backend should validate and enforce the correct tax rules for real transactions.
- Car images are validated for type (JPG, PNG, WebP) and size (max 5 MB) before upload.
- The frontend expects API response property names in camelCase matching the TypeScript interfaces in `src/app/models/car.model.ts`.
