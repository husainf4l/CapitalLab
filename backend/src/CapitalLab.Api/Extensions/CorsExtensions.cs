namespace CapitalLab.Api.Extensions;

public static class CorsExtensions
{
    public const string AngularPolicy = "AngularApp";
    public const string HangfireDashboardPolicy = "HangfireDashboard";

    public static IServiceCollection AddCapitalLabCors(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var allowedOrigins = configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? ["http://localhost:4200"];

        services.AddCors(options =>
        {
            options.AddPolicy(AngularPolicy, policy =>
                policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()  // required for SignalR
                    .WithExposedHeaders("Content-Disposition", "X-Total-Count"));

            options.AddPolicy(HangfireDashboardPolicy, policy =>
                policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
        });

        return services;
    }
}
