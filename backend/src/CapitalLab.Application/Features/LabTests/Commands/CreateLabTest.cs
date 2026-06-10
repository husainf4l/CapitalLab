using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.LabTests.Commands;

public record CreateLabTestCommand(
    Guid CategoryId,
    string Code,
    string Name,
    string? NameAr,
    string? Description,
    SampleType SampleType,
    string? PreparationInstructions,
    int TurnaroundTimeHours,
    decimal Price,
    string Currency,
    string? ReferenceRange,
    string? Unit,
    bool IsFastingRequired,
    bool IsHomeCollectionAvailable) : IRequest<Result<Guid>>;

public class CreateLabTestCommandValidator : AbstractValidator<CreateLabTestCommand>
{
    public CreateLabTestCommandValidator()
    {
        RuleFor(x => x.CategoryId).NotEmpty().WithMessage("Category is required.");
        RuleFor(x => x.Code).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SampleType).IsInEnum();
        RuleFor(x => x.TurnaroundTimeHours).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0).WithMessage("Price cannot be negative.");
        RuleFor(x => x.Currency).NotEmpty().Length(3);
    }
}

public class CreateLabTestCommandHandler(
    IRepository<LabTest> labTestRepo,
    IRepository<TestCategory> categoryRepo,
    IUnitOfWork uow)
    : IRequestHandler<CreateLabTestCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateLabTestCommand request, CancellationToken cancellationToken)
    {
        var categoryExists = await categoryRepo.ExistsAsync(c => c.Id == request.CategoryId, cancellationToken);
        if (!categoryExists) throw new NotFoundException(nameof(TestCategory), request.CategoryId);

        var codeExists = await labTestRepo.ExistsAsync(
            t => t.Code == request.Code.Trim().ToUpperInvariant(), cancellationToken);
        if (codeExists) throw new ConflictException($"Test code '{request.Code}' already exists.");

        var test = LabTest.Create(
            request.CategoryId, request.Code, request.Name, request.NameAr,
            request.Description, request.SampleType,
            request.PreparationInstructions, request.TurnaroundTimeHours,
            request.Price, request.Currency,
            request.ReferenceRange, request.Unit,
            request.IsFastingRequired, request.IsHomeCollectionAvailable);

        await labTestRepo.AddAsync(test, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result<Guid>.Success(test.Id);
    }
}
