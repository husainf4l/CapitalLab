using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.HomeCollections.Commands;

public record CreateHomeCollectionRequestCommand(
    Guid AppointmentId,
    string Address,
    string? City,
    string? Area,
    decimal? Latitude,
    decimal? Longitude,
    DateOnly PreferredDate,
    TimeOnly PreferredTimeFrom,
    TimeOnly PreferredTimeTo,
    string? CollectionNotes) : IRequest<Result<Guid>>;

public record AssignHomeCollectionStaffCommand(Guid Id, Guid StaffProfileId) : IRequest<Result>;
public record UpdateHomeCollectionStatusCommand(Guid Id, HomeCollectionStatus Status) : IRequest<Result>;

public class CreateHomeCollectionRequestCommandValidator : AbstractValidator<CreateHomeCollectionRequestCommand>
{
    public CreateHomeCollectionRequestCommandValidator()
    {
        RuleFor(x => x.AppointmentId).NotEmpty();
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
        RuleFor(x => x.PreferredDate).GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow));
        RuleFor(x => x.PreferredTimeFrom).LessThan(x => x.PreferredTimeTo);
    }
}

public class CreateHomeCollectionRequestCommandHandler(
    IRepository<Appointment> appointmentRepo,
    IRepository<HomeCollectionRequest> homeCollectionRepo,
    IUnitOfWork uow) : IRequestHandler<CreateHomeCollectionRequestCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateHomeCollectionRequestCommand request, CancellationToken cancellationToken)
    {
        var appointment = await appointmentRepo.GetByIdAsync(request.AppointmentId, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), request.AppointmentId);
        if (appointment.AppointmentType != AppointmentType.HomeCollection)
            throw new BusinessRuleException("Appointment.NotHomeCollection", "Appointment is not a home collection appointment.");
        if (await homeCollectionRepo.ExistsAsync(h => h.AppointmentId == request.AppointmentId, cancellationToken))
            throw new ConflictException("Home collection request already exists for this appointment.");

        var homeCollection = HomeCollectionRequest.Create(
            appointment.Id,
            appointment.PatientId,
            request.Address,
            request.City,
            request.Area,
            request.Latitude,
            request.Longitude,
            request.PreferredDate,
            request.PreferredTimeFrom,
            request.PreferredTimeTo,
            request.CollectionNotes);

        await homeCollectionRepo.AddAsync(homeCollection, cancellationToken);
        await uow.CommitAsync(cancellationToken);
        return Result<Guid>.Success(homeCollection.Id);
    }
}

public class AssignHomeCollectionStaffCommandHandler(
    IRepository<HomeCollectionRequest> homeCollectionRepo,
    IRepository<StaffProfile> staffRepo,
    IUnitOfWork uow) : IRequestHandler<AssignHomeCollectionStaffCommand, Result>
{
    public async Task<Result> Handle(AssignHomeCollectionStaffCommand request, CancellationToken cancellationToken)
    {
        var homeCollection = await homeCollectionRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(HomeCollectionRequest), request.Id);
        var staff = await staffRepo.GetByIdAsync(request.StaffProfileId, cancellationToken)
            ?? throw new NotFoundException(nameof(StaffProfile), request.StaffProfileId);
        if (!staff.IsActive)
            throw new BusinessRuleException("Staff.Inactive", "Assigned staff must be active.");

        homeCollection.AssignStaff(staff.Id);
        homeCollectionRepo.Update(homeCollection);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class UpdateHomeCollectionStatusCommandHandler(
    IRepository<HomeCollectionRequest> homeCollectionRepo,
    IUnitOfWork uow) : IRequestHandler<UpdateHomeCollectionStatusCommand, Result>
{
    public async Task<Result> Handle(UpdateHomeCollectionStatusCommand request, CancellationToken cancellationToken)
    {
        var homeCollection = await homeCollectionRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(HomeCollectionRequest), request.Id);

        homeCollection.ChangeStatus(request.Status);
        homeCollectionRepo.Update(homeCollection);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}
