using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Domain.Interfaces;
using CapitalLab.Infrastructure.BackgroundJobs.Jobs;
using CapitalLab.Infrastructure.Persistence.Seed;
using CapitalLab.Infrastructure.Identity;
using CapitalLab.Infrastructure.Persistence;
using CapitalLab.Infrastructure.Persistence.Interceptors;
using CapitalLab.Infrastructure.Persistence.Repositories;
using CapitalLab.Infrastructure.Services;
using CapitalLab.Infrastructure.Services.NumberGeneration;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;

namespace CapitalLab.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddDatabase(configuration)
            .AddIdentityServices()
            .AddJwtAuthentication(configuration)
            .AddCaching(configuration)
            .AddBackgroundJobs(configuration)
            .AddApplicationServices();

        return services;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Database
    // ──────────────────────────────────────────────────────────────────────────
    private static IServiceCollection AddDatabase(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Scoped: AuditableEntityInterceptor depends on the scoped ICurrentUserService,
        // and the DbContext that consumes both interceptors is itself scoped.
        services.AddScoped<AuditableEntityInterceptor>();
        services.AddScoped<SoftDeleteInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql =>
                {
                    npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    npgsql.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorCodesToAdd: null);
                });

            options.UseSnakeCaseNamingConvention();
        });

        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<ApplicationDbContext>());

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));

        return services;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ASP.NET Core Identity
    // ──────────────────────────────────────────────────────────────────────────
    private static IServiceCollection AddIdentityServices(this IServiceCollection services)
    {
        services
            .AddIdentityCore<AppUser>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 8;
                options.User.RequireUniqueEmail = true;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;
            })
            .AddRoles<AppRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        return services;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // JWT Authentication (RS256)
    // ──────────────────────────────────────────────────────────────────────────
    private static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSettings = configuration
            .GetSection(JwtSettings.SectionName)
            .Get<JwtSettings>()
            ?? throw new InvalidOperationException("JwtSettings are not configured.");

        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.AddScoped<ITokenService, TokenService>();

        using var rsa = RSA.Create();
        rsa.ImportFromPem(Encoding.UTF8.GetString(Convert.FromBase64String(jwtSettings.PublicKeyBase64)));
        var publicKey = new RsaSecurityKey(rsa.ExportParameters(false));

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = publicKey,
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30),
                NameClaimType = "name",
                RoleClaimType = System.Security.Claims.ClaimTypes.Role,
            };

            // Support JWT in SignalR query string
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                        context.Token = accessToken;
                    return Task.CompletedTask;
                }
            };
        });

        return services;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Redis Caching
    // ──────────────────────────────────────────────────────────────────────────
    private static IServiceCollection AddCaching(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var redisConnection = configuration.GetConnectionString("Redis");

        if (!string.IsNullOrWhiteSpace(redisConnection))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnection;
                options.InstanceName = "capitallab:";
            });
        }
        else
        {
            // Fallback to in-memory cache for development without Redis
            services.AddDistributedMemoryCache();
        }

        services.AddScoped<ICacheService, RedisCacheService>();

        return services;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Hangfire Background Jobs
    // ──────────────────────────────────────────────────────────────────────────
    private static IServiceCollection AddBackgroundJobs(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var pgConnection = configuration.GetConnectionString("DefaultConnection")!;

        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(options => options.UseNpgsqlConnection(pgConnection)));

        services.AddHangfireServer(options =>
        {
            options.WorkerCount = Environment.ProcessorCount * 2;
            options.Queues = ["default", "critical", "low"];
        });

        // Register job classes for DI-based execution
        services.AddTransient<CleanupExpiredTokensJob>();
        services.AddTransient<InventoryAlertsJob>();
        services.AddTransient<AppointmentReminderJob>();

        return services;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Application Services
    // ──────────────────────────────────────────────────────────────────────────
    private static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();

        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddSingleton<IDateTimeService, DateTimeService>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IEncryptionService, EncryptionService>();
        services.AddScoped<IPatientNumberService, PatientNumberService>();
        services.AddScoped<IAppointmentNumberService, AppointmentNumberService>();
        services.AddScoped<IOrderNumberService, OrderNumberService>();
        services.AddScoped<ISampleNumberService, SampleNumberService>();
        services.AddScoped<IReportNumberService, ReportNumberService>();
        services.AddScoped<IPurchaseOrderNumberService, PurchaseOrderNumberService>();
        services.AddScoped<IInvoiceNumberService, InvoiceNumberService>();
        services.AddScoped<IClaimNumberService, ClaimNumberService>();
        services.AddSingleton<IBarcodeService, Services.Laboratory.BarcodeService>();
        services.AddSingleton<IQrCodeService, Services.Laboratory.QrCodeService>();
        services.AddScoped<IAuthService, Services.AuthService>();
        services.AddScoped<DataSeeder>();

        return services;
    }
}
