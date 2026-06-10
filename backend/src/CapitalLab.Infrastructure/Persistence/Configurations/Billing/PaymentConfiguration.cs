using CapitalLab.Domain.Entities.Billing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Billing;

public class PaymentConfiguration : AuditableEntityConfiguration<Payment>
{
    public override void Configure(EntityTypeBuilder<Payment> builder)
    {
        base.Configure(builder);

        builder.ToTable("payments", "billing");

        builder.Property(p => p.Amount).HasPrecision(18, 3);
        builder.Property(p => p.Currency).IsRequired().HasMaxLength(3);
        builder.Property(p => p.Method).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(p => p.Status).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(p => p.TransactionReference).HasMaxLength(100);
        builder.Property(p => p.PaidAt).HasColumnType("timestamptz");
        builder.Property(p => p.Notes).HasMaxLength(1000);

        builder.HasIndex(p => p.InvoiceId).HasDatabaseName("ix_payments_invoice_id");
        builder.HasIndex(p => p.PatientId).HasDatabaseName("ix_payments_patient_id");
        builder.HasIndex(p => p.BranchId).HasDatabaseName("ix_payments_branch_id");
        builder.HasIndex(p => p.Status).HasDatabaseName("ix_payments_status");
    }
}
