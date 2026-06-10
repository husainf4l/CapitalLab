using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Branches.Commands;

public record ToggleBranchStatusCommand(Guid Id, bool Activate) : IRequest<Result>;

public class ToggleBranchStatusCommandHandler(
    IRepository<Branch> branches,
    IUnitOfWork uow)
    : IRequestHandler<ToggleBranchStatusCommand, Result>
{
    public async Task<Result> Handle(ToggleBranchStatusCommand request, CancellationToken cancellationToken)
    {
        var branch = await branches.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Branch), request.Id);

        if (request.Activate) branch.Activate();
        else branch.Deactivate();

        branches.Update(branch);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
