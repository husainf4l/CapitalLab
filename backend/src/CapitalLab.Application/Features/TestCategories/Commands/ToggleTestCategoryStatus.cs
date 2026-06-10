using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.TestCategories.Commands;

public record ToggleTestCategoryStatusCommand(Guid Id, bool Activate) : IRequest<Result>;

public class ToggleTestCategoryStatusCommandHandler(
    IRepository<TestCategory> categoryRepo,
    IUnitOfWork uow)
    : IRequestHandler<ToggleTestCategoryStatusCommand, Result>
{
    public async Task<Result> Handle(ToggleTestCategoryStatusCommand request, CancellationToken cancellationToken)
    {
        var category = await categoryRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TestCategory), request.Id);

        if (request.Activate) category.Activate();
        else category.Deactivate();

        categoryRepo.Update(category);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
