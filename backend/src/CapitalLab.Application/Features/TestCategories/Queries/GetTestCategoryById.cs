using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Catalog;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.TestCategories.Queries;

public record GetTestCategoryByIdQuery(Guid Id) : IRequest<Result<TestCategoryResponse>>;

public class GetTestCategoryByIdQueryHandler(
    IRepository<TestCategory> categoryRepo,
    IRepository<LabTest> labTestRepo)
    : IRequestHandler<GetTestCategoryByIdQuery, Result<TestCategoryResponse>>
{
    public async Task<Result<TestCategoryResponse>> Handle(
        GetTestCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await categoryRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TestCategory), request.Id);

        var testCount = await labTestRepo.CountAsync(t => t.CategoryId == request.Id, cancellationToken);

        return Result<TestCategoryResponse>.Success(new TestCategoryResponse(
            category.Id, category.Code, category.Name, category.NameAr,
            category.Description, category.SortOrder, category.IsActive, testCount));
    }
}
