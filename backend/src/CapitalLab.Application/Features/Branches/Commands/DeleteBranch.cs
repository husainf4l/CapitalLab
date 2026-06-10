using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Branches.Commands;

public record DeleteBranchCommand(Guid Id) : IRequest<Result>;

public class DeleteBranchCommandHandler(
    IRepository<Branch> branches,
    ICurrentUserService currentUser,
    IUnitOfWork uow)
    : IRequestHandler<DeleteBranchCommand, Result>
{
    public async Task<Result> Handle(DeleteBranchCommand request, CancellationToken cancellationToken)
    {
        var branch = await branches.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Branch), request.Id);

        if (branch.IsMainBranch)
            throw new BusinessRuleException("Branch.MainBranchDelete", "Cannot delete the main branch.");

        branch.SoftDelete(currentUser.UserId ?? Guid.Empty);
        branches.Update(branch);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
