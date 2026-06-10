using System.Net;
using System.Text.Json;
using CapitalLab.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;
using ValidationException = CapitalLab.Application.Common.Exceptions.ValidationException;

namespace CapitalLab.Api.Middleware;

/// <summary>
/// Central exception handler. Converts all known exception types to RFC 7807 ProblemDetails.
/// Runs at the outermost middleware layer so every exception is caught.
/// </summary>
public sealed class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger,
    IHostEnvironment environment)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, problem) = exception switch
        {
            ValidationException ve => (
                HttpStatusCode.BadRequest,
                CreateValidationProblem(context, ve)),

            NotFoundException nfe => (
                HttpStatusCode.NotFound,
                CreateProblem(context, HttpStatusCode.NotFound, "Not Found", nfe.Message, "NOT_FOUND")),

            UnauthorizedException ue => (
                HttpStatusCode.Unauthorized,
                CreateProblem(context, HttpStatusCode.Unauthorized, "Unauthorized", ue.Message, "UNAUTHORIZED")),

            ForbiddenException fe => (
                HttpStatusCode.Forbidden,
                CreateProblem(context, HttpStatusCode.Forbidden, "Forbidden", fe.Message, "FORBIDDEN")),

            BusinessRuleException bre => (
                HttpStatusCode.UnprocessableEntity,
                CreateProblem(context, HttpStatusCode.UnprocessableEntity, "Business Rule Violation", bre.Message, bre.Code)),

            ConflictException ce => (
                HttpStatusCode.Conflict,
                CreateProblem(context, HttpStatusCode.Conflict, "Conflict", ce.Message, "CONFLICT")),

            _ => (
                HttpStatusCode.InternalServerError,
                CreateProblem(context, HttpStatusCode.InternalServerError, "Internal Server Error",
                    environment.IsDevelopment() ? exception.ToString() : "An unexpected error occurred.",
                    "INTERNAL_ERROR"))
        };

        if (exception is not (NotFoundException or ValidationException))
        {
            logger.LogError(exception,
                "Unhandled exception {ExceptionType}: {Message}",
                exception.GetType().Name, exception.Message);
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)statusCode;

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem, JsonOptions));
    }

    private static ProblemDetails CreateProblem(
        HttpContext context,
        HttpStatusCode status,
        string title,
        string detail,
        string errorCode)
    {
        return new ProblemDetails
        {
            Type = $"https://capitallab.io/errors/{errorCode.ToLowerInvariant().Replace('_', '-')}",
            Title = title,
            Status = (int)status,
            Detail = detail,
            Instance = context.Request.Path,
            Extensions =
            {
                ["traceId"] = context.TraceIdentifier,
                ["code"] = errorCode
            }
        };
    }

    private static ValidationProblemDetails CreateValidationProblem(
        HttpContext context,
        ValidationException ve)
    {
        return new ValidationProblemDetails(ve.Errors)
        {
            Type = "https://capitallab.io/errors/validation-failed",
            Title = "Validation Failed",
            Status = (int)HttpStatusCode.BadRequest,
            Detail = "One or more validation errors occurred.",
            Instance = context.Request.Path,
            Extensions =
            {
                ["traceId"] = context.TraceIdentifier,
                ["code"] = "VALIDATION_FAILED"
            }
        };
    }
}
