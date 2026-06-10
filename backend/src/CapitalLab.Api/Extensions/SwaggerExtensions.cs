using System.Reflection;
using Asp.Versioning.ApiExplorer;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace CapitalLab.Api.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Capital Lab API",
                Version = "v1",
                Description = "Capital Lab — Laboratory Information System REST API",
                Contact = new OpenApiContact
                {
                    Name = "Capital Lab",
                    Email = "support@capitallab.io"
                }
            });

            // JWT Bearer auth in Swagger UI
            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "Enter JWT Bearer token: **Bearer {token}**",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            };

            options.AddSecurityDefinition("Bearer", securityScheme);
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                { securityScheme, [] }
            });

            // Include XML documentation comments
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
                options.IncludeXmlComments(xmlPath);

            options.CustomSchemaIds(type => type.FullName?.Replace('+', '.'));
            options.EnableAnnotations();
        });

        return services;
    }

    public static WebApplication UseSwaggerDocumentation(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment()) return app;

        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Capital Lab API v1");
            options.RoutePrefix = "swagger";
            options.DocumentTitle = "Capital Lab API";
            options.DisplayRequestDuration();
            options.EnableTryItOutByDefault();
        });

        return app;
    }
}
