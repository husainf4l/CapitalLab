using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Patients.Commands;

public record AddFamilyMemberCommand(
    Guid PrimaryPatientId,
    Guid FamilyPatientId,
    FamilyRelationship Relationship) : IRequest<Result<Guid>>;

public class AddFamilyMemberCommandValidator : AbstractValidator<AddFamilyMemberCommand>
{
    public AddFamilyMemberCommandValidator()
    {
        RuleFor(x => x.PrimaryPatientId).NotEmpty();
        RuleFor(x => x.FamilyPatientId)
            .NotEmpty()
            .NotEqual(x => x.PrimaryPatientId)
            .WithMessage("A patient cannot be their own family member.");
        RuleFor(x => x.Relationship).IsInEnum();
    }
}

public class AddFamilyMemberCommandHandler(
    IRepository<Patient> patientRepo,
    IRepository<PatientFamilyMember> familyRepo,
    IUnitOfWork uow)
    : IRequestHandler<AddFamilyMemberCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(AddFamilyMemberCommand request, CancellationToken cancellationToken)
    {
        var primary = await patientRepo.GetByIdAsync(request.PrimaryPatientId, cancellationToken)
            ?? throw new NotFoundException(nameof(Patient), request.PrimaryPatientId);

        var familyPatientExists = await patientRepo.ExistsAsync(
            p => p.Id == request.FamilyPatientId, cancellationToken);
        if (!familyPatientExists)
            throw new NotFoundException(nameof(Patient), request.FamilyPatientId);

        var alreadyLinked = await familyRepo.ExistsAsync(
            f => f.PrimaryPatientId == request.PrimaryPatientId
                 && f.FamilyPatientId == request.FamilyPatientId, cancellationToken);
        if (alreadyLinked)
            throw new ConflictException("This family member relationship already exists.");

        var link = PatientFamilyMember.Create(
            request.PrimaryPatientId, request.FamilyPatientId, request.Relationship);

        await familyRepo.AddAsync(link, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result<Guid>.Success(link.Id);
    }
}
