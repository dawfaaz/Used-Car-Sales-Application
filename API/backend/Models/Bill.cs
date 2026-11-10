namespace IndianUsedCarApi.Models;

public class Bill
{
    public int BillId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int CarId { get; set; }
    public Car? Car { get; set; }
    public int CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public decimal SalePrice { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = "UPI";
    public DateTime SaleDate { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
}
