using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Patients.Commands;

public record DeletePatientCommand(Guid Id) : IRequest<Result>;

public class DeletePatientCommandHandler(
    IRepository<Patient> patientRepo,
    ICurrentUserService currentUser,
    IUnitOfWork uow)
    : IRequestHandler<DeletePatientCommand, Result>
{
    public async Task<Result> Handle(DeletePatientCommand request, CancellationToken cancellationToken)
    {
        var patient = await patientRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Patient), request.Id);

        patient.SoftDelete(currentUser.UserId ?? Guid.Empty);
        patientRepo.Update(patient);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
