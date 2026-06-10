namespace CapitalLab.Contracts.Branches;

public record CreateBranchRequest(
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
    bool IsMainBranch = false);

public record UpdateBranchRequest(
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
    bool IsMainBranch = false);
