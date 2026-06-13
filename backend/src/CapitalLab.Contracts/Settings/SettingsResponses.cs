namespace CapitalLab.Contracts.Settings;

public record SystemSettingResponse(
    Guid Id,
    string Key,
    string Value,
    string Category,
    string? Description,
    bool IsPublic);

public record SettingsCategoryResponse(string Category, List<SystemSettingResponse> Settings);
