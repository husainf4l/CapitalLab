using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Patients;

public record CreatePatientRequest(
    string FirstName,
    string LastName,
    string? NameAr,
    Gender Gender,
    DateOnly DateOfBirth,
    string? NationalId,
    string? PassportNumber,
    string Phone,
    string? Email,
    string? Address,
    string? City,
    string? Area,
    string? EmergencyContactName,
    string? EmergencyContactPhone,
    string? InsuranceProvider,
    string? InsuranceNumber,
    string? MedicalHistory,
    string? Allergies);

public record UpdatePatientRequest(
    string FirstName,
    string LastName,
    string? NameAr,
    Gender Gender,
    DateOnly DateOfBirth,
    string? NationalId,
    string? PassportNumber,
    string Phone,
    string? Email,
    string? Address,
    string? City,
    string? Area,
    string? EmergencyContactName,
    string? EmergencyContactPhone,
    string? InsuranceProvider,
    string? InsuranceNumber,
    string? MedicalHistory,
    string? Allergies);

public record AddFamilyMemberRequest(
    Guid FamilyPatientId,
    FamilyRelationship Relationship);
