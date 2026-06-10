namespace CapitalLab.Contracts.Common;

public record PaginationRequest
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? SortBy { get; init; }
    public string SortDirection { get; init; } = "asc";
    public string? Search { get; init; }

    public int Skip => (Page - 1) * PageSize;
    public bool IsDescending => SortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);

    public PaginationRequest WithClampedPageSize(int max = 100) =>
        this with { PageSize = Math.Clamp(PageSize, 1, max) };
}
