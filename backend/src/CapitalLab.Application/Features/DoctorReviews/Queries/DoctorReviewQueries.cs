using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Laboratory;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ContractReviewStatus = CapitalLab.Contracts.Enums.DoctorReviewStatus;

namespace CapitalLab.Application.Features.DoctorReviews.Queries;

public record GetDoctorReviewByIdQuery(Guid Id) : IRequest<Result<DoctorReviewResponse>>;
public record GetDoctorReviewsBySampleQuery(Guid SampleId) : IRequest<Result<List<DoctorReviewResponse>>>;

public class GetDoctorReviewByIdQueryHandler(IRepository<DoctorReview> reviewRepo)
    : IRequestHandler<GetDoctorReviewByIdQuery, Result<DoctorReviewResponse>>
{
    public async Task<Result<DoctorReviewResponse>> Handle(GetDoctorReviewByIdQuery request, CancellationToken cancellationToken)
    {
        var r = await reviewRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(DoctorReview), request.Id);

        return Result<DoctorReviewResponse>.Success(new DoctorReviewResponse(
            r.Id, r.SampleId, r.DoctorId, r.Notes, (ContractReviewStatus)r.Status, r.ReviewedAt, r.CreatedAt));
    }
}

public class GetDoctorReviewsBySampleQueryHandler(IRepository<DoctorReview> reviewRepo)
    : IRequestHandler<GetDoctorReviewsBySampleQuery, Result<List<DoctorReviewResponse>>>
{
    public async Task<Result<List<DoctorReviewResponse>>> Handle(GetDoctorReviewsBySampleQuery request, CancellationToken cancellationToken)
    {
        var reviews = await reviewRepo.Query()
            .Where(r => r.SampleId == request.SampleId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new DoctorReviewResponse(
                r.Id, r.SampleId, r.DoctorId, r.Notes, (ContractReviewStatus)r.Status, r.ReviewedAt, r.CreatedAt))
            .ToListAsync(cancellationToken);

        return Result<List<DoctorReviewResponse>>.Success(reviews);
    }
}
