using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.People;

public class PatientFamilyMember : BaseEntity
{
    public Guid PrimaryPatientId { get; private set; }
    public Guid FamilyPatientId { get; private set; }
    public FamilyRelationship Relationship { get; private set; }

    // Navigation
    public Patient PrimaryPatient { get; private set; } = null!;
    public Patient FamilyPatient { get; private set; } = null!;

    private PatientFamilyMember() { }

    public static PatientFamilyMember Create(
        Guid primaryPatientId,
        Guid familyPatientId,
        FamilyRelationship relationship)
    {
        if (primaryPatientId == familyPatientId)
            throw new ArgumentException("A patient cannot be their own family member.");

        return new PatientFamilyMember
        {
            Id = Guid.NewGuid(),
            PrimaryPatientId = primaryPatientId,
            FamilyPatientId = familyPatientId,
            Relationship = relationship
        };
    }
}
