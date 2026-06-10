using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.People;

public class Doctor : AggregateRoot
{
    public Guid? UserId { get; private set; }
    public Guid BranchId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string? Specialization { get; private set; }
    public string LicenseNumber { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public string? DigitalSignatureUrl { get; private set; }
    public bool IsReviewer { get; private set; }
    public bool IsApprover { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Doctor() { }

    public static Doctor Create(
        Guid branchId, string fullName, string? specialization,
        string licenseNumber, string? phone, string? email,
        bool isReviewer = false, bool isApprover = false,
        Guid? userId = null)
    {
        return new Doctor
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BranchId = branchId,
            FullName = fullName.Trim(),
            Specialization = specialization?.Trim(),
            LicenseNumber = licenseNumber.Trim(),
            Phone = phone?.Trim(),
            Email = email?.Trim().ToLowerInvariant(),
            IsReviewer = isReviewer,
            IsApprover = isApprover,
            IsActive = true
        };
    }

    public void Update(
        string fullName, string? specialization,
        string? phone, string? email,
        bool isReviewer, bool isApprover, Guid? userId)
    {
        FullName = fullName.Trim();
        Specialization = specialization?.Trim();
        Phone = phone?.Trim();
        Email = email?.Trim().ToLowerInvariant();
        IsReviewer = isReviewer;
        IsApprover = isApprover;
        UserId = userId;
    }

    public void SetDigitalSignature(string url) => DigitalSignatureUrl = url;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
