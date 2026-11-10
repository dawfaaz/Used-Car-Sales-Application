using IndianUsedCarApi.Models;
using Microsoft.EntityFrameworkCore;

namespace IndianUsedCarApi.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Bill> Bills => Set<Bill>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Car>(entity =>
        {
            entity.Property(c => c.Price).HasPrecision(12, 2);
            entity.HasIndex(c => c.RegistrationNumber).IsUnique();
            entity.HasQueryFilter(c => !c.IsDeleted);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasIndex(customer => customer.Email).IsUnique();
            entity.HasIndex(customer => customer.Phone).IsUnique();
            entity.HasQueryFilter(customer => !customer.IsDeleted);
        });

        modelBuilder.Entity<Bill>(entity =>
        {
            entity.Property(b => b.SalePrice).HasPrecision(12, 2);
            entity.Property(b => b.CgstAmount).HasPrecision(12, 2);
            entity.Property(b => b.SgstAmount).HasPrecision(12, 2);
            entity.Property(b => b.TotalAmount).HasPrecision(12, 2);
            entity.HasIndex(b => b.InvoiceNumber).IsUnique();
            entity.HasQueryFilter(b => !b.IsDeleted);
            entity.HasOne(b => b.Car)
                .WithMany()
                .HasForeignKey(b => b.CarId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(b => b.Customer)
                .WithMany()
                .HasForeignKey(b => b.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
