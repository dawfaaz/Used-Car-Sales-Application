using IndianUsedCarApi.Models;

namespace IndianUsedCarApi.Data;

public static class SeedData
{
    public static void Initialize(ApplicationDbContext context)
    {
        context.Database.EnsureCreated();

        if (!context.Cars.Any())
        {
            var cars = new List<Car>
            {
                new Car
                {
                    Brand = "Maruti Suzuki",
                    Model = "Swift",
                    Variant = "VXi",
                    Year = 2022,
                    Price = 650000m,
                    Mileage = 25000,
                    FuelType = "Petrol",
                    Transmission = "Manual",
                    RegistrationNumber = "TN-01-AB-1234",
                    ImageUrl = "https://localhost:58805/uploads/sample-car-1.jpg",
                    Status = "Available",
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                },
                new Car
                {
                    Brand = "Hyundai",
                    Model = "Creta",
                    Variant = "SX",
                    Year = 2021,
                    Price = 1450000m,
                    Mileage = 30000,
                    FuelType = "Diesel",
                    Transmission = "Automatic",
                    RegistrationNumber = "MH-04-CD-5678",
                    ImageUrl = "https://localhost:58805/uploads/sample-car-2.jpg",
                    Status = "Available",
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                },
                new Car
                {
                    Brand = "Tata",
                    Model = "Nexon",
                    Variant = "Fearless",
                    Year = 2023,
                    Price = 1100000m,
                    Mileage = 15000,
                    FuelType = "Petrol",
                    Transmission = "Automatic",
                    RegistrationNumber = "DL-01-EF-9012",
                    ImageUrl = "https://localhost:58805/uploads/sample-car-3.jpg",
                    Status = "Available",
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                },
                new Car
                {
                    Brand = "Honda",
                    Model = "City",
                    Variant = "VX",
                    Year = 2020,
                    Price = 1050000m,
                    Mileage = 45000,
                    FuelType = "Petrol",
                    Transmission = "Manual",
                    RegistrationNumber = "KA-01-GH-3456",
                    ImageUrl = "https://localhost:58805/uploads/sample-car-4.jpg",
                    Status = "Available",
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow
                }
            };
            context.Cars.AddRange(cars);
            context.SaveChanges();
        }

        if (!context.Customers.Any())
        {
            var customers = new List<Customer>
            {
                new Customer { FullName = "Arun Kumar", Email = "arun@example.com", Phone = "9876543210", City = "Chennai", State = "Tamil Nadu", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Customer { FullName = "Priya Sharma", Email = "priya@example.com", Phone = "9876543211", City = "Mumbai", State = "Maharashtra", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Customer { FullName = "Rajesh Singh", Email = "rajesh@example.com", Phone = "9876543212", City = "Delhi", State = "Delhi", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Customer { FullName = "Sneha Reddy", Email = "sneha@example.com", Phone = "9876543213", City = "Hyderabad", State = "Telangana", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Customer { FullName = "Amit Patel", Email = "amit@example.com", Phone = "9876543214", City = "Ahmedabad", State = "Gujarat", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Customer { FullName = "Kavitha Nair", Email = "kavitha@example.com", Phone = "9876543215", City = "Kochi", State = "Kerala", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Customer { FullName = "Vikram Joshi", Email = "vikram@example.com", Phone = "9876543216", City = "Pune", State = "Maharashtra", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Customer { FullName = "Ananya Das", Email = "ananya@example.com", Phone = "9876543217", City = "Kolkata", State = "West Bengal", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Customer { FullName = "Rohit Verma", Email = "rohit@example.com", Phone = "9876543218", City = "Jaipur", State = "Rajasthan", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Customer { FullName = "Sita Iyer", Email = "sita@example.com", Phone = "9876543219", City = "Bangalore", State = "Karnataka", IsDeleted = false, CreatedAt = DateTime.UtcNow }
            };
            context.Customers.AddRange(customers);
            context.SaveChanges();
        }

        if (!context.Cars.Any())
        {
            var moreCars = new List<Car>
            {
                new Car { Brand = "Mahindra", Model = "Thar", Variant = "LX", Year = 2022, Price = 1500000m, Mileage = 20000, FuelType = "Petrol", Transmission = "Manual", RegistrationNumber = "RJ-14-IJ-7890", ImageUrl = "https://localhost:58805/uploads/sample-car-5.jpg", Status = "Sold", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Car { Brand = "Toyota", Model = "Innova Crysta", Variant = "VX", Year = 2019, Price = 1800000m, Mileage = 60000, FuelType = "Diesel", Transmission = "Automatic", RegistrationNumber = "TN-22-KL-1234", ImageUrl = "https://localhost:58805/uploads/sample-car-6.jpg", Status = "Sold", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Car { Brand = "Maruti Suzuki", Model = "Baleno", Variant = "Alpha", Year = 2021, Price = 850000m, Mileage = 35000, FuelType = "Petrol", Transmission = "Manual", RegistrationNumber = "MP-09-MN-5678", ImageUrl = "https://localhost:58805/uploads/sample-car-7.jpg", Status = "Available", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Car { Brand = "Tata", Model = "Punch", Variant = "Adventure", Year = 2023, Price = 750000m, Mileage = 12000, FuelType = "Petrol", Transmission = "Manual", RegistrationNumber = "GJ-13-OP-9012", ImageUrl = "https://localhost:58805/uploads/sample-car-8.jpg", Status = "Available", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Car { Brand = "Hyundai", Model = "i20", Variant = "Asta", Year = 2020, Price = 900000m, Mileage = 40000, FuelType = "Petrol", Transmission = "Automatic", RegistrationNumber = "HR-26-QR-3456", ImageUrl = "https://localhost:58805/uploads/sample-car-9.jpg", Status = "Available", IsDeleted = false, CreatedAt = DateTime.UtcNow },
                new Car { Brand = "Kia", Model = "Seltos", Variant = "GTX", Year = 2022, Price = 1300000m, Mileage = 28000, FuelType = "Diesel", Transmission = "Automatic", RegistrationNumber = "PB-10-ST-7890", ImageUrl = "https://localhost:58805/uploads/sample-car-10.jpg", Status = "Available", IsDeleted = false, CreatedAt = DateTime.UtcNow }
            };
            context.Cars.AddRange(moreCars);
            context.SaveChanges();
        }

        if (!context.Bills.Any())
        {
            var soldCar5 = context.Cars.FirstOrDefault(c => c.RegistrationNumber == "RJ-14-IJ-7890");
            var soldCar6 = context.Cars.FirstOrDefault(c => c.RegistrationNumber == "TN-22-KL-1234");
            var customer1 = context.Customers.FirstOrDefault(c => c.Email == "arun@example.com");
            var customer2 = context.Customers.FirstOrDefault(c => c.Email == "priya@example.com");

            var bills = new List<Bill>();
            if (soldCar5 != null && customer1 != null)
            {
                bills.Add(new Bill
                {
                    InvoiceNumber = "IND-INV-20240115103000-AAAAAAAAAAAAAA",
                    CarId = soldCar5.CarId,
                    CustomerId = customer1.CustomerId,
                    SalePrice = soldCar5.Price,
                    CgstAmount = 135000m,
                    SgstAmount = 135000m,
                    TotalAmount = 1770000m,
                    PaymentMethod = "UPI",
                    SaleDate = DateTime.UtcNow.AddDays(-30),
                    IsDeleted = false
                });
            }
            if (soldCar6 != null && customer2 != null)
            {
                bills.Add(new Bill
                {
                    InvoiceNumber = "IND-INV-20240120144500-BBBBBBBBBBBBBB",
                    CarId = soldCar6.CarId,
                    CustomerId = customer2.CustomerId,
                    SalePrice = soldCar6.Price,
                    CgstAmount = 162000m,
                    SgstAmount = 162000m,
                    TotalAmount = 2124000m,
                    PaymentMethod = "Bank Transfer",
                    SaleDate = DateTime.UtcNow.AddDays(-15),
                    IsDeleted = false
                });
            }
            if (bills.Count > 0)
            {
                context.Bills.AddRange(bills);
                context.SaveChanges();
            }
        }
    }
}