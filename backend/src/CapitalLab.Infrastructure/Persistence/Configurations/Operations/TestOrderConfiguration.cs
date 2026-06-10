using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Operations;

public class TestOrderConfiguration : AuditableEntityConfiguration<TestOrder>
{
    public override void Configure(EntityTypeBuilder<TestOrder> builder)
    {
        base.Configure(builder);

        builder.ToTable("test_orders", "operations");
        builder.Property(o => o.OrderNumber).IsRequired().HasMaxLength(30);
        builder.Property(o => o.Status).HasConversion<string>().IsRequired().HasMaxLength(30);
        builder.Property(o => o.SubtotalAmount).HasPrecision(18, 3);
        builder.Property(o => o.DiscountAmount).HasPrecision(18, 3);
        builder.Property(o => o.TotalAmount).HasPrecision(18, 3);
        builder.Property(o => o.Currency).IsRequired().HasMaxLength(5);
        builder.Property(o => o.Notes).HasMaxLength(1000);
        builder.Property(o => o.CancellationReason).HasMaxLength(1000);

        builder.HasIndex(o => o.OrderNumber).IsUnique().HasDatabaseName("ix_test_orders_order_number");
        builder.HasIndex(o => o.PatientId).HasDatabaseName("ix_test_orders_patient_id");
        builder.HasIndex(o => o.BranchId).HasDatabaseName("ix_test_orders_branch_id");
        builder.HasIndex(o => o.Status).HasDatabaseName("ix_test_orders_status");

        builder.HasOne(o => o.Patient).WithMany().HasForeignKey(o => o.PatientId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(o => o.Branch).WithMany().HasForeignKey(o => o.BranchId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(o => o.Items).WithOne(i => i.TestOrder).HasForeignKey(i => i.TestOrderId).OnDelete(DeleteBehavior.Cascade);
    }
}
