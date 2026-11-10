using System.ComponentModel.DataAnnotations;

namespace IndianUsedCarApi.DTOs;

public class CreateCarDto
{
    [Required, StringLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Model { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Variant { get; set; } = string.Empty;

    [Range(1900, 2100)]
    public int Year { get; set; }

    [Range(typeof(decimal), "1", "9999999999")]
    public decimal Price { get; set; }

    [Range(0, 1000000, ErrorMessage = "Mileage must be between 0 and 1,000,000 km.")]
    public int Mileage { get; set; }

    [Required]
    public string FuelType { get; set; } = string.Empty;

    [Required]
    public string Transmission { get; set; } = string.Empty;

    [Required, StringLength(20)]
    [RegularExpression(
        @"(?i)^(?:[A-Z]{2}-\d{2}-[A-Z]{1,3}-\d{1,4}|\d{2}BH\d{4}[A-HJ-NP-Z]{1,2})$",
        ErrorMessage = "Enter a valid Indian registration number, such as TN-01-AB-1234 or 22BH1234AA.")]
    public string RegistrationNumber { get; set; } = string.Empty;

    [Required, Url, StringLength(500)]
    public string ImageUrl { get; set; } = string.Empty;
}

public class UpdateCarDto : CreateCarDto { }
