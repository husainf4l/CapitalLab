using CapitalLab.Domain.Entities.Billing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Billing;

public class InvoiceConfiguration : AuditableEntityConfiguration<Invoice>
{
    public override void Configure(EntityTypeBuilder<Invoice> builder)
    {
        base.Configure(builder);

        builder.ToTable("invoices", "billing");

        builder.Property(i => i.InvoiceNumber).IsRequired().HasMaxLength(30);
        builder.Property(i => i.Status).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(i => i.Currency).IsRequired().HasMaxLength(3);
        builder.Property(i => i.SubtotalAmount).HasPrecision(18, 3);
        builder.Property(i => i.DiscountAmount).HasPrecision(18, 3);
        builder.Property(i => i.TaxAmount).HasPrecision(18, 3);
        builder.Property(i => i.TotalAmount).HasPrecision(18, 3);
        builder.Property(i => i.PaidAmount).HasPrecision(18, 3);
        builder.Property(i => i.BalanceAmount).HasPrecision(18, 3);
        builder.Property(i => i.IssuedAt).HasColumnType("timestamptz");
        builder.Property(i => i.DueAt).HasColumnType("timestamptz");
        builder.Property(i => i.Notes).HasMaxLength(1000);

        builder.HasIndex(i => i.InvoiceNumber).IsUnique().HasDatabaseName("ix_invoices_number");
        builder.HasIndex(i => i.PatientId).HasDatabaseName("ix_invoices_patient_id");
        builder.HasIndex(i => i.BranchId).HasDatabaseName("ix_invoices_branch_id");
        builder.HasIndex(i => i.TestOrderId).HasDatabaseName("ix_invoices_test_order_id");
        builder.HasIndex(i => i.Status).HasDatabaseName("ix_invoices_status");

        builder.HasMany(i => i.Items)
            .WithOne(x => x.Invoice)
            .HasForeignKey(x => x.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class InvoiceItemConfiguration : AuditableEntityConfiguration<InvoiceItem>
{
    public override void Configure(EntityTypeBuilder<InvoiceItem> builder)
    {
        base.Configure(builder);

        builder.ToTable("invoice_items", "billing");

        builder.Property(i => i.Description).IsRequired().HasMaxLength(300);
        builder.Property(i => i.ItemType).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(i => i.Quantity).HasPrecision(18, 3);
        builder.Property(i => i.UnitPrice).HasPrecision(18, 3);
        builder.Property(i => i.DiscountAmount).HasPrecision(18, 3);
        builder.Property(i => i.TotalPrice).HasPrecision(18, 3);

        builder.HasIndex(i => i.InvoiceId).HasDatabaseName("ix_invoice_items_invoice_id");
    }
}
