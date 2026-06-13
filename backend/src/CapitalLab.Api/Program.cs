using Asp.Versioning;
using CapitalLab.Api.Extensions;
using CapitalLab.Api.Hubs;
using CapitalLab.Api.Middleware;
using CapitalLab.Application;
using CapitalLab.Infrastructure;
using CapitalLab.Infrastructure.BackgroundJobs;
using CapitalLab.Infrastructure.Persistence.Seed;
using Hangfire;
using Hangfire.Dashboard;
using Microsoft.EntityFrameworkCore;
using Serilog;

// ─── Bootstrap Logger ────────────────────────────────────────────────────────
// Configure a minimal logger before the host is built so startup errors are captured.
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Capital Lab API");

    var builder = WebApplication.CreateEmptyBuilder(new WebApplicationOptions
    {
        Args = args,
        ContentRootPath = AppContext.BaseDirectory,
        EnvironmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
            ?? (AppDomain.CurrentDomain.GetAssemblies()
                .Any(assembly => assembly.GetName().Name == "Microsoft.AspNetCore.Mvc.Testing")
                ? "Testing"
                : null)
            ?? Environments.Production,
        ApplicationName = typeof(Program).Assembly.FullName
    });
    builder.Configuration
        .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
        .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: false)
        .AddEnvironmentVariables()
        .AddCommandLine(args);
    builder.Logging.AddConsole();
    builder.WebHost.UseKestrel();
    var configuredUrls = builder.Configuration["ASPNETCORE_URLS"] ?? builder.Configuration["urls"];
    if (!string.IsNullOrWhiteSpace(configuredUrls))
        builder.WebHost.UseUrls(configuredUrls);

    // ─── Serilog ─────────────────────────────────────────────────────────────
    if (!builder.Environment.IsEnvironment("Testing"))
    {
        builder.Host.UseSerilog((context, services, config) =>
        {
            config
                .ReadFrom.Configuration(context.Configuration)
                .ReadFrom.Services(services)
                .Enrich.FromLogContext()
                .Enrich.WithMachineName()
                .Enrich.WithEnvironmentName()
                .Enrich.WithThreadId()
                .Enrich.WithProcessId();
        });
    }

    // ─── Application & Infrastructure ────────────────────────────────────────
    builder.ValidateProductionConfiguration();
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);

    // ─── API Controllers ─────────────────────────────────────────────────────
    builder.Services
        .AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.DefaultIgnoreCondition =
                System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        });

    // ─── API Versioning ───────────────────────────────────────────────────────
    builder.Services
        .AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
        })
        .AddApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        });

    // ─── CORS ────────────────────────────────────────────────────────────────
    builder.Services.AddCapitalLabCors(builder.Configuration);

    // ─── SignalR ─────────────────────────────────────────────────────────────
    builder.Services.AddSignalR(options =>
    {
        options.EnableDetailedErrors = builder.Environment.IsDevelopment();
        options.MaximumReceiveMessageSize = 64 * 1024; // 64 KB
    });

    // ─── Swagger / OpenAPI ───────────────────────────────────────────────────
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerDocumentation();

    // ─── Health Checks ───────────────────────────────────────────────────────
    builder.Services.AddCapitalLabHealthChecks(builder.Configuration);

    // ─── Rate Limiting ───────────────────────────────────────────────────────
    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

        // Global sliding window: 200 requests / 10 seconds per IP
        options.AddPolicy("global", context =>
            System.Threading.RateLimiting.RateLimitPartition.GetSlidingWindowLimiter(
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "anon",
                factory: _ => new System.Threading.RateLimiting.SlidingWindowRateLimiterOptions
                {
                    PermitLimit = 200,
                    Window = TimeSpan.FromSeconds(10),
                    SegmentsPerWindow = 5
                }));

        // Strict window for auth endpoints: 10 requests / minute per IP
        options.AddPolicy("auth", context =>
            System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "anon",
                factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
                {
                    PermitLimit = 10,
                    Window = TimeSpan.FromMinutes(1)
                }));
    });

    // ─── Problem Details ─────────────────────────────────────────────────────
    builder.Services.AddProblemDetails();

    // ─── Response Compression ────────────────────────────────────────────────
    builder.Services.AddResponseCompression(options =>
    {
        options.EnableForHttps = true;
        options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
        options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
    });

    // ─── Build App ───────────────────────────────────────────────────────────
    var app = builder.Build();

    // ─── Explicit Demo Data Command ──────────────────────────────────────────
    if (args.Contains("--seed-demo-data", StringComparer.OrdinalIgnoreCase))
    {
        using var seedScope = app.Services.CreateScope();
        var dbContext = seedScope.ServiceProvider
            .GetRequiredService<CapitalLab.Infrastructure.Persistence.ApplicationDbContext>();

        await dbContext.Database.MigrateAsync();
        await seedScope.ServiceProvider.GetRequiredService<DataSeeder>().SeedAsync();
        await seedScope.ServiceProvider.GetRequiredService<DemoDataSeeder>().SeedAsync();

        Log.Information("Demo data seeding completed");
        return;
    }

    // ─── Auto-migrate database on startup ────────────────────────────────────
    var skipStartupMigrations = string.Equals(
        Environment.GetEnvironmentVariable("CAPITALLAB_SKIP_MIGRATIONS"),
        "true",
        StringComparison.OrdinalIgnoreCase);

    if (!skipStartupMigrations && (app.Environment.IsDevelopment() || app.Environment.IsStaging()))
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider
            .GetRequiredService<CapitalLab.Infrastructure.Persistence.ApplicationDbContext>();
        await dbContext.Database.MigrateAsync();
        Log.Information("Database migrations applied successfully");

        var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
        await seeder.SeedAsync();
        Log.Information("Database seeding completed");
    }

    // ─── Middleware Pipeline ─────────────────────────────────────────────────
    app.UseMiddleware<GlobalExceptionMiddleware>();
    app.UseMiddleware<SecurityHeadersMiddleware>();

    var hangfireDisabled = string.Equals(
        Environment.GetEnvironmentVariable("CAPITALLAB_DISABLE_HANGFIRE_SERVER"),
        "true",
        StringComparison.OrdinalIgnoreCase);

    if (!app.Environment.IsEnvironment("Testing") && !hangfireDisabled)
    {
        app.UseSerilogRequestLogging(options =>
        {
            options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
            options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
            {
                diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
                diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent);
                diagnosticContext.Set("UserId",
                    httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "anon");
            };
        });
    }

    app.UseResponseCompression();

    if (app.Environment.IsDevelopment())
        app.UseSwaggerDocumentation();

    app.UseRouting();
    app.UseCors(CorsExtensions.AngularPolicy);
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();
    app.UseMiddleware<AuditMiddleware>();

    // ─── Endpoints ───────────────────────────────────────────────────────────
    app.MapControllers();

    // SignalR hubs
    app.MapHub<NotificationHub>("/hubs/notifications");
    app.MapHub<DashboardHub>("/hubs/lab");

    // Health checks
    app.MapCapitalLabHealthChecks();

    if (!app.Environment.IsEnvironment("Testing") && !hangfireDisabled)
    {
        // Hangfire dashboard (SuperAdmin only in production)
        app.UseHangfireDashboard("/hangfire", new DashboardOptions
        {
            Authorization = [new HangfireDashboardAuthorizationFilter()],
            DashboardTitle = "Capital Lab — Background Jobs",
            DarkModeEnabled = true
        });

        // ─── Register Recurring Jobs ─────────────────────────────────────────
        HangfireJobService.RegisterRecurringJobs(
            app.Services.GetRequiredService<ILogger<Program>>());
    }

    await app.RunAsync();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Capital Lab API terminated unexpectedly");
    throw;
}
finally
{
    Log.CloseAndFlush();
}

/// <summary>
/// Hangfire dashboard authorization — restricts access to SuperAdmin role in non-development environments.
/// </summary>
internal sealed class HangfireDashboardAuthorizationFilter : Hangfire.Dashboard.IDashboardAuthorizationFilter
{
    public bool Authorize(Hangfire.Dashboard.DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        if (httpContext.RequestServices.GetRequiredService<IHostEnvironment>().IsDevelopment())
            return true;

        return httpContext.User.Identity?.IsAuthenticated == true
               && httpContext.User.IsInRole("SuperAdmin");
    }
}
