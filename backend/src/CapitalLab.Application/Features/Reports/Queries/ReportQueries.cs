using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Laboratory;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ContractReportStatus = CapitalLab.Contracts.Enums.ReportStatus;

namespace CapitalLab.Application.Features.Reports.Queries;

public record GetReportsQuery(
    PaginationRequest Pagination,
    Guid? PatientId = null,
    Guid? SampleId = null,
    ReportStatus? Status = null) : IRequest<Result<PagedResult<ReportSummaryResponse>>>;

public record GetReportByIdQuery(Guid Id) : IRequest<Result<ReportResponse>>;

public class GetReportsQueryHandler(IRepository<Report> reportRepo)
    : IRequestHandler<GetReportsQuery, Result<PagedResult<ReportSummaryResponse>>>
{
    public async Task<Result<PagedResult<ReportSummaryResponse>>> Handle(GetReportsQuery request, CancellationToken cancellationToken)
    {
        var query = reportRepo.Query();
        if (request.PatientId.HasValue) query = query.Where(r => r.PatientId == request.PatientId);
        if (request.SampleId.HasValue) query = query.Where(r => r.SampleId == request.SampleId);
        if (request.Status.HasValue) query = query.Where(r => r.Status == request.Status);

        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var s = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(r => r.ReportNumber.ToLower().Contains(s));
        }

        query = request.Pagination.IsDescending ? query.OrderByDescending(r => r.GeneratedAt) : query.OrderBy(r => r.GeneratedAt);

        var paged = await query
            .Select(r => new ReportSummaryResponse(
                r.Id, r.ReportNumber, r.PatientId, r.SampleId,
                (ContractReportStatus)r.Status, r.GeneratedAt, r.ReleasedAt))
            .ToPagedResultAsync(request.Pagination.WithClampedPageSize(), cancellationToken);

        return Result<PagedResult<ReportSummaryResponse>>.Success(paged);
    }
}

public class GetReportByIdQueryHandler(IRepository<Report> reportRepo)
    : IRequestHandler<GetReportByIdQuery, Result<ReportResponse>>
{
    public async Task<Result<ReportResponse>> Handle(GetReportByIdQuery request, CancellationToken cancellationToken)
    {
        var report = await reportRepo.Query()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Report), request.Id);

        return Result<ReportResponse>.Success(new ReportResponse(
            report.Id, report.ReportNumber, report.PatientId, report.SampleId, report.TestOrderId,
            report.DoctorId, report.GeneratedAt, report.ReleasedAt, report.PDFPath, report.QRCode,
            (ContractReportStatus)report.Status,
            report.Items.Select(i => new ReportItemResponse(
                i.Id, i.LabTestId, i.TestName, i.ResultValue, i.Unit, i.ReferenceRange, i.Interpretation)).ToList()));
    }
}
