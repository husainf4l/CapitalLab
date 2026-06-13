using CapitalLab.Application.Features.Settings.Commands;
using CapitalLab.Application.Features.Settings.Queries;
using CapitalLab.Contracts.Settings;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class SettingsController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetSettingsQuery(category, false), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }

    [HttpPut]
    public async Task<IActionResult> Upsert([FromBody] UpsertSettingRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(new UpsertSettingCommand(
            request.Key, request.Value, request.Category, request.Description, request.IsPublic), ct);
        return result.IsSuccess ? OkResponse(result.Value) : FailResponse(result.ErrorMessage!);
    }
}
