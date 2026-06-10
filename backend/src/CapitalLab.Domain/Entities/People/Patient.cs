using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.People;

public class Patient : AggregateRoot
{
    public string PatientNumber { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string? NameAr { get; private set; }
    public Gender Gender { get; private set; }
    public DateOnly DateOfBirth { get; private set; }
    public string? NationalId { get; private set; }        // stored encrypted
    public string? PassportNumber { get; private set; }    // stored encrypted
    public string Phone { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? Address { get; private set; }
    public string? City { get; private set; }
    public string? Area { get; private set; }
    public string? EmergencyContactName { get; private set; }
    public string? EmergencyContactPhone { get; private set; }
    public string? InsuranceProvider { get; private set; }
    public string? InsuranceNumber { get; private set; }   // stored encrypted
    public string? MedicalHistory { get; private set; }
    public string? Allergies { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation
    public ICollection<PatientFamilyMember> FamilyMembers { get; private set; } = [];

    public int Age => CalculateAge();

    private Patient() { }

    public static Patient Create(
        string patientNumber, string firstName, string lastName, string? nameAr,
        Gender gender, DateOnly dateOfBirth,
        string? nationalId, string? passportNumber,
        string phone, string? email,
        string? address, string? city, string? area,
        string? emergencyContactName, string? emergencyContactPhone,
        string? insuranceProvider, string? insuranceNumber,
        string? medicalHistory, string? allergies)
    {
        return new Patient
        {
            Id = Guid.NewGuid(),
            PatientNumber = patientNumber,
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            NameAr = nameAr?.Trim(),
            Gender = gender,
            DateOfBirth = dateOfBirth,
            NationalId = nationalId?.Trim(),
            PassportNumber = passportNumber?.Trim(),
            Phone = phone.Trim(),
            Email = email?.Trim().ToLowerInvariant(),
            Address = address?.Trim(),
            City = city?.Trim(),
            Area = area?.Trim(),
            EmergencyContactName = emergencyContactName?.Trim(),
            EmergencyContactPhone = emergencyContactPhone?.Trim(),
            InsuranceProvider = insuranceProvider?.Trim(),
            InsuranceNumber = insuranceNumber?.Trim(),
            MedicalHistory = medicalHistory?.Trim(),
            Allergies = allergies?.Trim(),
            IsActive = true
        };
    }

    public void Update(
        string firstName, string lastName, string? nameAr,
        Gender gender, DateOnly dateOfBirth,
        string? nationalId, string? passportNumber,
        string phone, string? email,
        string? address, string? city, string? area,
        string? emergencyContactName, string? emergencyContactPhone,
        string? insuranceProvider, string? insuranceNumber,
        string? medicalHistory, string? allergies)
    {
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        NameAr = nameAr?.Trim();
        Gender = gender;
        DateOfBirth = dateOfBirth;
        NationalId = nationalId?.Trim();
        PassportNumber = passportNumber?.Trim();
        Phone = phone.Trim();
        Email = email?.Trim().ToLowerInvariant();
        Address = address?.Trim();
        City = city?.Trim();
        Area = area?.Trim();
        EmergencyContactName = emergencyContactName?.Trim();
        EmergencyContactPhone = emergencyContactPhone?.Trim();
        InsuranceProvider = insuranceProvider?.Trim();
        InsuranceNumber = insuranceNumber?.Trim();
        MedicalHistory = medicalHistory?.Trim();
        Allergies = allergies?.Trim();
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    private int CalculateAge()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var age = today.Year - DateOfBirth.Year;
        if (DateOfBirth > today.AddYears(-age)) age--;
        return age;
    }
}
