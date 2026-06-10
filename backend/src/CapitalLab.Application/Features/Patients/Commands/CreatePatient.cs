using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Patients.Commands;

public record CreatePatientCommand(
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
    string? Allergies) : IRequest<Result<Guid>>;

public class CreatePatientCommandValidator : AbstractValidator<CreatePatientCommand>
{
    public CreatePatientCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.NameAr).MaximumLength(200).When(x => x.NameAr is not null);
        RuleFor(x => x.Gender).IsInEnum();
        RuleFor(x => x.DateOfBirth)
            .NotEmpty()
            .LessThan(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Date of birth must be in the past.");
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.NationalId).MaximumLength(50).When(x => x.NationalId is not null);
        RuleFor(x => x.PassportNumber).MaximumLength(50).When(x => x.PassportNumber is not null);
    }
}

public class CreatePatientCommandHandler(
    IRepository<Patient> patientRepo,
    IPatientNumberService patientNumberService,
    IEncryptionService encryption,
    IUnitOfWork uow)
    : IRequestHandler<CreatePatientCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreatePatientCommand request, CancellationToken cancellationToken)
    {
        var patientNumber = await patientNumberService.GenerateNextAsync(cancellationToken);

        var nationalId = request.NationalId is not null
            ? encryption.Encrypt(request.NationalId)
            : null;

        var passportNumber = request.PassportNumber is not null
            ? encryption.Encrypt(request.PassportNumber)
            : null;

        var insuranceNumber = request.InsuranceNumber is not null
            ? encryption.Encrypt(request.InsuranceNumber)
            : null;

        var patient = Patient.Create(
            patientNumber,
            request.FirstName, request.LastName, request.NameAr,
            request.Gender, request.DateOfBirth,
            nationalId, passportNumber,
            request.Phone, request.Email,
            request.Address, request.City, request.Area,
            request.EmergencyContactName, request.EmergencyContactPhone,
            request.InsuranceProvider, insuranceNumber,
            request.MedicalHistory, request.Allergies);

        await patientRepo.AddAsync(patient, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result<Guid>.Success(patient.Id);
    }
}
