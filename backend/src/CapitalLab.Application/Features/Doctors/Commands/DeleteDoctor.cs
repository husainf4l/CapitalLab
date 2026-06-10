using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Doctors.Commands;

public record DeleteDoctorCommand(Guid Id) : IRequest<Result>;

public class DeleteDoctorCommandHandler(
    IRepository<Doctor> doctorRepo,
    ICurrentUserService currentUser,
    IUnitOfWork uow)
    : IRequestHandler<DeleteDoctorCommand, Result>
{
    public async Task<Result> Handle(DeleteDoctorCommand request, CancellationToken cancellationToken)
    {
        var doctor = await doctorRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Doctor), request.Id);

        doctor.SoftDelete(currentUser.UserId ?? Guid.Empty);
        doctorRepo.Update(doctor);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
