using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Patients;

public record PatientResponse(
    Guid Id,
    string PatientNumber,
    string FirstName,
    string LastName,
    string? NameAr,
    string FullName,
    Gender Gender,
    DateOnly DateOfBirth,
    int Age,
    string Phone,
    string? Email,
    string? Address,
    string? City,
    string? Area,
    string? EmergencyContactName,
    string? EmergencyContactPhone,
    string? InsuranceProvider,
    string? MedicalHistory,
    string? Allergies,
    bool IsActive,
    DateTimeOffset CreatedAt);

public record PatientSummaryResponse(
    Guid Id,
    string PatientNumber,
    string FullName,
    Gender Gender,
    DateOnly DateOfBirth,
    int Age,
    string Phone,
    bool IsActive);

public record FamilyMemberResponse(
    Guid Id,
    Guid FamilyPatientId,
    string FullName,
    string PatientNumber,
    FamilyRelationship Relationship);
