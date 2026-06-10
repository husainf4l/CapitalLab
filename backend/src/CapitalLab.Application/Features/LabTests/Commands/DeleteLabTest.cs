using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.LabTests.Commands;

public record DeleteLabTestCommand(Guid Id) : IRequest<Result>;

public class DeleteLabTestCommandHandler(
    IRepository<LabTest> labTestRepo,
    IRepository<PackageTest> packageTestRepo,
    ICurrentUserService currentUser,
    IUnitOfWork uow)
    : IRequestHandler<DeleteLabTestCommand, Result>
{
    public async Task<Result> Handle(DeleteLabTestCommand request, CancellationToken cancellationToken)
    {
        var test = await labTestRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(LabTest), request.Id);

        var inPackage = await packageTestRepo.ExistsAsync(pt => pt.LabTestId == request.Id, cancellationToken);
        if (inPackage)
            throw new BusinessRuleException("LabTest.InPackage", "Cannot delete a test that belongs to one or more packages.");

        test.SoftDelete(currentUser.UserId ?? Guid.Empty);
        labTestRepo.Update(test);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
