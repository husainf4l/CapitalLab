using CapitalLab.Application.Features.TestCategories.Commands;
using CapitalLab.Application.Features.TestCategories.Queries;
using CapitalLab.Contracts.Catalog;
using CapitalLab.Contracts.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CapitalLab.Api.Controllers.V1;

public class TestCategoriesController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequest pagination,
        [FromQuery] bool? isActive,
        CancellationToken ct)
    {
        var result = await Mediator.Send(new GetTestCategoriesQuery(pagination, isActive), ct);
        return OkPaged(result.Value!);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Mediator.Send(new GetTestCategoryByIdQuery(id), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTestCategoryRequest request, CancellationToken ct)
    {
        var result = await Mediator.Send(
            new CreateTestCategoryCommand(request.Code, request.Name, request.NameAr, request.Description, request.SortOrder), ct);
        return CreatedResponse(result.Value, $"api/v1/test-categories/{result.Value}");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTestCategoryRequest request, CancellationToken ct)
    {
        await Mediator.Send(
            new UpdateTestCategoryCommand(id, request.Name, request.NameAr, request.Description, request.SortOrder), ct);
        return NoContentResponse();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new DeleteTestCategoryCommand(id), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleTestCategoryStatusCommand(id, Activate: true), ct);
        return NoContentResponse();
    }

    [HttpPatch("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        await Mediator.Send(new ToggleTestCategoryStatusCommand(id, Activate: false), ct);
        return NoContentResponse();
    }
}
