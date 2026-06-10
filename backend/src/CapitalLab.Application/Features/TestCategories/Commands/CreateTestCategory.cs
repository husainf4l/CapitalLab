using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.TestCategories.Commands;

public record CreateTestCategoryCommand(
    string Code, string Name, string? NameAr, string? Description, int SortOrder)
    : IRequest<Result<Guid>>;

public class CreateTestCategoryCommandValidator : AbstractValidator<CreateTestCategoryCommand>
{
    public CreateTestCategoryCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.NameAr).MaximumLength(150).When(x => x.NameAr is not null);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description is not null);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}

public class CreateTestCategoryCommandHandler(
    IRepository<TestCategory> categoryRepo,
    IUnitOfWork uow)
    : IRequestHandler<CreateTestCategoryCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateTestCategoryCommand request, CancellationToken cancellationToken)
    {
        var codeExists = await categoryRepo.ExistsAsync(
            c => c.Code == request.Code.Trim().ToUpperInvariant(), cancellationToken);
        if (codeExists) throw new ConflictException($"Category code '{request.Code}' already exists.");

        var category = TestCategory.Create(request.Code, request.Name, request.NameAr, request.Description, request.SortOrder);

        await categoryRepo.AddAsync(category, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result<Guid>.Success(category.Id);
    }
}
