using CapitalLab.Domain.Entities.People;
using CapitalLab.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.People;

public class PatientConfiguration : AuditableEntityConfiguration<Patient>
{
    public override void Configure(EntityTypeBuilder<Patient> builder)
    {
        base.Configure(builder);

        builder.ToTable("patients", "people");

        builder.Property(p => p.PatientNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.NameAr)
            .HasMaxLength(200);

        builder.Property(p => p.NationalId)
            .HasMaxLength(500);   // encrypted ciphertext

        builder.Property(p => p.PassportNumber)
            .HasMaxLength(500);

        builder.Property(p => p.Phone)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(p => p.Email)
            .HasMaxLength(150);

        builder.Property(p => p.Address)
            .HasMaxLength(300);

        builder.Property(p => p.City)
            .HasMaxLength(100);

        builder.Property(p => p.Area)
            .HasMaxLength(100);

        builder.Property(p => p.EmergencyContactName)
            .HasMaxLength(200);

        builder.Property(p => p.EmergencyContactPhone)
            .HasMaxLength(30);

        builder.Property(p => p.InsuranceProvider)
            .HasMaxLength(150);

        builder.Property(p => p.InsuranceNumber)
            .HasMaxLength(500);

        builder.Ignore(p => p.Age);

        builder.HasIndex(p => p.PatientNumber)
            .IsUnique()
            .HasDatabaseName("ix_patients_patient_number");

        builder.HasIndex(p => p.Phone)
            .HasDatabaseName("ix_patients_phone");

        builder.HasIndex(p => new { p.FirstName, p.LastName })
            .HasDatabaseName("ix_patients_name");

        builder.HasIndex(p => p.IsActive)
            .HasDatabaseName("ix_patients_is_active");

        builder.HasMany(p => p.FamilyMembers)
            .WithOne(f => f.PrimaryPatient)
            .HasForeignKey(f => f.PrimaryPatientId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
