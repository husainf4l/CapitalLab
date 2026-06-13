using CapitalLab.Application.Features.Audit.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class AuditController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] Guid? userId = null,
        [FromQuery] string? entityType = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetAuditLogsQuery(page, pageSize, userId, entityType, action, from, to), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }
}
