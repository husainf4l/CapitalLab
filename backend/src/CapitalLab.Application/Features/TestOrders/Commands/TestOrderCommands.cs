using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.TestOrders.Commands;

public record CreateTestOrderFromAppointmentCommand(Guid AppointmentId) : IRequest<Result<Guid>>;
public record CancelTestOrderCommand(Guid Id, string? Reason) : IRequest<Result>;

public class CreateTestOrderFromAppointmentCommandHandler(
    IRepository<Appointment> appointmentRepo,
    IRepository<AppointmentItem> appointmentItemRepo,
    IRepository<TestOrder> testOrderRepo,
    IRepository<TestOrderItem> testOrderItemRepo,
    IOrderNumberService orderNumberService,
    IUnitOfWork uow) : IRequestHandler<CreateTestOrderFromAppointmentCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateTestOrderFromAppointmentCommand request, CancellationToken cancellationToken)
    {
        var appointment = await appointmentRepo.GetByIdAsync(request.AppointmentId, cancellationToken)
            ?? throw new NotFoundException(nameof(Appointment), request.AppointmentId);

        if (appointment.Status == AppointmentStatus.Cancelled)
            throw new BusinessRuleException("Appointment.Cancelled", "Cannot create order from cancelled appointment.");
        if (await testOrderRepo.ExistsAsync(o => o.AppointmentId == appointment.Id, cancellationToken))
            throw new ConflictException("A test order already exists for this appointment.");

        var appointmentItems = await appointmentItemRepo.Query()
            .Where(i => i.AppointmentId == appointment.Id)
            .ToListAsync(cancellationToken);
        if (appointmentItems.Count == 0)
            throw new BusinessRuleException("Appointment.NoItems", "Appointment must contain at least one item.");

        var currency = appointmentItems.First().CurrencySnapshot;
        var subtotal = appointmentItems.Sum(i => i.PriceSnapshot);
        var discount = 0m;
        var total = subtotal - discount;
        var orderNumber = await orderNumberService.GenerateNextAsync(DateOnly.FromDateTime(DateTime.UtcNow), cancellationToken);
        var order = TestOrder.Create(orderNumber, appointment.PatientId, appointment.Id, appointment.BranchId, subtotal, discount, total, currency, appointment.Notes);

        await testOrderRepo.AddAsync(order, cancellationToken);
        foreach (var item in appointmentItems)
        {
            var orderItem = item.ItemType == OrderItemType.LabTest
                ? TestOrderItem.CreateLabTest(order.Id, item.LabTestId!.Value, item.NameSnapshot, item.CodeSnapshot, 1, item.PriceSnapshot, item.CurrencySnapshot)
                : TestOrderItem.CreateHealthPackage(order.Id, item.HealthPackageId!.Value, item.NameSnapshot, item.CodeSnapshot, 1, item.PriceSnapshot, 0m, item.CurrencySnapshot);
            await testOrderItemRepo.AddAsync(orderItem, cancellationToken);
        }

        await uow.CommitAsync(cancellationToken);
        return Result<Guid>.Success(order.Id);
    }
}

public class CancelTestOrderCommandHandler(
    IRepository<TestOrder> testOrderRepo,
    IUnitOfWork uow) : IRequestHandler<CancelTestOrderCommand, Result>
{
    public async Task<Result> Handle(CancelTestOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await testOrderRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(TestOrder), request.Id);
        order.Cancel(request.Reason);
        testOrderRepo.Update(order);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}
