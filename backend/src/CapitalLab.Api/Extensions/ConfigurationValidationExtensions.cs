namespace CapitalLab.Api.Extensions;

public static class ConfigurationValidationExtensions
{
    public static void ValidateProductionConfiguration(this WebApplicationBuilder builder)
    {
        if (!builder.Environment.IsProduction())
            return;

        var config = builder.Configuration;
        var missing = new List<string>();

        Require(config.GetConnectionString("DefaultConnection"), "ConnectionStrings:DefaultConnection", missing);
        Require(config.GetConnectionString("Redis"), "ConnectionStrings:Redis", missing);
        Require(config["Jwt:Issuer"], "Jwt:Issuer", missing);
        Require(config["Jwt:Audience"], "Jwt:Audience", missing);
        Require(config["Jwt:PrivateKeyBase64"], "Jwt:PrivateKeyBase64", missing);
        Require(config["Jwt:PublicKeyBase64"], "Jwt:PublicKeyBase64", missing);
        Require(config["Encryption:Key"], "Encryption:Key", missing);
        Require(config["Storage:LocalRootPath"], "Storage:LocalRootPath", missing);
        Require(config["Storage:BaseUrl"], "Storage:BaseUrl", missing);

        var origins = config.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        if (origins.Length == 0 || origins.Any(IsPlaceholder))
            missing.Add("Cors:AllowedOrigins");

        Require(config["Email:SmtpHost"], "Email:SmtpHost", missing);
        Require(config["Email:Username"], "Email:Username", missing);
        Require(config["Email:Password"], "Email:Password", missing);
        Require(config["Sms:ApiKey"], "Sms:ApiKey", missing);
        Require(config["WhatsApp:ApiKey"], "WhatsApp:ApiKey", missing);
        Require(config["Push:ApiKey"], "Push:ApiKey", missing);
        Require(config["Pdf:StoragePath"], "Pdf:StoragePath", missing);

        if (missing.Count > 0)
        {
            throw new InvalidOperationException(
                "Production configuration is incomplete or contains placeholder values: "
                + string.Join(", ", missing.Distinct().OrderBy(x => x)));
        }
    }

    private static void Require(string? value, string key, ICollection<string> missing)
    {
        if (string.IsNullOrWhiteSpace(value) || IsPlaceholder(value))
            missing.Add(key);
    }

    private static bool IsPlaceholder(string value)
    {
        var normalized = value.Trim();
        return normalized.Contains("CHANGE_ME", StringComparison.OrdinalIgnoreCase)
            || normalized.Contains("REPLACE_WITH", StringComparison.OrdinalIgnoreCase)
            || normalized.Contains("example.com", StringComparison.OrdinalIgnoreCase);
    }
}
