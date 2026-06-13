using CapitalLab.Domain.Entities.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Audit;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs", "audit");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedNever();
        builder.Property(a => a.EntityType).IsRequired().HasMaxLength(200);
        builder.Property(a => a.Action).IsRequired().HasMaxLength(50);
        builder.Property(a => a.UserEmail).HasMaxLength(200);
        builder.Property(a => a.IpAddress).HasMaxLength(45);
        builder.Property(a => a.OldValues).HasColumnType("jsonb");
        builder.Property(a => a.NewValues).HasColumnType("jsonb");
        builder.Property(a => a.AdditionalData).HasColumnType("jsonb");
        builder.Property(a => a.OccurredAt).HasColumnType("timestamptz").IsRequired();

        builder.HasIndex(a => a.EntityType);
        builder.HasIndex(a => a.UserId);
        builder.HasIndex(a => a.OccurredAt);
    }
}
