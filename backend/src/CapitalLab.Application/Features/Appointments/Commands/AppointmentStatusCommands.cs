using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Appointments.Commands;

public record ConfirmAppointmentCommand(Guid Id) : IRequest<Result>;
public record MarkAppointmentInProgressCommand(Guid Id) : IRequest<Result>;
public record CompleteAppointmentCommand(Guid Id) : IRequest<Result>;
public record CancelAppointmentCommand(Guid Id, string? Reason) : IRequest<Result>;
public record RescheduleAppointmentCommand(Guid Id, DateOnly AppointmentDate, TimeOnly StartTime, TimeOnly EndTime, string? Notes) : IRequest<Result>;

public class RescheduleAppointmentCommandValidator : AbstractValidator<RescheduleAppointmentCommand>
{
    public RescheduleAppointmentCommandValidator()
    {
        RuleFor(x => x.AppointmentDate).GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow));
        RuleFor(x => x.StartTime).LessThan(x => x.EndTime);
    }
}

public class ConfirmAppointmentCommandHandler(
    IRepository<Appointment> appointmentRepo,
    IRepository<AppointmentStatusHistory> historyRepo,
    ICurrentUserService currentUser,
    IUnitOfWork uow) : IRequestHandler<ConfirmAppointmentCommand, Result>
{
    public async Task<Result> Handle(ConfirmAppointmentCommand request, CancellationToken cancellationToken)
    {
        var appointment = await appointmentRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), request.Id);
        await historyRepo.AddAsync(appointment.Confirm(currentUser.UserId), cancellationToken);
        appointmentRepo.Update(appointment);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class MarkAppointmentInProgressCommandHandler(
    IRepository<Appointment> appointmentRepo,
    IRepository<AppointmentStatusHistory> historyRepo,
    ICurrentUserService currentUser,
    IUnitOfWork uow) : IRequestHandler<MarkAppointmentInProgressCommand, Result>
{
    public async Task<Result> Handle(MarkAppointmentInProgressCommand request, CancellationToken cancellationToken)
    {
        var appointment = await appointmentRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), request.Id);
        await historyRepo.AddAsync(appointment.MarkInProgress(currentUser.UserId), cancellationToken);
        appointmentRepo.Update(appointment);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class CompleteAppointmentCommandHandler(
    IRepository<Appointment> appointmentRepo,
    IRepository<AppointmentStatusHistory> historyRepo,
    ICurrentUserService currentUser,
    IUnitOfWork uow) : IRequestHandler<CompleteAppointmentCommand, Result>
{
    public async Task<Result> Handle(CompleteAppointmentCommand request, CancellationToken cancellationToken)
    {
        var appointment = await appointmentRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), request.Id);
        await historyRepo.AddAsync(appointment.Complete(currentUser.UserId), cancellationToken);
        appointmentRepo.Update(appointment);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class CancelAppointmentCommandHandler(
    IRepository<Appointment> appointmentRepo,
    IRepository<AppointmentStatusHistory> historyRepo,
    ICurrentUserService currentUser,
    IUnitOfWork uow) : IRequestHandler<CancelAppointmentCommand, Result>
{
    public async Task<Result> Handle(CancelAppointmentCommand request, CancellationToken cancellationToken)
    {
        var appointment = await appointmentRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), request.Id);
        await historyRepo.AddAsync(appointment.Cancel(currentUser.UserId, request.Reason), cancellationToken);
        appointmentRepo.Update(appointment);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class RescheduleAppointmentCommandHandler(
    IRepository<Appointment> appointmentRepo,
    IUnitOfWork uow) : IRequestHandler<RescheduleAppointmentCommand, Result>
{
    public async Task<Result> Handle(RescheduleAppointmentCommand request, CancellationToken cancellationToken)
    {
        var appointment = await appointmentRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), request.Id);
        appointment.Reschedule(request.AppointmentDate, request.StartTime, request.EndTime, request.Notes);
        appointmentRepo.Update(appointment);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}
