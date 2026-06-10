using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace CapitalLab.Application.Features.Appointments.Commands;

public record CreateAppointmentItem(Guid? LabTestId, Guid? HealthPackageId);

public record CreateAppointmentHomeCollection(
    string Address,
    string? City,
    string? Area,
    decimal? Latitude,
    decimal? Longitude,
    DateOnly PreferredDate,
    TimeOnly PreferredTimeFrom,
    TimeOnly PreferredTimeTo,
    string? CollectionNotes);

public record CreateAppointmentCommand(
    Guid PatientId,
    Guid BranchId,
    AppointmentType AppointmentType,
    DateOnly AppointmentDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Notes,
    List<CreateAppointmentItem> Items,
    CreateAppointmentHomeCollection? HomeCollection) : IRequest<Result<Guid>>;

public class CreateAppointmentCommandValidator : AbstractValidator<CreateAppointmentCommand>
{
    public CreateAppointmentCommandValidator()
    {
        RuleFor(x => x.PatientId).NotEmpty();
        RuleFor(x => x.BranchId).NotEmpty();
        RuleFor(x => x.AppointmentType).IsInEnum();
        RuleFor(x => x.AppointmentDate)
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Appointment date cannot be in the past.");
        RuleFor(x => x.StartTime).LessThan(x => x.EndTime);
        RuleFor(x => x.Items).NotEmpty();
        RuleForEach(x => x.Items).Must(i => i.LabTestId.HasValue ^ i.HealthPackageId.HasValue)
            .WithMessage("Each item must be either a lab test or a health package.");
        When(x => x.AppointmentType == AppointmentType.HomeCollection, () =>
        {
            RuleFor(x => x.HomeCollection).NotNull();
            RuleFor(x => x.HomeCollection!.Address).NotEmpty().MaximumLength(500);
            RuleFor(x => x.HomeCollection!.PreferredTimeFrom).LessThan(x => x.HomeCollection!.PreferredTimeTo);
        });
    }
}

public class CreateAppointmentCommandHandler(
    IRepository<Appointment> appointmentRepo,
    IRepository<AppointmentItem> appointmentItemRepo,
    IRepository<HomeCollectionRequest> homeCollectionRepo,
    IRepository<Patient> patientRepo,
    IRepository<Branch> branchRepo,
    IRepository<LabTest> labTestRepo,
    IRepository<HealthPackage> packageRepo,
    IAppointmentNumberService numberService,
    IUnitOfWork uow)
    : IRequestHandler<CreateAppointmentCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
    {
        var patientExists = await patientRepo.ExistsAsync(p => p.Id == request.PatientId && p.IsActive, cancellationToken);
        if (!patientExists) throw new NotFoundException(nameof(Patient), request.PatientId);

        var branchExists = await branchRepo.ExistsAsync(b => b.Id == request.BranchId && b.IsActive, cancellationToken);
        if (!branchExists) throw new NotFoundException(nameof(Branch), request.BranchId);

        var appointmentNumber = await numberService.GenerateNextAsync(request.AppointmentDate, cancellationToken);
        var appointment = Appointment.Create(
            appointmentNumber,
            request.PatientId,
            request.BranchId,
            request.AppointmentType,
            request.AppointmentDate,
            request.StartTime,
            request.EndTime,
            request.Notes);

        await appointmentRepo.AddAsync(appointment, cancellationToken);

        foreach (var item in request.Items)
        {
            if (item.LabTestId is { } labTestId)
            {
                var test = await labTestRepo.GetByIdAsync(labTestId, cancellationToken)
                    ?? throw new NotFoundException(nameof(LabTest), labTestId);
                if (!test.IsActive) throw new BusinessRuleException("LabTest.Inactive", "Lab test is not active.");
                await appointmentItemRepo.AddAsync(AppointmentItem.CreateLabTest(
                    appointment.Id, test.Id, test.Name, test.Code, test.Price, test.Currency), cancellationToken);
            }
            else if (item.HealthPackageId is { } packageId)
            {
                var package = await packageRepo.GetByIdAsync(packageId, cancellationToken)
                    ?? throw new NotFoundException(nameof(HealthPackage), packageId);
                if (!package.IsActive) throw new BusinessRuleException("HealthPackage.Inactive", "Health package is not active.");
                await appointmentItemRepo.AddAsync(AppointmentItem.CreateHealthPackage(
                    appointment.Id, package.Id, package.Name, package.Code, package.EffectivePrice, package.Currency), cancellationToken);
            }
        }

        if (request.AppointmentType == AppointmentType.HomeCollection && request.HomeCollection is not null)
        {
            var hc = request.HomeCollection;
            await homeCollectionRepo.AddAsync(HomeCollectionRequest.Create(
                appointment.Id,
                request.PatientId,
                hc.Address,
                hc.City,
                hc.Area,
                hc.Latitude,
                hc.Longitude,
                hc.PreferredDate,
                hc.PreferredTimeFrom,
                hc.PreferredTimeTo,
                hc.CollectionNotes), cancellationToken);
        }

        await uow.CommitAsync(cancellationToken);
        return Result<Guid>.Success(appointment.Id);
    }
}
