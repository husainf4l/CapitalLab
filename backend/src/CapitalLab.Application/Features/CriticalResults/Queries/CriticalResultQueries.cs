using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Laboratory;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.CriticalResults.Queries;

public record GetCriticalResultsQuery(
    PaginationRequest Pagination,
    Guid? PatientId = null,
    Guid? LabTestId = null,
    bool? AcknowledgedOnly = null,
    bool? UnacknowledgedOnly = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null) : IRequest<Result<PagedResult<CriticalResultAlertResponse>>>;

public record GetCriticalRulesQuery(PaginationRequest Pagination, Guid? LabTestId = null)
    : IRequest<Result<PagedResult<CriticalResultRuleResponse>>>;

public class GetCriticalResultsQueryHandler(
    IRepository<CriticalResultAlert> alertRepo,
    IRepository<TestResult> resultRepo)
    : IRequestHandler<GetCriticalResultsQuery, Result<PagedResult<CriticalResultAlertResponse>>>
{
    public async Task<Result<PagedResult<CriticalResultAlertResponse>>> Handle(GetCriticalResultsQuery request, CancellationToken cancellationToken)
    {
        // Join alerts to their results so we can filter by patient / lab test and project values.
        var query = from a in alertRepo.Query()
                    join r in resultRepo.Query() on a.TestResultId equals r.Id
                    select new { a, r };

        if (request.PatientId.HasValue) query = query.Where(x => x.r.PatientId == request.PatientId);
        if (request.LabTestId.HasValue) query = query.Where(x => x.r.LabTestId == request.LabTestId);
        if (request.AcknowledgedOnly == true) query = query.Where(x => x.a.IsAcknowledged);
        if (request.UnacknowledgedOnly == true) query = query.Where(x => !x.a.IsAcknowledged);
        if (request.FromDate.HasValue) query = query.Where(x => x.a.TriggeredAt >= request.FromDate);
        if (request.ToDate.HasValue) query = query.Where(x => x.a.TriggeredAt <= request.ToDate);

        var projected = query
            .OrderByDescending(x => x.a.TriggeredAt)
            .Select(x => new CriticalResultAlertResponse(
                x.a.Id, x.a.TestResultId, x.r.PatientId, x.r.LabTestId, x.r.ResultValue,
                x.a.TriggeredAt, x.a.TriggerReason, x.a.IsAcknowledged, x.a.AcknowledgedBy, x.a.AcknowledgedAt));

        var paged = await projected.ToPagedResultAsync(request.Pagination.WithClampedPageSize(), cancellationToken);
        return Result<PagedResult<CriticalResultAlertResponse>>.Success(paged);
    }
}

public class GetCriticalRulesQueryHandler(IRepository<CriticalResultRule> ruleRepo)
    : IRequestHandler<GetCriticalRulesQuery, Result<PagedResult<CriticalResultRuleResponse>>>
{
    public async Task<Result<PagedResult<CriticalResultRuleResponse>>> Handle(GetCriticalRulesQuery request, CancellationToken cancellationToken)
    {
        var query = ruleRepo.Query();
        if (request.LabTestId.HasValue) query = query.Where(r => r.LabTestId == request.LabTestId);

        query = query.OrderBy(r => r.LabTestId);

        var paged = await query
            .Select(r => new CriticalResultRuleResponse(r.Id, r.LabTestId, r.MinCriticalValue, r.MaxCriticalValue, r.IsEnabled))
            .ToPagedResultAsync(request.Pagination.WithClampedPageSize(), cancellationToken);

        return Result<PagedResult<CriticalResultRuleResponse>>.Success(paged);
    }
}
