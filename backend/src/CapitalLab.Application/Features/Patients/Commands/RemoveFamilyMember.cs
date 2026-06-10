using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Patients.Commands;

public record RemoveFamilyMemberCommand(Guid LinkId) : IRequest<Result>;

public class RemoveFamilyMemberCommandHandler(
    IRepository<PatientFamilyMember> familyRepo,
    IUnitOfWork uow)
    : IRequestHandler<RemoveFamilyMemberCommand, Result>
{
    public async Task<Result> Handle(RemoveFamilyMemberCommand request, CancellationToken cancellationToken)
    {
        var link = await familyRepo.GetByIdAsync(request.LinkId, cancellationToken)
            ?? throw new NotFoundException(nameof(PatientFamilyMember), request.LinkId);

        familyRepo.Remove(link);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
