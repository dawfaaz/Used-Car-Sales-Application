using IndianUsedCarApi.Data;
using IndianUsedCarApi.DTOs;
using IndianUsedCarApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IndianUsedCarApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BillingController(ApplicationDbContext context) : ControllerBase
{
    private const decimal CgstPercentage = 9m;
    private const decimal SgstPercentage = 9m;

    [HttpGet]
    public async Task<IActionResult> GetBills()
    {
        var bills = await context.Bills
            .Include(bill => bill.Car)
            .Include(bill => bill.Customer)
            .OrderByDescending(bill => bill.SaleDate)
            .ToListAsync();

        return Ok(bills);
    }

    [HttpPost("process-sale")]
    public async Task<IActionResult> ProcessSale([FromBody] CreateSaleDto dto)
    {
        await using var transaction = await context.Database.BeginTransactionAsync();

        try
        {
            var car = await context.Cars
                .FirstOrDefaultAsync(car => car.CarId == dto.CarId);

            if (car is null || car.Status != "Available")
                return BadRequest("Vehicle is unavailable or already sold.");

            var customer = await context.Customers
                .FirstOrDefaultAsync(customer => customer.CustomerId == dto.CustomerId);

            if (customer is null)
                return NotFound("Customer profile not found.");

            var cgst = decimal.Round(car.Price * CgstPercentage / 100m, 2);
            var sgst = decimal.Round(car.Price * SgstPercentage / 100m, 2);
            var total = car.Price + cgst + sgst;

            var bill = new Bill
            {
                InvoiceNumber = $"IND-INV-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"[..33],
                CarId = car.CarId,
                CustomerId = customer.CustomerId,
                SalePrice = car.Price,
                CgstAmount = cgst,
                SgstAmount = sgst,
                TotalAmount = total,
                PaymentMethod = dto.PaymentMethod,
                SaleDate = DateTime.UtcNow
            };

            car.Status = "Sold";
            context.Bills.Add(bill);

            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(bill);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
