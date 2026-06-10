using CapitalLab.Domain.Common;
using MediatR;

namespace CapitalLab.Domain.Events;

public sealed record SampleCollectedEvent(Guid SampleId, Guid TestOrderId, Guid PatientId, Guid? CollectedByStaffId) : IDomainEvent, INotification;

public sealed record SampleReceivedEvent(Guid SampleId, Guid PatientId) : IDomainEvent, INotification;

public sealed record SampleProcessingStartedEvent(Guid SampleId, Guid PatientId) : IDomainEvent, INotification;

public sealed record SampleCompletedEvent(Guid SampleId, Guid TestOrderId, Guid PatientId) : IDomainEvent, INotification;

public sealed record ResultEnteredEvent(Guid TestResultId, Guid SampleId, Guid PatientId, Guid LabTestId) : IDomainEvent, INotification;

public sealed record ResultApprovedEvent(Guid TestResultId, Guid SampleId, Guid PatientId, Guid? ApprovedBy) : IDomainEvent, INotification;

public sealed record CriticalResultDetectedEvent(Guid TestResultId, Guid CriticalResultAlertId, Guid PatientId, Guid LabTestId, string TriggerReason) : IDomainEvent, INotification;

public sealed record ReportGeneratedEvent(Guid ReportId, Guid SampleId, Guid PatientId) : IDomainEvent, INotification;

public sealed record ReportReleasedEvent(Guid ReportId, Guid PatientId, Guid? DoctorId) : IDomainEvent, INotification;
