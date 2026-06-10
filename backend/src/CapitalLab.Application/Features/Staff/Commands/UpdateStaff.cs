using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Staff.Commands;

public record UpdateStaffCommand(
    Guid Id,
    string FullName,
    string? JobTitle,
    string? Department,
    string? Phone,
    string? Email,
    DateOnly? HireDate,
    Guid? UserId) : IRequest<Result>;

public class UpdateStaffCommandValidator : AbstractValidator<UpdateStaffCommand>
{
    public UpdateStaffCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public class UpdateStaffCommandHandler(
    IRepository<StaffProfile> staffRepo,
    IUnitOfWork uow)
    : IRequestHandler<UpdateStaffCommand, Result>
{
    public async Task<Result> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
    {
        var staff = await staffRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(StaffProfile), request.Id);

        staff.Update(request.FullName, request.JobTitle, request.Department,
            request.Phone, request.Email, request.HireDate, request.UserId);

        staffRepo.Update(staff);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
