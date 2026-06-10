using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Doctors.Commands;

public record UpdateDoctorCommand(
    Guid Id,
    string FullName,
    string? Specialization,
    string? Phone,
    string? Email,
    bool IsReviewer,
    bool IsApprover,
    Guid? UserId) : IRequest<Result>;

public class UpdateDoctorCommandValidator : AbstractValidator<UpdateDoctorCommand>
{
    public UpdateDoctorCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public class UpdateDoctorCommandHandler(
    IRepository<Doctor> doctorRepo,
    IUnitOfWork uow)
    : IRequestHandler<UpdateDoctorCommand, Result>
{
    public async Task<Result> Handle(UpdateDoctorCommand request, CancellationToken cancellationToken)
    {
        var doctor = await doctorRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Doctor), request.Id);

        doctor.Update(request.FullName, request.Specialization,
            request.Phone, request.Email,
            request.IsReviewer, request.IsApprover, request.UserId);

        doctorRepo.Update(doctor);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
