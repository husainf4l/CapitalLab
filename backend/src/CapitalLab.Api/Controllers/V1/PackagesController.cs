using CapitalLab.Application.Features.Packages.Commands;
using CapitalLab.Application.Features.Packages.Queries;
using CapitalLab.Contracts.Catalog;
using CapitalLab.Contracts.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class PackagesController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] bool? isActive,
        [FromQuery] bool? isPopular,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetHealthPackagesQuery(pagination, isActive, isPopular), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("popular")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPopular([FromQuery] int count = 6, CancellationToken ct = default)
    {
        var pagination = new PaginationRequest { PageSize = count };
        var result = await Mediator.Send(new GetHealthPackagesQuery(pagination, IsActive: true, IsPopular: true), ct);
        return OkResponse(result.Value!.Items);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetHealthPackageByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpGet("{id:guid}/price-breakdown")]
    public async Task<IActionResult> GetPriceBreakdown(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetPackagePriceBreakdownQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHealthPackageRequest request, CancellationToken ct)
    {
        var command = new CreateHealthPackageCommand(
            request.Code, request.Name, request.NameAr,
            request.Description, request.Price, request.Currency,
            request.DiscountPercentage, request.IsPopular, request.TestIds);

        var result = await Mediator.Send(command, ct);
        return CreatedResponse(result.Value, $"api/v1/packages/{result.Value}");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateHealthPackageRequest request, CancellationToken ct)
    {
        await Mediator.Send(new UpdateHealthPackageCommand(
            id, request.Name, request.NameAr, request.Description,
            request.Price, request.Currency, request.DiscountPercentage, request.IsPopular), ct);
        return NoContentResponse();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new DeleteHealthPackageCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleHealthPackageStatusCommand(id, Activate: true), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleHealthPackageStatusCommand(id, Activate: false), ct);
        return NoContentResponse();
    }

    [HttpPost("{id:guid}/tests")]
    public async Task<IActionResult> AddTest(Guid id, [FromBody] AddTestToPackageRequest request, CancellationToken ct)
    {
        await Mediator.Send(new AddTestToPackageCommand(id, request.LabTestId), ct);
        return NoContentResponse();
    }

    [HttpDelete("{id:guid}/tests/{testId:guid}")]
    public async Task<IActionResult> RemoveTest(Guid id, Guid testId, CancellationToken ct)
    {
        await Mediator.Send(new RemoveTestFromPackageCommand(id, testId), ct);
        return NoContentResponse();
    }
}
