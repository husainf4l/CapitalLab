using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Staff.Commands;

public record CreateStaffCommand(
    Guid BranchId,
    string EmployeeCode,
    string FullName,
    string? JobTitle,
    string? Department,
    string? Phone,
    string? Email,
    DateOnly? HireDate,
    Guid? UserId) : IRequest<Result<Guid>>;

public class CreateStaffCommandValidator : AbstractValidator<CreateStaffCommand>
{
    public CreateStaffCommandValidator()
    {
        RuleFor(x => x.BranchId).NotEmpty().WithMessage("Branch is required.");
        RuleFor(x => x.EmployeeCode).NotEmpty().MaximumLength(30);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.JobTitle).MaximumLength(100).When(x => x.JobTitle is not null);
        RuleFor(x => x.Department).MaximumLength(100).When(x => x.Department is not null);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.Phone).MaximumLength(30).When(x => x.Phone is not null);
    }
}

public class CreateStaffCommandHandler(
    IRepository<StaffProfile> staffRepo,
    IRepository<Branch> branchRepo,
    IUnitOfWork uow)
    : IRequestHandler<CreateStaffCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
    {
        var branchExists = await branchRepo.ExistsAsync(b => b.Id == request.BranchId, cancellationToken);
        if (!branchExists) throw new NotFoundException(nameof(Branch), request.BranchId);

        var codeExists = await staffRepo.ExistsAsync(
            s => s.EmployeeCode == request.EmployeeCode.Trim().ToUpperInvariant(), cancellationToken);
        if (codeExists) throw new ConflictException($"Employee code '{request.EmployeeCode}' is already in use.");

        var staff = StaffProfile.Create(
            request.BranchId, request.EmployeeCode, request.FullName,
            request.JobTitle, request.Department,
            request.Phone, request.Email, request.HireDate, request.UserId);

        await staffRepo.AddAsync(staff, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result<Guid>.Success(staff.Id);
    }
}
