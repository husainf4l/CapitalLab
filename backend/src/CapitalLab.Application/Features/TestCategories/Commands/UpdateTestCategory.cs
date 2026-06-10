using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.TestCategories.Commands;

public record UpdateTestCategoryCommand(
    Guid Id, string Name, string? NameAr, string? Description, int SortOrder)
    : IRequest<Result>;

public class UpdateTestCategoryCommandValidator : AbstractValidator<UpdateTestCategoryCommand>
{
    public UpdateTestCategoryCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}

public class UpdateTestCategoryCommandHandler(
    IRepository<TestCategory> categoryRepo,
    IUnitOfWork uow)
    : IRequestHandler<UpdateTestCategoryCommand, Result>
{
    public async Task<Result> Handle(UpdateTestCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await categoryRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TestCategory), request.Id);

        category.Update(request.Name, request.NameAr, request.Description, request.SortOrder);

        categoryRepo.Update(category);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
