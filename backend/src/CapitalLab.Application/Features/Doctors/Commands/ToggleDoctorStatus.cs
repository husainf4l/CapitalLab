using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Doctors.Commands;

public record ToggleDoctorStatusCommand(Guid Id, bool Activate) : IRequest<Result>;

public class ToggleDoctorStatusCommandHandler(
    IRepository<Doctor> doctorRepo,
    IUnitOfWork uow)
    : IRequestHandler<ToggleDoctorStatusCommand, Result>
{
    public async Task<Result> Handle(ToggleDoctorStatusCommand request, CancellationToken cancellationToken)
    {
        var doctor = await doctorRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Doctor), request.Id);

        if (request.Activate) doctor.Activate();
        else doctor.Deactivate();

        doctorRepo.Update(doctor);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
