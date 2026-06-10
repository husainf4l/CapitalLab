using CapitalLab.Domain.Entities.Operations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Operations;

public class AppointmentStatusHistoryConfiguration : IEntityTypeConfiguration<AppointmentStatusHistory>
{
    public void Configure(EntityTypeBuilder<AppointmentStatusHistory> builder)
    {
        builder.ToTable("appointment_status_history", "operations");
        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).ValueGeneratedNever();
        builder.Property(h => h.OldStatus).HasConversion<string>().IsRequired().HasMaxLength(30);
        builder.Property(h => h.NewStatus).HasConversion<string>().IsRequired().HasMaxLength(30);
        builder.Property(h => h.ChangedAt).IsRequired().HasColumnType("timestamptz");
        builder.Property(h => h.Reason).HasMaxLength(1000);
        builder.Property(h => h.RowVersion).IsRowVersion().IsConcurrencyToken();
        builder.HasIndex(h => h.AppointmentId).HasDatabaseName("ix_appointment_status_history_appointment_id");
    }
}
