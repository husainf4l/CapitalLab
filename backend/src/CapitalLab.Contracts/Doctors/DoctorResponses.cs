namespace CapitalLab.Contracts.Doctors;

public record DoctorResponse(
    Guid Id,
    Guid? UserId,
    Guid BranchId,
    string BranchName,
    string FullName,
    string? Specialization,
    string LicenseNumber,
    string? Phone,
    string? Email,
    string? DigitalSignatureUrl,
    bool IsReviewer,
    bool IsApprover,
    bool IsActive,
    DateTimeOffset CreatedAt);

public record DoctorSummaryResponse(
    Guid Id,
    string FullName,
    string? Specialization,
    string LicenseNumber,
    bool IsReviewer,
    bool IsApprover,
    bool IsActive);
