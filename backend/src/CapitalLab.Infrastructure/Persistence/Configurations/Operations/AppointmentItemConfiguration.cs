using CapitalLab.Domain.Entities.Operations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Operations;

public class AppointmentItemConfiguration : IEntityTypeConfiguration<AppointmentItem>
{
    public void Configure(EntityTypeBuilder<AppointmentItem> builder)
    {
        builder.ToTable("appointment_items", "operations");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();
        builder.Property(i => i.ItemType).HasConversion<string>().IsRequired().HasMaxLength(30);
        builder.Property(i => i.NameSnapshot).IsRequired().HasMaxLength(200);
        builder.Property(i => i.CodeSnapshot).IsRequired().HasMaxLength(50);
        builder.Property(i => i.PriceSnapshot).HasPrecision(18, 3);
        builder.Property(i => i.CurrencySnapshot).IsRequired().HasMaxLength(5);
        builder.Property(i => i.RowVersion).IsRowVersion().IsConcurrencyToken();
        builder.HasOne(i => i.LabTest).WithMany().HasForeignKey(i => i.LabTestId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(i => i.HealthPackage).WithMany().HasForeignKey(i => i.HealthPackageId).OnDelete(DeleteBehavior.Restrict);
    }
}
