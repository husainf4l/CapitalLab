using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.DoctorReviews.Commands;

public record CreateDoctorReviewCommand(Guid SampleId, Guid DoctorId, string? Notes) : IRequest<Result<Guid>>;
public record ApproveDoctorReviewCommand(Guid Id, string? Notes) : IRequest<Result>;
public record RequestRetestCommand(Guid Id, string? Notes) : IRequest<Result>;
public record RejectDoctorReviewCommand(Guid Id, string? Notes) : IRequest<Result>;

public class CreateDoctorReviewCommandValidator : AbstractValidator<CreateDoctorReviewCommand>
{
    public CreateDoctorReviewCommandValidator()
    {
        RuleFor(x => x.SampleId).NotEmpty();
        RuleFor(x => x.DoctorId).NotEmpty();
    }
}

public class CreateDoctorReviewCommandHandler(
    IRepository<DoctorReview> reviewRepo,
    IRepository<Sample> sampleRepo,
    IRepository<Doctor> doctorRepo,
    IUnitOfWork uow) : IRequestHandler<CreateDoctorReviewCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateDoctorReviewCommand request, CancellationToken cancellationToken)
    {
        if (!await sampleRepo.ExistsAsync(s => s.Id == request.SampleId, cancellationToken))
            throw new NotFoundException(nameof(Sample), request.SampleId);
        if (!await doctorRepo.ExistsAsync(d => d.Id == request.DoctorId, cancellationToken))
            throw new NotFoundException(nameof(Doctor), request.DoctorId);

        var review = DoctorReview.Create(request.SampleId, request.DoctorId, request.Notes);
        await reviewRepo.AddAsync(review, cancellationToken);
        await uow.CommitAsync(cancellationToken);
        return Result<Guid>.Success(review.Id);
    }
}

public class ApproveDoctorReviewCommandHandler(
    IRepository<DoctorReview> reviewRepo,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<ApproveDoctorReviewCommand, Result>
{
    public async Task<Result> Handle(ApproveDoctorReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await reviewRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(DoctorReview), request.Id);
        try { review.Approve(request.Notes, clock.UtcNow); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Review.AlreadyConcluded", ex.Message); }
        reviewRepo.Update(review);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class RequestRetestCommandHandler(
    IRepository<DoctorReview> reviewRepo,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<RequestRetestCommand, Result>
{
    public async Task<Result> Handle(RequestRetestCommand request, CancellationToken cancellationToken)
    {
        var review = await reviewRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(DoctorReview), request.Id);
        try { review.RequestRetest(request.Notes, clock.UtcNow); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Review.AlreadyConcluded", ex.Message); }
        reviewRepo.Update(review);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class RejectDoctorReviewCommandHandler(
    IRepository<DoctorReview> reviewRepo,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<RejectDoctorReviewCommand, Result>
{
    public async Task<Result> Handle(RejectDoctorReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await reviewRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(DoctorReview), request.Id);
        try { review.Reject(request.Notes, clock.UtcNow); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Review.AlreadyConcluded", ex.Message); }
        reviewRepo.Update(review);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}
