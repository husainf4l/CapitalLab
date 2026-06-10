using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Staff.Commands;

public record ToggleStaffStatusCommand(Guid Id, bool Activate) : IRequest<Result>;

public class ToggleStaffStatusCommandHandler(
    IRepository<StaffProfile> staffRepo,
    IUnitOfWork uow)
    : IRequestHandler<ToggleStaffStatusCommand, Result>
{
    public async Task<Result> Handle(ToggleStaffStatusCommand request, CancellationToken cancellationToken)
    {
        var staff = await staffRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(StaffProfile), request.Id);

        if (request.Activate) staff.Activate();
        else staff.Deactivate();

        staffRepo.Update(staff);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
