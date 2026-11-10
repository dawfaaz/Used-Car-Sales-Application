using IndianUsedCarApi.Data;
using IndianUsedCarApi.DTOs;
using IndianUsedCarApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IndianUsedCarApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController(ApplicationDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null)
    {
        if (pageNumber < 1 || pageSize is < 1 or > 100)
            return BadRequest("Page number must be positive and page size must be between 1 and 100.");

        var query = context.Customers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(customer =>
                customer.FullName.Contains(searchTerm) ||
                customer.Email.Contains(searchTerm) ||
                customer.Phone.Contains(searchTerm));
        }

        var totalRecords = await query.CountAsync();

        var customers = await query
            .OrderBy(customer => customer.CustomerId)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            TotalRecords = totalRecords,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Data = customers
        });
    }

    private async Task<bool> IsEmailOrPhoneUniqueAsync(string email, string phoneNumber, int? excludeId = null)
    {
        return !await context.Customers.AnyAsync(customer =>
            (customer.Email == email || customer.Phone == phoneNumber) &&
            (!excludeId.HasValue || customer.CustomerId != excludeId.Value));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCustomerById(int id)
    {
        var customer = await context.Customers.FindAsync(id);
        return customer is null ? NotFound() : Ok(customer);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerDto dto)
    {
        if (!await IsEmailOrPhoneUniqueAsync(dto.Email, dto.Phone))
            return Conflict("Email or phone number already exists.");

        var customer = new Customer
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            City = dto.City,
            State = dto.State
        };

        context.Customers.Add(customer);
        await context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCustomerById),
            new { id = customer.CustomerId },
            customer);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCustomer(
        int id,
        [FromBody] UpdateCustomerDto dto)
    {
        var customer = await context.Customers.FindAsync(id);
        if (customer is null) return NotFound();

        if (!await IsEmailOrPhoneUniqueAsync(dto.Email, dto.Phone, id))
            return Conflict("Email or phone number already exists.");

        customer.FullName = dto.FullName;
        customer.Email = dto.Email;
        customer.Phone = dto.Phone;
        customer.City = dto.City;
        customer.State = dto.State;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> SoftDeleteCustomer(int id)
    {
        var customer = await context.Customers
            .FirstOrDefaultAsync(customer => customer.CustomerId == id);

        if (customer is null)
            return NotFound();

        var hasBills = await context.Bills.AnyAsync(bill => bill.CustomerId == id);
        if (hasBills)
            return BadRequest("Customers with sales history cannot be removed.");

        customer.IsDeleted = true;
        await context.SaveChangesAsync();

        return NoContent();
    }
}
