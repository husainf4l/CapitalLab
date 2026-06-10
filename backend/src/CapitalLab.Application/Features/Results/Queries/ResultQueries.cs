using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Laboratory;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ContractResultStatus = CapitalLab.Contracts.Enums.ResultStatus;
using ContractResultType = CapitalLab.Contracts.Enums.ResultType;
using ContractInterpretation = CapitalLab.Contracts.Enums.ResultInterpretation;

namespace CapitalLab.Application.Features.Results.Queries;

public record GetResultsQuery(
    PaginationRequest Pagination,
    Guid? SampleId = null,
    Guid? PatientId = null,
    Guid? LabTestId = null,
    ResultStatus? Status = null,
    bool? CriticalOnly = null) : IRequest<Result<PagedResult<ResultSummaryResponse>>>;

public record GetResultByIdQuery(Guid Id) : IRequest<Result<ResultResponse>>;

public record GetResultHistoryQuery(Guid ResultId) : IRequest<Result<List<ResultHistoryResponse>>>;

public class GetResultsQueryHandler(IRepository<TestResult> resultRepo)
    : IRequestHandler<GetResultsQuery, Result<PagedResult<ResultSummaryResponse>>>
{
    public async Task<Result<PagedResult<ResultSummaryResponse>>> Handle(GetResultsQuery request, CancellationToken cancellationToken)
    {
        var query = resultRepo.Query();
        if (request.SampleId.HasValue) query = query.Where(r => r.SampleId == request.SampleId);
        if (request.PatientId.HasValue) query = query.Where(r => r.PatientId == request.PatientId);
        if (request.LabTestId.HasValue) query = query.Where(r => r.LabTestId == request.LabTestId);
        if (request.Status.HasValue) query = query.Where(r => r.Status == request.Status);
        if (request.CriticalOnly == true) query = query.Where(r => r.IsCritical);

        query = request.Pagination.IsDescending ? query.OrderByDescending(r => r.EnteredAt) : query.OrderBy(r => r.EnteredAt);

        var paged = await query
            .Select(r => new ResultSummaryResponse(
                r.Id, r.SampleId, r.PatientId, r.LabTestId,
                r.ResultValue, r.ResultText, r.Unit,
                (ContractInterpretation?)r.Interpretation, (ContractResultStatus)r.Status,
                r.IsCritical, r.EnteredAt))
            .ToPagedResultAsync(request.Pagination.WithClampedPageSize(), cancellationToken);

        return Result<PagedResult<ResultSummaryResponse>>.Success(paged);
    }
}

public class GetResultByIdQueryHandler(IRepository<TestResult> resultRepo)
    : IRequestHandler<GetResultByIdQuery, Result<ResultResponse>>
{
    public async Task<Result<ResultResponse>> Handle(GetResultByIdQuery request, CancellationToken cancellationToken)
    {
        var r = await resultRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TestResult), request.Id);

        return Result<ResultResponse>.Success(new ResultResponse(
            r.Id, r.SampleId, r.PatientId, r.LabTestId,
            (ContractResultType)r.ResultType, r.ResultValue, r.ResultText, r.Unit, r.ReferenceRange,
            (ContractInterpretation?)r.Interpretation, (ContractResultStatus)r.Status, r.IsCritical,
            r.EnteredBy, r.EnteredAt, r.ApprovedBy, r.ApprovedAt));
    }
}

public class GetResultHistoryQueryHandler(
    IRepository<TestResult> resultRepo,
    IRepository<TestResultHistory> historyRepo)
    : IRequestHandler<GetResultHistoryQuery, Result<List<ResultHistoryResponse>>>
{
    public async Task<Result<List<ResultHistoryResponse>>> Handle(GetResultHistoryQuery request, CancellationToken cancellationToken)
    {
        if (!await resultRepo.ExistsAsync(r => r.Id == request.ResultId, cancellationToken))
            throw new NotFoundException(nameof(TestResult), request.ResultId);

        var history = await historyRepo.Query()
            .Where(h => h.TestResultId == request.ResultId)
            .OrderByDescending(h => h.ChangedAt)
            .Select(h => new ResultHistoryResponse(h.Id, h.TestResultId, h.OldValue, h.NewValue, h.ChangedBy, h.ChangedAt))
            .ToListAsync(cancellationToken);

        return Result<List<ResultHistoryResponse>>.Success(history);
    }
}
