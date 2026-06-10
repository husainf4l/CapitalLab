using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Organization;

public class Branch : AggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? NameAr { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public string? Address { get; private set; }
    public string? City { get; private set; }
    public string? Area { get; private set; }
    public decimal? Latitude { get; private set; }
    public decimal? Longitude { get; private set; }
    public TimeOnly? OpeningTime { get; private set; }
    public TimeOnly? ClosingTime { get; private set; }
    public bool IsMainBranch { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Branch() { }

    public static Branch Create(
        string code, string name, string? nameAr, string? phone, string? email,
        string? address, string? city, string? area,
        decimal? latitude, decimal? longitude,
        TimeOnly? openingTime, TimeOnly? closingTime,
        bool isMainBranch = false)
    {
        return new Branch
        {
            Id = Guid.NewGuid(),
            Code = code.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            NameAr = nameAr?.Trim(),
            Phone = phone?.Trim(),
            Email = email?.Trim().ToLowerInvariant(),
            Address = address?.Trim(),
            City = city?.Trim(),
            Area = area?.Trim(),
            Latitude = latitude,
            Longitude = longitude,
            OpeningTime = openingTime,
            ClosingTime = closingTime,
            IsMainBranch = isMainBranch,
            IsActive = true
        };
    }

    public void Update(
        string name, string? nameAr, string? phone, string? email,
        string? address, string? city, string? area,
        decimal? latitude, decimal? longitude,
        TimeOnly? openingTime, TimeOnly? closingTime,
        bool isMainBranch)
    {
        Name = name.Trim();
        NameAr = nameAr?.Trim();
        Phone = phone?.Trim();
        Email = email?.Trim().ToLowerInvariant();
        Address = address?.Trim();
        City = city?.Trim();
        Area = area?.Trim();
        Latitude = latitude;
        Longitude = longitude;
        OpeningTime = openingTime;
        ClosingTime = closingTime;
        IsMainBranch = isMainBranch;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
