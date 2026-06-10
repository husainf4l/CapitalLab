using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Insurance;

public class InsuranceProvider : AggregateRoot
{
    public string Name { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public string? ContactPerson { get; private set; }
    public bool IsActive { get; private set; } = true;

    private InsuranceProvider() { }

    public static InsuranceProvider Create(
        string name,
        string code,
        string? phone,
        string? email,
        string? contactPerson)
    {
        return new InsuranceProvider
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Code = code.Trim().ToUpperInvariant(),
            Phone = phone?.Trim(),
            Email = email?.Trim(),
            ContactPerson = contactPerson?.Trim(),
            IsActive = true
        };
    }

    public void Update(string name, string? phone, string? email, string? contactPerson)
    {
        Name = name.Trim();
        Phone = phone?.Trim();
        Email = email?.Trim();
        ContactPerson = contactPerson?.Trim();
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
