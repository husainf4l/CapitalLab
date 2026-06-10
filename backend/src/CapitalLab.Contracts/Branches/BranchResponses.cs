namespace CapitalLab.Contracts.Branches;

public record BranchResponse(
    Guid Id,
    string Code,
    string Name,
    string? NameAr,
    string? Phone,
    string? Email,
    string? Address,
    string? City,
    string? Area,
    decimal? Latitude,
    decimal? Longitude,
    TimeOnly? OpeningTime,
    TimeOnly? ClosingTime,
    bool IsMainBranch,
    bool IsActive,
    DateTimeOffset CreatedAt);

public record BranchSummaryResponse(
    Guid Id,
    string Code,
    string Name,
    string? NameAr,
    string? City,
    bool IsMainBranch,
    bool IsActive);
