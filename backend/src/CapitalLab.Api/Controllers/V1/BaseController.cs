using Asp.Versioning;
using CapitalLab.Contracts.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

/// <summary>
/// Base controller for all V1 API endpoints.
/// Provides common response helpers and injects MediatR.
/// All endpoints require authentication by default; use [AllowAnonymous] to opt out.
/// </summary>
[ApiController]
[Authorize]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
public abstract class BaseController(IMediator mediator) : ControllerBase
{
    protected IMediator Mediator { get; } = mediator;

    protected IActionResult OkResponse<T>(T data, string? message = null) =>
        Ok(ApiResponse<T>.Ok(data, message));

    protected IActionResult OkPaged<T>(PagedResult<T> result) =>
        Ok(result);

    protected IActionResult CreatedResponse<T>(T data, string? location = null) =>
        location is not null
            ? Created(location, ApiResponse<T>.Ok(data))
            : StatusCode(201, ApiResponse<T>.Ok(data));

    protected IActionResult NoContentResponse() => NoContent();

    protected IActionResult FailResponse(string message, IEnumerable<string>? errors = null) =>
        BadRequest(ApiResponse.Fail(message, errors));
}
