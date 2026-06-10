using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Catalog;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.LabTests.Queries;

public record GetLabTestByIdQuery(Guid Id) : IRequest<Result<LabTestResponse>>;

public class GetLabTestByIdQueryHandler(
    IRepository<LabTest> labTestRepo,
    IRepository<TestCategory> categoryRepo)
    : IRequestHandler<GetLabTestByIdQuery, Result<LabTestResponse>>
{
    public async Task<Result<LabTestResponse>> Handle(
        GetLabTestByIdQuery request, CancellationToken cancellationToken)
    {
        var test = await labTestRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(LabTest), request.Id);

        var category = await categoryRepo.GetByIdAsync(test.CategoryId, cancellationToken);

        return Result<LabTestResponse>.Success(new LabTestResponse(
            test.Id, test.CategoryId, category?.Name ?? string.Empty,
            test.Code, test.Name, test.NameAr, test.Description,
            (Contracts.Enums.SampleType)test.SampleType, test.PreparationInstructions,
            test.TurnaroundTimeHours, test.Price, test.Currency,
            test.ReferenceRange, test.Unit,
            test.IsFastingRequired, test.IsHomeCollectionAvailable, test.IsActive));
    }
}
