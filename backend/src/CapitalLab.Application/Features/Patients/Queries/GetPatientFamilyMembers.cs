using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Patients;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Patients.Queries;

public record GetPatientFamilyMembersQuery(Guid PatientId) : IRequest<Result<List<FamilyMemberResponse>>>;

public class GetPatientFamilyMembersQueryHandler(
    IRepository<Patient> patientRepo,
    IRepository<PatientFamilyMember> familyRepo)
    : IRequestHandler<GetPatientFamilyMembersQuery, Result<List<FamilyMemberResponse>>>
{
    public async Task<Result<List<FamilyMemberResponse>>> Handle(
        GetPatientFamilyMembersQuery request, CancellationToken cancellationToken)
    {
        var patientExists = await patientRepo.ExistsAsync(p => p.Id == request.PatientId, cancellationToken);
        if (!patientExists) throw new NotFoundException(nameof(Patient), request.PatientId);

        var members = await familyRepo.Query()
            .Where(f => f.PrimaryPatientId == request.PatientId)
            .Join(patientRepo.Query(),
                f => f.FamilyPatientId,
                p => p.Id,
                (f, p) => new FamilyMemberResponse(
                    f.Id,
                    p.Id,
                    p.FirstName + " " + p.LastName,
                    p.PatientNumber,
                    (Contracts.Enums.FamilyRelationship)f.Relationship))
            .ToListAsync(cancellationToken);

        return Result<List<FamilyMemberResponse>>.Success(members);
    }
}
