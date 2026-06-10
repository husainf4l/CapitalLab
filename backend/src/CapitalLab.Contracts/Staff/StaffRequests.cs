namespace CapitalLab.Contracts.Staff;

public record CreateStaffRequest(
    Guid BranchId,
    string EmployeeCode,
    string FullName,
    string? JobTitle,
    string? Department,
    string? Phone,
    string? Email,
    DateOnly? HireDate,
    Guid? UserId);

public record UpdateStaffRequest(
    string FullName,
    string? JobTitle,
    string? Department,
    string? Phone,
    string? Email,
    DateOnly? HireDate,
    Guid? UserId);
