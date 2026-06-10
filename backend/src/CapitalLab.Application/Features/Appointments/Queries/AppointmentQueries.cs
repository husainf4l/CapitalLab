using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Extensions;
using CapitalLab.Contracts.Appointments;
using CapitalLab.Contracts.Common;
using ContractAppointmentStatus = CapitalLab.Contracts.Enums.AppointmentStatus;
using ContractAppointmentType = CapitalLab.Contracts.Enums.AppointmentType;
using ContractOrderItemType = CapitalLab.Contracts.Enums.OrderItemType;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Appointments.Queries;

public record GetAppointmentsQuery(
    PaginationRequest Pagination,
    Guid? PatientId = null,
    Guid? BranchId = null,
    AppointmentStatus? Status = null,
    AppointmentType? AppointmentType = null,
    DateOnly? DateFrom = null,
    DateOnly? DateTo = null) : IRequest<Result<PagedResult<AppointmentSummaryResponse>>>;

public record GetAppointmentByIdQuery(Guid Id) : IRequest<Result<AppointmentResponse>>;
public record GetAppointmentsByPatientQuery(Guid PatientId, PaginationRequest Pagination) : IRequest<Result<PagedResult<AppointmentSummaryResponse>>>;
public record GetAppointmentsByBranchQuery(Guid BranchId, PaginationRequest Pagination) : IRequest<Result<PagedResult<AppointmentSummaryResponse>>>;
public record GetTodayAppointmentsQuery(PaginationRequest Pagination, Guid? BranchId = null) : IRequest<Result<PagedResult<AppointmentSummaryResponse>>>;

public class GetAppointmentsQueryHandler(
    IRepository<Appointment> appointmentRepo,
    IRepository<AppointmentItem> itemRepo) : IRequestHandler<GetAppointmentsQuery, Result<PagedResult<AppointmentSummaryResponse>>>
{
    public async Task<Result<PagedResult<AppointmentSummaryResponse>>> Handle(GetAppointmentsQuery request, CancellationToken cancellationToken)
    {
        var query = ApplyFilters(appointmentRepo.Query(), request.PatientId, request.BranchId, request.Status, request.AppointmentType, request.DateFrom, request.DateTo, request.Pagination.Search);
        query = Sort(query, request.Pagination);
        var paged = await query.ToPagedResultAsync(request.Pagination.WithClampedPageSize(), cancellationToken);
        var counts = await ItemCountsAsync(itemRepo, paged.Items.Select(a => a.Id).ToList(), cancellationToken);
        return Result<PagedResult<AppointmentSummaryResponse>>.Success(paged.Map(a => ToSummary(a, counts)));
    }

    internal static IQueryable<Appointment> ApplyFilters(IQueryable<Appointment> query, Guid? patientId, Guid? branchId, AppointmentStatus? status, AppointmentType? type, DateOnly? from, DateOnly? to, string? search)
    {
        if (patientId.HasValue) query = query.Where(a => a.PatientId == patientId);
        if (branchId.HasValue) query = query.Where(a => a.BranchId == branchId);
        if (status.HasValue) query = query.Where(a => a.Status == status);
        if (type.HasValue) query = query.Where(a => a.AppointmentType == type);
        if (from.HasValue) query = query.Where(a => a.AppointmentDate >= from);
        if (to.HasValue) query = query.Where(a => a.AppointmentDate <= to);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLowerInvariant();
            query = query.Where(a => a.AppointmentNumber.ToLower().Contains(s));
        }
        return query;
    }

    internal static IQueryable<Appointment> Sort(IQueryable<Appointment> query, PaginationRequest pagination) =>
        pagination.SortBy?.ToLowerInvariant() switch
        {
            "status" => pagination.IsDescending ? query.OrderByDescending(a => a.Status) : query.OrderBy(a => a.Status),
            "date" or "appointmentdate" => pagination.IsDescending ? query.OrderByDescending(a => a.AppointmentDate).ThenByDescending(a => a.StartTime) : query.OrderBy(a => a.AppointmentDate).ThenBy(a => a.StartTime),
            _ => pagination.IsDescending ? query.OrderByDescending(a => a.AppointmentDate).ThenByDescending(a => a.StartTime) : query.OrderBy(a => a.AppointmentDate).ThenBy(a => a.StartTime)
        };

    internal static async Task<Dictionary<Guid, int>> ItemCountsAsync(IRepository<AppointmentItem> itemRepo, List<Guid> appointmentIds, CancellationToken ct) =>
        await itemRepo.Query()
            .Where(i => appointmentIds.Contains(i.AppointmentId))
            .GroupBy(i => i.AppointmentId)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count, ct);

    internal static AppointmentSummaryResponse ToSummary(Appointment a, Dictionary<Guid, int> counts) =>
        new(
            a.Id,
            a.AppointmentNumber,
            a.PatientId,
            a.BranchId,
            (ContractAppointmentType)a.AppointmentType,
            a.AppointmentDate,
            a.StartTime,
            a.EndTime,
            (ContractAppointmentStatus)a.Status,
            counts.TryGetValue(a.Id, out var count) ? count : 0);
}

public class GetAppointmentByIdQueryHandler(
    IRepository<Appointment> appointmentRepo,
    IRepository<AppointmentItem> itemRepo,
    IRepository<AppointmentStatusHistory> historyRepo) : IRequestHandler<GetAppointmentByIdQuery, Result<AppointmentResponse>>
{
    public async Task<Result<AppointmentResponse>> Handle(GetAppointmentByIdQuery request, CancellationToken cancellationToken)
    {
        var appointment = await appointmentRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), request.Id);
        var items = await itemRepo.Query().Where(i => i.AppointmentId == appointment.Id).ToListAsync(cancellationToken);
        var history = await historyRepo.Query().Where(h => h.AppointmentId == appointment.Id).OrderBy(h => h.ChangedAt).ToListAsync(cancellationToken);
        return Result<AppointmentResponse>.Success(new AppointmentResponse(
            appointment.Id,
            appointment.AppointmentNumber,
            appointment.PatientId,
            appointment.BranchId,
            (ContractAppointmentType)appointment.AppointmentType,
            appointment.AppointmentDate,
            appointment.StartTime,
            appointment.EndTime,
            (ContractAppointmentStatus)appointment.Status,
            appointment.Notes,
            appointment.CancellationReason,
            appointment.ConfirmedAt,
            appointment.CancelledAt,
            appointment.CompletedAt,
            items.Select(i => new AppointmentItemResponse(i.Id, i.LabTestId, i.HealthPackageId, (ContractOrderItemType)i.ItemType, i.NameSnapshot, i.CodeSnapshot, i.PriceSnapshot, i.CurrencySnapshot)).ToList(),
            history.Select(h => new AppointmentStatusHistoryResponse(h.Id, (ContractAppointmentStatus)h.OldStatus, (ContractAppointmentStatus)h.NewStatus, h.ChangedBy, h.ChangedAt, h.Reason)).ToList()));
    }
}

public class GetAppointmentsByPatientQueryHandler(ISender sender) : IRequestHandler<GetAppointmentsByPatientQuery, Result<PagedResult<AppointmentSummaryResponse>>>
{
    public Task<Result<PagedResult<AppointmentSummaryResponse>>> Handle(GetAppointmentsByPatientQuery request, CancellationToken cancellationToken) =>
        sender.Send(new GetAppointmentsQuery(request.Pagination, PatientId: request.PatientId), cancellationToken);
}

public class GetAppointmentsByBranchQueryHandler(ISender sender) : IRequestHandler<GetAppointmentsByBranchQuery, Result<PagedResult<AppointmentSummaryResponse>>>
{
    public Task<Result<PagedResult<AppointmentSummaryResponse>>> Handle(GetAppointmentsByBranchQuery request, CancellationToken cancellationToken) =>
        sender.Send(new GetAppointmentsQuery(request.Pagination, BranchId: request.BranchId), cancellationToken);
}

public class GetTodayAppointmentsQueryHandler(ISender sender) : IRequestHandler<GetTodayAppointmentsQuery, Result<PagedResult<AppointmentSummaryResponse>>>
{
    public Task<Result<PagedResult<AppointmentSummaryResponse>>> Handle(GetTodayAppointmentsQuery request, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return sender.Send(new GetAppointmentsQuery(request.Pagination, BranchId: request.BranchId, DateFrom: today, DateTo: today), cancellationToken);
    }
}
