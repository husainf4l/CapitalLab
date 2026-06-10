using CapitalLab.Domain.Entities.People;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.People;

public class PatientFamilyMemberConfiguration : IEntityTypeConfiguration<PatientFamilyMember>
{
    public void Configure(EntityTypeBuilder<PatientFamilyMember> builder)
    {
        builder.ToTable("patient_family_members", "people");

        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).ValueGeneratedNever();

        builder.HasIndex(f => new { f.PrimaryPatientId, f.FamilyPatientId })
            .IsUnique()
            .HasDatabaseName("ix_patient_family_members_pair");

        builder.HasOne(f => f.PrimaryPatient)
            .WithMany(p => p.FamilyMembers)
            .HasForeignKey(f => f.PrimaryPatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.FamilyPatient)
            .WithMany()
            .HasForeignKey(f => f.FamilyPatientId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
