using IndianUsedCarApi.Data;
using IndianUsedCarApi.DTOs;
using IndianUsedCarApi.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IndianUsedCarApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarsController(
    ApplicationDbContext context,
    IWebHostEnvironment environment) : ControllerBase
{
    private const long MaximumImageSize = 5 * 1024 * 1024;

    [HttpGet]
    public async Task<IActionResult> GetCars(
        [FromQuery] string? fuelType,
        [FromQuery] string? status)
    {
        var query = context.Cars.AsQueryable();

        if (!string.IsNullOrWhiteSpace(fuelType))
            query = query.Where(car => car.FuelType == fuelType);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(car => car.Status == status);

        return Ok(await query.ToListAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCarById(int id)
    {
        var car = await context.Cars.FirstOrDefaultAsync(car => car.CarId == id);
        return car is null ? NotFound() : Ok(car);
    }

    [HttpPost("upload-image")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage(IFormFile? image)
    {
        if (image is null || image.Length == 0)
            return BadRequest("Select an image to upload.");

        if (image.Length > MaximumImageSize)
            return BadRequest("The image must be 5 MB or smaller.");

        var extension = image.ContentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => null
        };

        if (extension is null || !await HasValidImageSignature(image))
            return BadRequest("Upload a valid JPG, PNG, or WebP image.");

        var webRootPath = environment.WebRootPath
            ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var uploadsDirectory = Path.Combine(webRootPath, "uploads");
        Directory.CreateDirectory(uploadsDirectory);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsDirectory, fileName);

        await using (var stream = new FileStream(filePath, FileMode.CreateNew))
            await image.CopyToAsync(stream);

        return Ok(new { imageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}" });
    }

    private static async Task<bool> HasValidImageSignature(IFormFile image)
    {
        var header = new byte[12];
        await using var stream = image.OpenReadStream();
        var bytesRead = await stream.ReadAsync(header);

        if (image.ContentType.Equals("image/jpeg", StringComparison.OrdinalIgnoreCase))
            return bytesRead >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;

        if (image.ContentType.Equals("image/png", StringComparison.OrdinalIgnoreCase))
            return bytesRead >= 8 &&
                header.AsSpan(0, 8).SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A });

        return image.ContentType.Equals("image/webp", StringComparison.OrdinalIgnoreCase) &&
            bytesRead >= 12 &&
            header.AsSpan(0, 4).SequenceEqual("RIFF"u8) &&
            header.AsSpan(8, 4).SequenceEqual("WEBP"u8);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCar([FromBody] CreateCarDto dto)
    {
        var registrationExists = await context.Cars
            .AnyAsync(car => car.RegistrationNumber == dto.RegistrationNumber);

        if (registrationExists)
            return Conflict("A car with this registration number already exists.");

        var car = new Car
        {
            Brand = dto.Brand,
            Model = dto.Model,
            Variant = dto.Variant,
            Year = dto.Year,
            Price = dto.Price,
            Mileage = dto.Mileage,
            FuelType = dto.FuelType,
            Transmission = dto.Transmission,
            RegistrationNumber = dto.RegistrationNumber,
            ImageUrl = dto.ImageUrl
        };

        context.Cars.Add(car);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCarById), new { id = car.CarId }, car);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCar(int id, [FromBody] UpdateCarDto dto)
    {
        var car = await context.Cars.FindAsync(id);
        if (car is null) return NotFound();
        var registrationExists = await context.Cars.AnyAsync(existingCar =>
            existingCar.CarId != id &&
            existingCar.RegistrationNumber == dto.RegistrationNumber);
        if (registrationExists)
            return Conflict("A car with this registration number already exists.");

        car.Brand = dto.Brand;
        car.Model = dto.Model;
        car.Variant = dto.Variant;
        car.Year = dto.Year;
        car.Price = dto.Price;
        car.Mileage = dto.Mileage;
        car.FuelType = dto.FuelType;
        car.Transmission = dto.Transmission;
        car.RegistrationNumber = dto.RegistrationNumber;
        car.ImageUrl = dto.ImageUrl;

        await context.SaveChangesAsync();
        return Ok(car);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> SoftDeleteCar(int id)
    {
        var car = await context.Cars.FirstOrDefaultAsync(car => car.CarId == id);
        if (car is null)
            return NotFound();

        if (car.Status == "Sold")
            return BadRequest("Sold vehicles cannot be removed because they are part of billing history.");

        car.IsDeleted = true;
        await context.SaveChangesAsync();

        return NoContent();
    }
}
