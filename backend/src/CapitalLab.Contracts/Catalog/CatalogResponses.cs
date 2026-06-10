using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Catalog;

// ── Test Categories ──────────────────────────────────────────────────────────
public record TestCategoryResponse(
    Guid Id,
    string Code,
    string Name,
    string? NameAr,
    string? Description,
    int SortOrder,
    bool IsActive,
    int TestCount);

public record TestCategorySummaryResponse(
    Guid Id,
    string Code,
    string Name,
    string? NameAr,
    int SortOrder,
    bool IsActive);

// ── Lab Tests ────────────────────────────────────────────────────────────────
public record LabTestResponse(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
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
    bool IsHomeCollectionAvailable,
    bool IsActive);

public record LabTestSummaryResponse(
    Guid Id,
    string Code,
    string Name,
    string? NameAr,
    string CategoryName,
    SampleType SampleType,
    decimal Price,
    string Currency,
    bool IsActive);

// ── Health Packages ───────────────────────────────────────────────────────────
public record HealthPackageResponse(
    Guid Id,
    string Code,
    string Name,
    string? NameAr,
    string? Description,
    decimal Price,
    string Currency,
    decimal DiscountPercentage,
    decimal EffectivePrice,
    bool IsPopular,
    bool IsActive,
    List<LabTestSummaryResponse> Tests);

public record HealthPackageSummaryResponse(
    Guid Id,
    string Code,
    string Name,
    string? NameAr,
    decimal Price,
    decimal DiscountPercentage,
    decimal EffectivePrice,
    bool IsPopular,
    bool IsActive,
    int TestCount);

public record PackagePriceBreakdownResponse(
    Guid PackageId,
    string PackageName,
    decimal PackagePrice,
    decimal DiscountPercentage,
    decimal EffectivePrice,
    decimal IndividualTestsTotal,
    decimal Savings,
    string Currency,
    List<TestPriceLineItem> Tests);

public record TestPriceLineItem(
    Guid TestId,
    string TestCode,
    string TestName,
    decimal UnitPrice,
    string Currency);
