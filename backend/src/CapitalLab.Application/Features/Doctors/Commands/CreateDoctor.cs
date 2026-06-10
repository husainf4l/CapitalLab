using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Doctors.Commands;

public record CreateDoctorCommand(
    Guid BranchId,
    string FullName,
    string? Specialization,
    string LicenseNumber,
    string? Phone,
    string? Email,
    bool IsReviewer,
    bool IsApprover,
    Guid? UserId) : IRequest<Result<Guid>>;

public class CreateDoctorCommandValidator : AbstractValidator<CreateDoctorCommand>
{
    public CreateDoctorCommandValidator()
    {
        RuleFor(x => x.BranchId).NotEmpty().WithMessage("Branch is required.");
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.LicenseNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Specialization).MaximumLength(150).When(x => x.Specialization is not null);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.Phone).MaximumLength(30).When(x => x.Phone is not null);
    }
}

public class CreateDoctorCommandHandler(
    IRepository<Doctor> doctorRepo,
    IRepository<Branch> branchRepo,
    IUnitOfWork uow)
    : IRequestHandler<CreateDoctorCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateDoctorCommand request, CancellationToken cancellationToken)
    {
        var branchExists = await branchRepo.ExistsAsync(b => b.Id == request.BranchId, cancellationToken);
        if (!branchExists) throw new NotFoundException(nameof(Branch), request.BranchId);

        var licenseExists = await doctorRepo.ExistsAsync(
            d => d.LicenseNumber == request.LicenseNumber.Trim(), cancellationToken);
        if (licenseExists) throw new ConflictException($"License number '{request.LicenseNumber}' is already registered.");

        var doctor = Doctor.Create(
            request.BranchId, request.FullName, request.Specialization,
            request.LicenseNumber, request.Phone, request.Email,
            request.IsReviewer, request.IsApprover, request.UserId);

        await doctorRepo.AddAsync(doctor, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result<Guid>.Success(doctor.Id);
    }
}
