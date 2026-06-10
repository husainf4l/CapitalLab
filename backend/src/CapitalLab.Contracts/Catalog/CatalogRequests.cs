using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Catalog;

// ── Test Categories ──────────────────────────────────────────────────────────
public record CreateTestCategoryRequest(
    string Code,
    string Name,
    string? NameAr,
    string? Description,
    int SortOrder = 0);

public record UpdateTestCategoryRequest(
    string Name,
    string? NameAr,
    string? Description,
    int SortOrder = 0);

// ── Lab Tests ────────────────────────────────────────────────────────────────
public record CreateLabTestRequest(
    Guid CategoryId,
    string Code,
    string Name,
    string? NameAr,
    string? Description,
    SampleType SampleType,
    string? PreparationInstructions,
    int TurnaroundTimeHours,
    decimal Price,
    string Currency,
    string? ReferenceRange,
    string? Unit,
    bool IsFastingRequired,
    bool IsHomeCollectionAvailable);

public record UpdateLabTestRequest(
    Guid CategoryId,
    string Name,
    string? NameAr,
    string? Description,
    SampleType SampleType,
    string? PreparationInstructions,
    int TurnaroundTimeHours,
    decimal Price,
    string Currency,
    string? ReferenceRange,
    string? Unit,
    bool IsFastingRequired,
    bool IsHomeCollectionAvailable);

// ── Health Packages ───────────────────────────────────────────────────────────
public record CreateHealthPackageRequest(
    string Code,
    string Name,
    string? NameAr,
    string? Description,
    decimal Price,
    string Currency,
    decimal DiscountPercentage,
    bool IsPopular,
    List<Guid>? TestIds);

public record UpdateHealthPackageRequest(
    string Name,
    string? NameAr,
    string? Description,
    decimal Price,
    string Currency,
    decimal DiscountPercentage,
    bool IsPopular);

public record AddTestToPackageRequest(Guid LabTestId);
