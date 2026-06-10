namespace CapitalLab.Contracts.Common;

public sealed class PagedResult<T>
{
    public List<T> Items { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;

    public static PagedResult<T> Create(List<T> items, int totalCount, int page, int pageSize) =>
        new() { Items = items, TotalCount = totalCount, Page = page, PageSize = pageSize };

    public static PagedResult<T> Empty(int page = 1, int pageSize = 20) =>
        new() { Items = [], TotalCount = 0, Page = page, PageSize = pageSize };

    public PagedResult<TOut> Map<TOut>(Func<T, TOut> mapper) =>
        new()
        {
            Items = Items.Select(mapper).ToList(),
            TotalCount = TotalCount,
            Page = Page,
            PageSize = PageSize
        };
}
