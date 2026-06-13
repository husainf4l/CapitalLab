using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Settings;

public class SystemSetting : AuditableEntity
{
    public string Key { get; private set; } = string.Empty;
    public string Value { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public bool IsPublic { get; private set; }

    private SystemSetting() { }

    public static SystemSetting Create(string key, string value, string category, string? description = null, bool isPublic = false)
    {
        return new SystemSetting
        {
            Id = Guid.NewGuid(),
            Key = key,
            Value = value,
            Category = category,
            Description = description,
            IsPublic = isPublic
        };
    }

    public void UpdateValue(string value) => Value = value;
    public void Update(string value, string? description) { Value = value; Description = description; }
}
