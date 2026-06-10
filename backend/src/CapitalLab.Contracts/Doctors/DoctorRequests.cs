namespace CapitalLab.Contracts.Doctors;

public record CreateDoctorRequest(
    Guid BranchId,
    string FullName,
    string? Specialization,
    string LicenseNumber,
    string? Phone,
    string? Email,
    bool IsReviewer,
    bool IsApprover,
    Guid? UserId);

public record UpdateDoctorRequest(
    string FullName,
    string? Specialization,
    string? Phone,
    string? Email,
    bool IsReviewer,
    bool IsApprover,
    Guid? UserId);
