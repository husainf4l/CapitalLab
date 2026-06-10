using CapitalLab.Domain.Entities.Insurance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Insurance;

public class InsuranceProviderConfiguration : AuditableEntityConfiguration<InsuranceProvider>
{
    public override void Configure(EntityTypeBuilder<InsuranceProvider> builder)
    {
        base.Configure(builder);

        builder.ToTable("insurance_providers", "insurance");

        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Code).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Phone).HasMaxLength(30);
        builder.Property(p => p.Email).HasMaxLength(200);
        builder.Property(p => p.ContactPerson).HasMaxLength(200);

        builder.HasIndex(p => p.Code).IsUnique().HasDatabaseName("ix_insurance_providers_code");
        builder.HasIndex(p => p.IsActive).HasDatabaseName("ix_insurance_providers_active");
    }
}

public class InsuranceClaimConfiguration : AuditableEntityConfiguration<InsuranceClaim>
{
    public override void Configure(EntityTypeBuilder<InsuranceClaim> builder)
    {
        base.Configure(builder);

        builder.ToTable("insurance_claims", "insurance");

        builder.Property(c => c.ClaimNumber).IsRequired().HasMaxLength(30);
        builder.Property(c => c.Status).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(c => c.ClaimAmount).HasPrecision(18, 3);
        builder.Property(c => c.ApprovedAmount).HasPrecision(18, 3);
        builder.Property(c => c.RejectedAmount).HasPrecision(18, 3);
        builder.Property(c => c.SubmittedAt).HasColumnType("timestamptz");
        builder.Property(c => c.ApprovedAt).HasColumnType("timestamptz");
        builder.Property(c => c.RejectedAt).HasColumnType("timestamptz");
        builder.Property(c => c.PaidAt).HasColumnType("timestamptz");
        builder.Property(c => c.RejectionReason).HasMaxLength(1000);

        builder.HasIndex(c => c.ClaimNumber).IsUnique().HasDatabaseName("ix_insurance_claims_number");
        builder.HasIndex(c => c.PatientId).HasDatabaseName("ix_insurance_claims_patient_id");
        builder.HasIndex(c => c.InvoiceId).HasDatabaseName("ix_insurance_claims_invoice_id");
        builder.HasIndex(c => c.ProviderId).HasDatabaseName("ix_insurance_claims_provider_id");
        builder.HasIndex(c => c.Status).HasDatabaseName("ix_insurance_claims_status");
    }
}
