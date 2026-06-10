using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.People;

public class StaffProfile : AggregateRoot
{
    public Guid? UserId { get; private set; }
    public Guid BranchId { get; private set; }
    public string EmployeeCode { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public string? JobTitle { get; private set; }
    public string? Department { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public DateOnly? HireDate { get; private set; }
    public bool IsActive { get; private set; } = true;

    private StaffProfile() { }

    public static StaffProfile Create(
        Guid branchId, string employeeCode, string fullName,
        string? jobTitle, string? department,
        string? phone, string? email,
        DateOnly? hireDate, Guid? userId = null)
    {
        return new StaffProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BranchId = branchId,
            EmployeeCode = employeeCode.Trim().ToUpperInvariant(),
            FullName = fullName.Trim(),
            JobTitle = jobTitle?.Trim(),
            Department = department?.Trim(),
            Phone = phone?.Trim(),
            Email = email?.Trim().ToLowerInvariant(),
            HireDate = hireDate,
            IsActive = true
        };
    }

    public void Update(
        string fullName, string? jobTitle, string? department,
        string? phone, string? email, DateOnly? hireDate, Guid? userId)
    {
        FullName = fullName.Trim();
        JobTitle = jobTitle?.Trim();
        Department = department?.Trim();
        Phone = phone?.Trim();
        Email = email?.Trim().ToLowerInvariant();
        HireDate = hireDate;
        UserId = userId;
    }

    public void AssignToBranch(Guid branchId) => BranchId = branchId;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
