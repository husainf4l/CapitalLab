using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.LabTests.Commands;

public record UpdateLabTestCommand(
    Guid Id,
    Guid CategoryId,
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
    bool IsHomeCollectionAvailable) : IRequest<Result>;

public class UpdateLabTestCommandValidator : AbstractValidator<UpdateLabTestCommand>
{
    public UpdateLabTestCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SampleType).IsInEnum();
        RuleFor(x => x.TurnaroundTimeHours).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
    }
}

public class UpdateLabTestCommandHandler(
    IRepository<LabTest> labTestRepo,
    IRepository<TestCategory> categoryRepo,
    IUnitOfWork uow)
    : IRequestHandler<UpdateLabTestCommand, Result>
{
    public async Task<Result> Handle(UpdateLabTestCommand request, CancellationToken cancellationToken)
    {
        var test = await labTestRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(LabTest), request.Id);

        var categoryExists = await categoryRepo.ExistsAsync(c => c.Id == request.CategoryId, cancellationToken);
        if (!categoryExists) throw new NotFoundException(nameof(TestCategory), request.CategoryId);

        test.Update(request.CategoryId, request.Name, request.NameAr,
            request.Description, request.SampleType,
            request.PreparationInstructions, request.TurnaroundTimeHours,
            request.Price, request.Currency,
            request.ReferenceRange, request.Unit,
            request.IsFastingRequired, request.IsHomeCollectionAvailable);

        labTestRepo.Update(test);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
