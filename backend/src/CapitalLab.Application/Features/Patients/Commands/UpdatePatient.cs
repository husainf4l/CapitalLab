using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Patients.Commands;

public record UpdatePatientCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string? NameAr,
    Gender Gender,
    DateOnly DateOfBirth,
    string? NationalId,
    string? PassportNumber,
    string Phone,
    string? Email,
    string? Address,
    string? City,
    string? Area,
    string? EmergencyContactName,
    string? EmergencyContactPhone,
    string? InsuranceProvider,
    string? InsuranceNumber,
    string? MedicalHistory,
    string? Allergies) : IRequest<Result>;

public class UpdatePatientCommandValidator : AbstractValidator<UpdatePatientCommand>
{
    public UpdatePatientCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Gender).IsInEnum();
        RuleFor(x => x.DateOfBirth).NotEmpty().LessThan(DateOnly.FromDateTime(DateTime.UtcNow));
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public class UpdatePatientCommandHandler(
    IRepository<Patient> patientRepo,
    IEncryptionService encryption,
    IUnitOfWork uow)
    : IRequestHandler<UpdatePatientCommand, Result>
{
    public async Task<Result> Handle(UpdatePatientCommand request, CancellationToken cancellationToken)
    {
        var patient = await patientRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Patient), request.Id);

        var nationalId = request.NationalId is not null
            ? encryption.Encrypt(request.NationalId)
            : null;
        var passportNumber = request.PassportNumber is not null
            ? encryption.Encrypt(request.PassportNumber)
            : null;
        var insuranceNumber = request.InsuranceNumber is not null
            ? encryption.Encrypt(request.InsuranceNumber)
            : null;

        patient.Update(
            request.FirstName, request.LastName, request.NameAr,
            request.Gender, request.DateOfBirth,
            nationalId, passportNumber,
            request.Phone, request.Email,
            request.Address, request.City, request.Area,
            request.EmergencyContactName, request.EmergencyContactPhone,
            request.InsuranceProvider, insuranceNumber,
            request.MedicalHistory, request.Allergies);

        patientRepo.Update(patient);
        await uow.CommitAsync(cancellationToken);

        return Result.Success();
    }
}
