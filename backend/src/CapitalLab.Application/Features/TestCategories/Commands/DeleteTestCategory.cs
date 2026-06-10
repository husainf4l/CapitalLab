using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.TestCategories.Commands;

public record DeleteTestCategoryCommand(Guid Id) : IRequest<Result>;

public class DeleteTestCategoryCommandHandler(
    IRepository<TestCategory> categoryRepo,
    IRepository<LabTest> labTestRepo,
    ICurrentUserService currentUser,
    IUnitOfWork uow)
    : IRequestHandler<DeleteTestCategoryCommand, Result>
{
    public async Task<Result> Handle(DeleteTestCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await categoryRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TestCategory), request.Id);

        var hasActiveTests = await labTestRepo.ExistsAsync(
            t => t.CategoryId == request.Id, cancellationToken);
        if (hasActiveTests)
            throw new BusinessRuleException("TestCategory.HasActiveTests", "Cannot delete a category that has active lab tests.");

        category.SoftDelete(currentUser.UserId ?? Guid.Empty);
        categoryRepo.Update(category);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
