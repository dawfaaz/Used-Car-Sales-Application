# Indian Used Car API — Backend

ASP.NET Core Web API project for managing used cars, customers, and vehicle sales.

## Project structure

```text
backend/
├── Controllers/
│   ├── BillingController.cs
│   ├── CarsController.cs
│   └── CustomersController.cs
├── Data/
│   ├── ApplicationDbContext.cs
│   └── SeedData.cs          # Auto-creates DB + seeds 10 cars, 10 customers, 2 bills
├── Database/
│   └── IndianUsedCarDb.sql
├── DTOs/
│   ├── CreateCarDto.cs
│   ├── CreateCustomerDto.cs
│   └── CreateSaleDto.cs
├── Models/
│   ├── Bill.cs
│   ├── Car.cs
│   └── Customer.cs
├── appsettings.Development.json
├── appsettings.json
├── IndianUsedCarApi.csproj
└── Program.cs
```

## Requirements

- .NET 8 SDK
- SQL Server / SQL Server Express
- Visual Studio 2022 or Visual Studio Code

## Setup

1. Open `appsettings.json`.
2. Update `DefaultConnection` to point to your SQL Server instance:

   ```json
   "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=IndianUsedCarDb;Trusted_Connection=True;TrustServerCertificate=True;"
   ```

3. Open a terminal in this `backend` folder and run:

```bash
dotnet restore
dotnet build
dotnet run
```

5. Open the Swagger URL printed in the terminal. In Development, Swagger is enabled.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/Cars` | List cars; optional `fuelType` and `status` query filters |
| GET | `/api/Cars/{id}` | Get one car |
| POST | `/api/Cars` | Create a car |
| POST | `/api/Cars/upload-image` | Upload a JPG, PNG, or WebP car image (maximum 5 MB); multipart field name: `image` |
| DELETE | `/api/Cars/{id}` | Soft-delete a car |
| GET | `/api/Customers` | List customers |
| POST | `/api/Customers` | Create a customer |
| DELETE | `/api/Customers/{id}` | Soft-delete a customer |
| GET | `/api/Billing` | List bills with car and customer details |
| POST | `/api/Billing/process-sale` | Process a sale and mark the car as sold |

## Example request bodies

### POST `/api/Cars`

Upload the image first using `/api/Cars/upload-image`, then use the returned `imageUrl`:

```json
{
  "brand": "Maruti Suzuki",
  "model": "Swift",
  "variant": "ZXi",
  "year": 2022,
  "price": 650000,
  "mileage": 25000,
  "fuelType": "Petrol",
  "transmission": "Manual",
  "registrationNumber": "TN-01-AB-1234",
  "imageUrl": "https://localhost:58805/uploads/example.jpg"
}
```

### POST `/api/Customers`

```json
{
  "fullName": "Arun Kumar",
  "email": "arun@example.com",
  "phone": "9876543210",
  "city": "Chennai",
  "state": "Tamil Nadu"
}
```

### POST `/api/Billing/process-sale`

```json
{
  "carId": 1,
  "customerId": 1,
  "paymentMethod": "UPI"
}
```

## Database Auto-Seeding

On first startup, `Program.cs` calls `SeedData.Initialize()` which:

- Calls `context.Database.EnsureCreated()` to auto-create all tables
- Seeds **10 sample cars** (mix of Available and Sold)
- Seeds **10 sample customers** (Indian cities, unique emails/phones)
- Seeds **2 sample bills** (for Sold cars, with UPI and Bank Transfer)

Seed data only inserts if tables are empty, so it's safe to restart repeatedly. To clear seed data, delete rows in SQL Server or drop the database — it will recreate on next startup.

The old `Database/IndianUsedCarDb.sql` script is kept for reference but is **no longer required**.

## Notes

- Soft-deleted cars, customers, and bills are hidden by EF Core global query filters (`IsDeleted = true`).
- The sale endpoint uses a database transaction so the bill insert and car status update commit together.
- GST is calculated at 9% CGST + 9% SGST on the backend.
- This is a starter project. Add authentication/authorization, logging, concurrency protection, and production secrets management before real deployment.
