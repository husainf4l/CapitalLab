using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Staff;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using MediatR;

namespace CapitalLab.Application.Features.Staff.Queries;

public record GetStaffByIdQuery(Guid Id) : IRequest<Result<StaffResponse>>;

public class GetStaffByIdQueryHandler(
    IRepository<StaffProfile> staffRepo,
    IRepository<Branch> branchRepo)
    : IRequestHandler<GetStaffByIdQuery, Result<StaffResponse>>
{
    public async Task<Result<StaffResponse>> Handle(
        GetStaffByIdQuery request, CancellationToken cancellationToken)
    {
        var staff = await staffRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(StaffProfile), request.Id);

        var branch = await branchRepo.GetByIdAsync(staff.BranchId, cancellationToken);

        return Result<StaffResponse>.Success(new StaffResponse(
            staff.Id, staff.UserId, staff.BranchId,
            branch?.Name ?? string.Empty,
            staff.EmployeeCode, staff.FullName, staff.JobTitle,
            staff.Department, staff.Phone, staff.Email,
            staff.HireDate, staff.IsActive, staff.CreatedAt));
    }
}
