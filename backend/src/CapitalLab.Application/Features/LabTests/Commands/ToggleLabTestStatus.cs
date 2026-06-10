using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.LabTests.Commands;

public record ToggleLabTestStatusCommand(Guid Id, bool Activate) : IRequest<Result>;

public class ToggleLabTestStatusCommandHandler(
    IRepository<LabTest> labTestRepo,
    IUnitOfWork uow)
    : IRequestHandler<ToggleLabTestStatusCommand, Result>
{
    public async Task<Result> Handle(ToggleLabTestStatusCommand request, CancellationToken cancellationToken)
    {
        var test = await labTestRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(LabTest), request.Id);

        if (request.Activate) test.Activate();
        else test.Deactivate();

        labTestRepo.Update(test);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
