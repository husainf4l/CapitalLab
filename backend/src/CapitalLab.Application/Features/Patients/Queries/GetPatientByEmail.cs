using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Patients.Queries;

public record GetPatientByEmailQuery(string Email) : IRequest<Result<Guid?>>;

public class GetPatientByEmailQueryHandler(IRepository<Patient> patientRepo)
    : IRequestHandler<GetPatientByEmailQuery, Result<Guid?>>
{
    public async Task<Result<Guid?>> Handle(GetPatientByEmailQuery request, CancellationToken cancellationToken)
    {
        var patient = await patientRepo.Query()
            .Where(p => p.Email == request.Email.ToLowerInvariant())
            .Select(p => new { p.Id })
            .FirstOrDefaultAsync(cancellationToken);

        return Result<Guid?>.Success(patient?.Id);
    }
}
