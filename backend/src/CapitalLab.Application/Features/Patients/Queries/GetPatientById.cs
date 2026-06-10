using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Patients;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Patients.Queries;

public record GetPatientByIdQuery(Guid Id) : IRequest<Result<PatientResponse>>;

public class GetPatientByIdQueryHandler(IRepository<Patient> patientRepo)
    : IRequestHandler<GetPatientByIdQuery, Result<PatientResponse>>
{
    public async Task<Result<PatientResponse>> Handle(
        GetPatientByIdQuery request, CancellationToken cancellationToken)
    {
        var patient = await patientRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Patient), request.Id);

        return Result<PatientResponse>.Success(new PatientResponse(
            patient.Id,
            patient.PatientNumber,
            patient.FirstName,
            patient.LastName,
            patient.NameAr,
            $"{patient.FirstName} {patient.LastName}",
            (Contracts.Enums.Gender)patient.Gender,
            patient.DateOfBirth,
            patient.Age,
            patient.Phone,
            patient.Email,
            patient.Address,
            patient.City,
            patient.Area,
            patient.EmergencyContactName,
            patient.EmergencyContactPhone,
            patient.InsuranceProvider,
            patient.MedicalHistory,
            patient.Allergies,
            patient.IsActive,
            patient.CreatedAt));
    }
}
