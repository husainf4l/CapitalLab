using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Laboratory;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ContractSampleStatus = CapitalLab.Contracts.Enums.SampleStatus;
using ContractSampleType = CapitalLab.Contracts.Enums.SampleType;
using ContractSampleItemStatus = CapitalLab.Contracts.Enums.SampleItemStatus;

namespace CapitalLab.Application.Features.Samples.Queries;

public record GetSamplesQuery(
    PaginationRequest Pagination,
    Guid? PatientId = null,
    Guid? BranchId = null,
    Guid? TestOrderId = null,
    SampleStatus? Status = null,
    SampleType? SampleType = null) : IRequest<Result<PagedResult<SampleSummaryResponse>>>;

public record GetSampleByIdQuery(Guid Id) : IRequest<Result<SampleResponse>>;

public class GetSamplesQueryHandler(IRepository<Sample> sampleRepo)
    : IRequestHandler<GetSamplesQuery, Result<PagedResult<SampleSummaryResponse>>>
{
    public async Task<Result<PagedResult<SampleSummaryResponse>>> Handle(GetSamplesQuery request, CancellationToken cancellationToken)
    {
        var query = sampleRepo.Query();
        if (request.PatientId.HasValue) query = query.Where(s => s.PatientId == request.PatientId);
        if (request.BranchId.HasValue) query = query.Where(s => s.BranchId == request.BranchId);
        if (request.TestOrderId.HasValue) query = query.Where(s => s.TestOrderId == request.TestOrderId);
        if (request.Status.HasValue) query = query.Where(s => s.Status == request.Status);
        if (request.SampleType.HasValue) query = query.Where(s => s.SampleType == request.SampleType);

        if (!string.IsNullOrWhiteSpace(request.Pagination.Search))
        {
            var s = request.Pagination.Search.ToLowerInvariant();
            query = query.Where(x => x.SampleNumber.ToLower().Contains(s) || (x.Barcode != null && x.Barcode.ToLower().Contains(s)));
        }

        query = request.Pagination.IsDescending ? query.OrderByDescending(s => s.CreatedAt) : query.OrderBy(s => s.CreatedAt);

        var paged = await query
            .Select(s => new SampleSummaryResponse(
                s.Id, s.SampleNumber, s.TestOrderId, s.PatientId,
                (ContractSampleType)s.SampleType, (ContractSampleStatus)s.Status,
                s.CollectionDateTime, s.CreatedAt))
            .ToPagedResultAsync(request.Pagination.WithClampedPageSize(), cancellationToken);

        return Result<PagedResult<SampleSummaryResponse>>.Success(paged);
    }
}

public class GetSampleByIdQueryHandler(IRepository<Sample> sampleRepo)
    : IRequestHandler<GetSampleByIdQuery, Result<SampleResponse>>
{
    public async Task<Result<SampleResponse>> Handle(GetSampleByIdQuery request, CancellationToken cancellationToken)
    {
        var sample = await sampleRepo.Query()
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Sample), request.Id);

        return Result<SampleResponse>.Success(new SampleResponse(
            sample.Id, sample.SampleNumber, sample.TestOrderId, sample.PatientId, sample.BranchId,
            sample.CollectedByStaffId, (ContractSampleType)sample.SampleType,
            sample.Barcode, sample.BarcodeImagePath, sample.QRCode, sample.QRCodeImagePath,
            sample.CollectionDateTime, sample.ReceivedDateTime, sample.ProcessingStartedAt, sample.ProcessingCompletedAt,
            (ContractSampleStatus)sample.Status, sample.Notes, sample.RejectionReason, sample.CreatedAt,
            sample.Items.Select(i => new SampleItemResponse(i.Id, i.TestOrderItemId, i.LabTestId, (ContractSampleItemStatus)i.Status)).ToList()));
    }
}
