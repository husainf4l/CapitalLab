using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Doctors;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using Mapster;
using MediatR;

namespace CapitalLab.Application.Features.Doctors.Queries;

public record GetDoctorByIdQuery(Guid Id) : IRequest<Result<DoctorResponse>>;

public class GetDoctorByIdQueryHandler(IRepository<Doctor> doctorRepo)
    : IRequestHandler<GetDoctorByIdQuery, Result<DoctorResponse>>
{
    public async Task<Result<DoctorResponse>> Handle(
        GetDoctorByIdQuery request, CancellationToken cancellationToken)
    {
        var doctor = await doctorRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Doctor), request.Id);

        var response = new DoctorResponse(
            doctor.Id, doctor.UserId, doctor.BranchId,
            string.Empty, // BranchName populated via EF projection in list queries
            doctor.FullName, doctor.Specialization,
            doctor.LicenseNumber, doctor.Phone, doctor.Email,
            doctor.DigitalSignatureUrl,
            doctor.IsReviewer, doctor.IsApprover,
            doctor.IsActive, doctor.CreatedAt);

        return Result<DoctorResponse>.Success(response);
    }
}
