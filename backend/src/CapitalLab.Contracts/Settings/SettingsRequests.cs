namespace CapitalLab.Contracts.Settings;

public record UpsertSettingRequest(string Key, string Value, string Category, string? Description = null, bool IsPublic = false);
public record UpdateSettingRequest(string Value, string? Description = null);
