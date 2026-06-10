using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Staff.Commands;

public record DeleteStaffCommand(Guid Id) : IRequest<Result>;

public class DeleteStaffCommandHandler(
    IRepository<StaffProfile> staffRepo,
    ICurrentUserService currentUser,
    IUnitOfWork uow)
    : IRequestHandler<DeleteStaffCommand, Result>
{
    public async Task<Result> Handle(DeleteStaffCommand request, CancellationToken cancellationToken)
    {
        var staff = await staffRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(StaffProfile), request.Id);

        staff.SoftDelete(currentUser.UserId ?? Guid.Empty);
        staffRepo.Update(staff);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
