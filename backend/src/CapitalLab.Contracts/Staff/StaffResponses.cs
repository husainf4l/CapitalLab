namespace CapitalLab.Contracts.Staff;

public record StaffResponse(
    Guid Id,
    Guid? UserId,
    Guid BranchId,
    string BranchName,
    string EmployeeCode,
    string FullName,
    string? JobTitle,
    string? Department,
    string? Phone,
    string? Email,
    DateOnly? HireDate,
    bool IsActive,
    DateTimeOffset CreatedAt);

public record StaffSummaryResponse(
    Guid Id,
    string EmployeeCode,
    string FullName,
    string? JobTitle,
    string? Department,
    bool IsActive);
