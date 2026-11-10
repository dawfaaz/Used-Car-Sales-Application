using System.ComponentModel.DataAnnotations;

namespace IndianUsedCarApi.DTOs;

public class CreateSaleDto
{
    [Range(1, int.MaxValue)]
    public int CarId { get; set; }

    [Range(1, int.MaxValue)]
    public int CustomerId { get; set; }

    [Required]
    [RegularExpression("^(UPI|Bank Transfer|Car Loan / Finance|Cash)$")]
    public string PaymentMethod { get; set; } = string.Empty;
}
