using CapitalLab.Application.Features.Appointments.Commands;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Enums;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Application.Appointments;

public sealed class AppointmentPhase2Tests
{
    [Fact]
    public async Task CreateAppointmentValidator_WithoutItems_ShouldFail()
    {
        var validator = new CreateAppointmentCommandValidator();
        var command = new CreateAppointmentCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            AppointmentType.BranchVisit,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            new TimeOnly(9, 0),
            new TimeOnly(10, 0),
            null,
            [],
            null);

        var result = await validator.ValidateAsync(command);

        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public async Task CreateAppointmentValidator_WithBothItemIds_ShouldFail()
    {
        var validator = new CreateAppointmentCommandValidator();
        var command = new CreateAppointmentCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            AppointmentType.BranchVisit,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            new TimeOnly(9, 0),
            new TimeOnly(10, 0),
            null,
            [new CreateAppointmentItem(Guid.NewGuid(), Guid.NewGuid())],
            null);

        var result = await validator.ValidateAsync(command);

        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Appointment_CannotCancelCompletedAppointment()
    {
        var appointment = Appointment.Create(
            "APT-20260610-000001",
            Guid.NewGuid(),
            Guid.NewGuid(),
            AppointmentType.BranchVisit,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            new TimeOnly(9, 0),
            new TimeOnly(10, 0),
            null);

        appointment.Confirm(Guid.NewGuid());
        appointment.Complete(Guid.NewGuid());

        var act = () => appointment.Cancel(Guid.NewGuid(), "changed mind");

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Appointment_CannotCompleteCancelledAppointment()
    {
        var appointment = Appointment.Create(
            "APT-20260610-000002",
            Guid.NewGuid(),
            Guid.NewGuid(),
            AppointmentType.BranchVisit,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            new TimeOnly(9, 0),
            new TimeOnly(10, 0),
            null);

        appointment.Cancel(Guid.NewGuid(), "patient request");

        var act = () => appointment.Complete(Guid.NewGuid());

        act.Should().Throw<InvalidOperationException>();
    }
}
