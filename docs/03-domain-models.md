# Capital Lab — Domain Models & DTOs

## Domain Entity Conventions

- All entities inherit from `AuditableEntity` which provides: `Id`, `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`, `DeletedAt`
- Soft deletes via `DeletedAt`
- Domain events collected in `BaseEntity.DomainEvents` list
- Value objects are immutable records

---

## Base Classes

```csharp
// Domain/Common/BaseEntity.cs
public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    private readonly List<IDomainEvent> _domainEvents = [];
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();
    protected void RaiseDomainEvent(IDomainEvent @event) => _domainEvents.Add(@event);
    public void ClearDomainEvents() => _domainEvents.Clear();
}

// Domain/Common/AuditableEntity.cs
public abstract class AuditableEntity : BaseEntity
{
    public DateTime CreatedAt { get; protected set; }
    public Guid? CreatedBy { get; protected set; }
    public DateTime UpdatedAt { get; protected set; }
    public Guid? UpdatedBy { get; protected set; }
    public DateTime? DeletedAt { get; protected set; }
    public bool IsDeleted => DeletedAt.HasValue;
    public void SoftDelete(Guid deletedBy) { DeletedAt = DateTime.UtcNow; UpdatedBy = deletedBy; }
}

// Domain/Common/ValueObject.cs
public abstract class ValueObject
{
    protected abstract IEnumerable<object?> GetEqualityComponents();
    public override bool Equals(object? obj) { ... }
    public override int GetHashCode() { ... }
}
```

---

## Domain Entities

### Identity & Organization

```csharp
// Domain/Entities/Identity/AppUser.cs
public class AppUser : IdentityUser<Guid>
{
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string? AvatarUrl { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public string LanguagePreference { get; private set; } = "en";
    public ICollection<UserRole> UserRoles { get; private set; } = [];
    public ICollection<StaffAssignment> StaffAssignments { get; private set; } = [];
    public string FullName => $"{FirstName} {LastName}";
}

// Domain/Entities/Organization/Lab.cs
public class Lab : AuditableEntity
{
    public string NameEn { get; private set; }
    public string? NameAr { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? LicenseNo { get; private set; }
    public bool IsActive { get; private set; }
    public LabSettings Settings { get; private set; }
    public ICollection<Branch> Branches { get; private set; } = [];
}

// Domain/Entities/Organization/Branch.cs
public class Branch : AuditableEntity
{
    public Guid LabId { get; private set; }
    public Lab Lab { get; private set; }
    public string NameEn { get; private set; }
    public string? NameAr { get; private set; }
    public string Code { get; private set; }
    public Address Address { get; private set; }  // value object
    public GeoCoordinates? Location { get; private set; }  // value object
    public WorkingHours WorkingHours { get; private set; }  // value object
    public bool IsActive { get; private set; }
    public bool IsHomeCollectionEnabled { get; private set; }
}
```

### Patient

```csharp
// Domain/Entities/Patients/Patient.cs
public class Patient : AuditableEntity
{
    public Guid LabId { get; private set; }
    public Guid? UserId { get; private set; }       // if portal user
    public string PatientCode { get; private set; } // P-YYYYNNNNN
    public string FirstNameEn { get; private set; }
    public string LastNameEn { get; private set; }
    public string? FirstNameAr { get; private set; }
    public string? LastNameAr { get; private set; }
    public Gender Gender { get; private set; }
    public DateOnly DateOfBirth { get; private set; }
    public EncryptedString? NationalId { get; private set; }
    public EncryptedString? PassportNo { get; private set; }
    public string? BloodType { get; private set; }
    public PhoneNumber PrimaryPhone { get; private set; }   // value object
    public string? Email { get; private set; }
    public PatientAddress? Address { get; private set; }    // value object
    public bool IsActive { get; private set; }
    public ICollection<EmergencyContact> EmergencyContacts { get; private set; } = [];
    public ICollection<InsuranceInfo> InsuranceRecords { get; private set; } = [];
    public ICollection<MedicalHistory> MedicalHistories { get; private set; } = [];
    public ICollection<Allergy> Allergies { get; private set; } = [];
    public int Age => DateOnly.FromDateTime(DateTime.UtcNow).Year - DateOfBirth.Year;
    public string FullName => $"{FirstNameEn} {LastNameEn}";

    public static Patient Create(CreatePatientData data) { ... }
    public void UpdateProfile(UpdatePatientData data) { ... }
}

// Domain/Entities/Patients/InsuranceInfo.cs
public class InsuranceInfo : BaseEntity
{
    public Guid PatientId { get; private set; }
    public string ProviderName { get; private set; }
    public EncryptedString PolicyNumber { get; private set; }
    public EncryptedString? MemberId { get; private set; }
    public DateOnly ValidFrom { get; private set; }
    public DateOnly? ValidTo { get; private set; }
    public bool IsPrimary { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsExpired => ValidTo.HasValue && ValidTo.Value < DateOnly.FromDateTime(DateTime.UtcNow);
}
```

### Doctor

```csharp
// Domain/Entities/Clinical/Doctor.cs
public class Doctor : AuditableEntity
{
    public Guid UserId { get; private set; }
    public AppUser User { get; private set; }
    public Guid LabId { get; private set; }
    public string LicenseNumber { get; private set; }
    public Guid? SpecializationId { get; private set; }
    public string? SignatureUrl { get; private set; }
    public string? DigitalCertPath { get; private set; }
    public bool IsActive { get; private set; }
    public ICollection<DoctorBranch> DoctorBranches { get; private set; } = [];

    public void UpdateSignature(string signatureUrl) { ... }
    public void AssignToBranch(Guid branchId, bool isPrimary) { ... }
}
```

### Test Catalog

```csharp
// Domain/Entities/Catalog/Test.cs
public class Test : AuditableEntity
{
    public Guid LabId { get; private set; }
    public Guid CategoryId { get; private set; }
    public string Code { get; private set; }
    public string NameEn { get; private set; }
    public string? NameAr { get; private set; }
    public string? DescriptionEn { get; private set; }
    public string? PreparationEn { get; private set; }
    public Guid SampleTypeId { get; private set; }
    public int TurnaroundHours { get; private set; }
    public Money Price { get; private set; }  // value object
    public string? LoincCode { get; private set; }
    public bool IsActive { get; private set; }
    public bool RequiresDoctorApproval { get; private set; }
    public bool IsCriticalValueEnabled { get; private set; }
    public ICollection<ReferenceRange> ReferenceRanges { get; private set; } = [];
}

// Domain/Entities/Catalog/ReferenceRange.cs
public class ReferenceRange : BaseEntity
{
    public Guid TestId { get; private set; }
    public int? AgeMinMonths { get; private set; }
    public int? AgeMaxMonths { get; private set; }
    public Gender? Gender { get; private set; }
    public decimal? ValueMin { get; private set; }
    public decimal? ValueMax { get; private set; }
    public string? Unit { get; private set; }
    public string? TextValue { get; private set; }
    public decimal? CriticalLow { get; private set; }
    public decimal? CriticalHigh { get; private set; }

    public bool Applies(int ageMonths, Gender gender) { ... }
    public ResultInterpretation Interpret(decimal value) { ... }
}

// Domain/Entities/Catalog/Package.cs
public class Package : AuditableEntity
{
    public Guid LabId { get; private set; }
    public string Code { get; private set; }
    public string NameEn { get; private set; }
    public Money Price { get; private set; }
    public Gender? Gender { get; private set; }
    public int? MinAgeYears { get; private set; }
    public int? MaxAgeYears { get; private set; }
    public bool IsActive { get; private set; }
    public ICollection<PackageTest> PackageTests { get; private set; } = [];
}
```

### Appointment

```csharp
// Domain/Entities/Appointments/Appointment.cs
public class Appointment : AuditableEntity
{
    public string AppointmentNo { get; private set; }
    public Guid BranchId { get; private set; }
    public Guid PatientId { get; private set; }
    public Guid? BookedBy { get; private set; }
    public DateTime ScheduledAt { get; private set; }
    public int DurationMinutes { get; private set; }
    public AppointmentType Type { get; private set; }
    public AppointmentStatus Status { get; private set; }
    public DateTime? CheckInAt { get; private set; }
    public string? Notes { get; private set; }
    public ICollection<AppointmentTest> Tests { get; private set; } = [];
    public HomeCollection? HomeCollection { get; private set; }

    public static Appointment Book(BookAppointmentData data) { ... }
    public void Confirm(Guid confirmedBy) { ... }
    public void CheckIn() { ... }
    public void Complete() { ... }
    public void Cancel(string reason, Guid cancelledBy) { ... }
    public decimal TotalPrice => Tests.Sum(t => t.Price - t.Discount);
}

// Domain/Entities/Appointments/HomeCollection.cs
public class HomeCollection : BaseEntity
{
    public Guid AppointmentId { get; private set; }
    public CollectionAddress Address { get; private set; }  // value object
    public GeoCoordinates? Location { get; private set; }
    public DateTime PreferredTime { get; private set; }
    public Guid? AssignedStaffId { get; private set; }
    public HomeCollectionStatus VisitStatus { get; private set; }
    public DateTime? DispatchedAt { get; private set; }
    public DateTime? CollectedAt { get; private set; }

    public void AssignStaff(Guid staffId) { ... }
    public void Dispatch() { ... }
    public void MarkCollected(string? notes) { ... }
}
```

### Sample

```csharp
// Domain/Entities/Samples/Sample.cs
public class Sample : AuditableEntity
{
    public string SampleNo { get; private set; }
    public string Barcode { get; private set; }
    public string? QrCode { get; private set; }
    public Guid AppointmentId { get; private set; }
    public Guid PatientId { get; private set; }
    public Guid BranchId { get; private set; }
    public Guid TestId { get; private set; }
    public Guid SampleTypeId { get; private set; }
    public SampleStatus Status { get; private set; }
    public Guid? CollectedBy { get; private set; }
    public DateTime? CollectedAt { get; private set; }
    public Guid? ReceivedBy { get; private set; }
    public DateTime? ReceivedAt { get; private set; }
    public string? RejectedReason { get; private set; }
    public ICollection<SampleTrackingEvent> TrackingEvents { get; private set; } = [];

    public void Collect(Guid collectedBy) { ... }
    public void Receive(Guid receivedBy) { ... }
    public void Reject(string reason, Guid rejectedBy) { ... }
    public void Transition(SampleStatus newStatus, Guid userId) { ... }
}
```

### Result

```csharp
// Domain/Entities/Results/TestResult.cs
public class TestResult : AuditableEntity
{
    public string ResultNo { get; private set; }
    public Guid SampleId { get; private set; }
    public Guid PatientId { get; private set; }
    public Guid TestId { get; private set; }
    public Guid BranchId { get; private set; }
    public ResultStatus Status { get; private set; }
    public decimal? NumericValue { get; private set; }
    public string? TextValue { get; private set; }
    public string? Unit { get; private set; }
    public bool IsAbnormal { get; private set; }
    public bool IsCritical { get; private set; }
    public ResultInterpretation Interpretation { get; private set; }
    public Guid EnteredBy { get; private set; }
    public Guid? ReviewedBy { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public Guid? ReleasedBy { get; private set; }
    public ICollection<ResultNote> Notes { get; private set; } = [];

    public void EnterResult(decimal? numericValue, string? textValue, Guid enteredBy) { ... }
    public void Review(Guid reviewedBy) { ... }
    public void Approve(Guid approvedBy) { ... }
    public void Release(Guid releasedBy) { RaiseDomainEvent(new ResultReleasedEvent(this)); }
    public void RequestRetest(string reason, Guid requestedBy) { ... }
}
```

---

## Value Objects

```csharp
// Domain/Common/ValueObjects/Money.cs
public record Money(decimal Amount, string Currency = "SAR")
{
    public static Money Zero => new(0);
    public static Money operator +(Money a, Money b) => new(a.Amount + b.Amount, a.Currency);
}

// Domain/Common/ValueObjects/Address.cs
public record Address(string Street, string City, string Region, string PostalCode, string Country);

// Domain/Common/ValueObjects/GeoCoordinates.cs
public record GeoCoordinates(decimal Latitude, decimal Longitude);

// Domain/Common/ValueObjects/PhoneNumber.cs
public record PhoneNumber(string Number)
{
    public static PhoneNumber Create(string raw) { /* validate + normalize */ }
}

// Domain/Common/ValueObjects/EncryptedString.cs
public record EncryptedString(string CipherText)
{
    public static EncryptedString Encrypt(string plainText, IEncryptionService enc) { ... }
    public string Decrypt(IEncryptionService enc) { ... }
}
```

---

## Domain Events

```csharp
public record PatientRegisteredEvent(Patient Patient) : IDomainEvent;
public record AppointmentBookedEvent(Appointment Appointment) : IDomainEvent;
public record AppointmentCancelledEvent(Appointment Appointment, string Reason) : IDomainEvent;
public record SampleCollectedEvent(Sample Sample) : IDomainEvent;
public record SampleStatusChangedEvent(Sample Sample, SampleStatus OldStatus) : IDomainEvent;
public record ResultEnteredEvent(TestResult Result) : IDomainEvent;
public record ResultReleasedEvent(TestResult Result) : IDomainEvent;
public record CriticalValueDetectedEvent(TestResult Result) : IDomainEvent;
public record PaymentReceivedEvent(Payment Payment) : IDomainEvent;
public record LowStockAlertEvent(StockItem Item, Guid BranchId, decimal CurrentQuantity) : IDomainEvent;
public record HomeCollectionRequestedEvent(HomeCollection HomeCollection) : IDomainEvent;
```

---

## DTOs / Contracts

### Auth

```csharp
// Contracts/Requests/Auth/LoginRequest.cs
public record LoginRequest(string Email, string Password, string? DeviceInfo);

// Contracts/Requests/Auth/RefreshTokenRequest.cs
public record RefreshTokenRequest(string AccessToken, string RefreshToken);

// Contracts/Responses/Auth/AuthResponse.cs
public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserProfile User
);

public record UserProfile(
    Guid Id,
    string Email,
    string FullName,
    string? AvatarUrl,
    List<string> Roles,
    List<string> Permissions,
    Guid? BranchId
);
```

### Patient

```csharp
// Contracts/Requests/Patients/CreatePatientRequest.cs
public record CreatePatientRequest(
    string FirstNameEn,
    string LastNameEn,
    string? FirstNameAr,
    string? LastNameAr,
    string Gender,
    DateOnly DateOfBirth,
    string? NationalId,
    string? PassportNo,
    string PrimaryPhone,
    string? Email,
    string? BloodType,
    AddressRequest? Address
);

// Contracts/Responses/Patients/PatientResponse.cs
public record PatientResponse(
    Guid Id,
    string PatientCode,
    string FullName,
    string Gender,
    int Age,
    DateOnly DateOfBirth,
    string PrimaryPhone,
    string? Email,
    bool IsActive,
    DateTime CreatedAt
);

public record PatientDetailResponse(
    Guid Id,
    string PatientCode,
    string FirstNameEn,
    string LastNameEn,
    string? FirstNameAr,
    string? LastNameAr,
    string Gender,
    DateOnly DateOfBirth,
    int Age,
    string? BloodType,
    string PrimaryPhone,
    string? SecondaryPhone,
    string? Email,
    AddressResponse? Address,
    List<EmergencyContactResponse> EmergencyContacts,
    List<InsuranceResponse> InsuranceRecords,
    List<MedicalHistoryResponse> MedicalHistories,
    List<AllergyResponse> Allergies,
    bool IsActive
);
```

### Appointment

```csharp
// Contracts/Requests/Appointments/BookAppointmentRequest.cs
public record BookAppointmentRequest(
    Guid PatientId,
    Guid BranchId,
    DateTime ScheduledAt,
    string Type,           // WalkIn, Scheduled, HomeCollection
    List<AppointmentTestRequest> Tests,
    string? Notes,
    HomeCollectionRequest? HomeCollection
);

public record AppointmentTestRequest(Guid? TestId, Guid? PackageId);

public record HomeCollectionRequest(
    string Street,
    string City,
    decimal? Lat,
    decimal? Lng,
    DateTime PreferredTime
);

// Contracts/Responses/Appointments/AppointmentResponse.cs
public record AppointmentResponse(
    Guid Id,
    string AppointmentNo,
    string Status,
    string Type,
    DateTime ScheduledAt,
    PatientSummary Patient,
    BranchSummary Branch,
    List<AppointmentTestResponse> Tests,
    decimal TotalPrice
);
```

### Sample

```csharp
// Contracts/Responses/Samples/SampleResponse.cs
public record SampleResponse(
    Guid Id,
    string SampleNo,
    string Barcode,
    string Status,
    string TestName,
    string SampleType,
    PatientSummary Patient,
    DateTime? CollectedAt,
    DateTime? ReceivedAt,
    List<TrackingEventResponse> TrackingHistory
);
```

### Result

```csharp
// Contracts/Requests/Results/EnterResultRequest.cs
public record EnterResultRequest(
    Guid SampleId,
    decimal? NumericValue,
    string? TextValue,
    string? Unit,
    List<ResultNoteRequest>? Notes
);

// Contracts/Responses/Results/TestResultResponse.cs
public record TestResultResponse(
    Guid Id,
    string ResultNo,
    string TestName,
    string TestCode,
    decimal? NumericValue,
    string? TextValue,
    string? Unit,
    string Status,
    bool IsAbnormal,
    bool IsCritical,
    string Interpretation,
    ReferenceRangeResponse? ReferenceRange,
    List<ResultNoteResponse> Notes,
    DateTime EnteredAt,
    DateTime? ReleasedAt
);
```

### Report

```csharp
// Contracts/Responses/Reports/LabReportResponse.cs
public record LabReportResponse(
    Guid Id,
    string ReportNo,
    string Status,
    PatientDetailResponse Patient,
    BranchResponse Branch,
    DoctorSummary? SignedBy,
    List<TestResultResponse> Results,
    DateTime? GeneratedAt,
    DateTime? ReleasedAt,
    string? PdfUrl,
    string QrVerificationCode
);
```

### Inventory

```csharp
public record StockItemResponse(
    Guid Id,
    string ItemCode,
    string ItemName,
    string Category,
    decimal Quantity,
    string Unit,
    string? BatchNo,
    DateOnly? ExpiresAt,
    bool IsLowStock,
    bool IsExpiringSoon
);
```

### Analytics

```csharp
public record BranchKpiResponse(
    Guid BranchId,
    string BranchName,
    decimal TotalRevenue,
    int TotalPatients,
    int TotalTests,
    int PendingResults,
    double AverageTurnaroundHours,
    DateTime PeriodStart,
    DateTime PeriodEnd
);

public record OwnerDashboardResponse(
    decimal TotalRevenueMtd,
    decimal RevenueGrowthPercent,
    int TotalPatientsMtd,
    int TotalTestsMtd,
    List<BranchKpiResponse> BranchKpis,
    List<TopTestResponse> TopTests,
    List<RevenueByDayResponse> RevenueChart
);
```

---

## Enums

```csharp
public enum Gender { Male, Female, Other }
public enum AppointmentType { WalkIn, Scheduled, HomeCollection }
public enum AppointmentStatus { Pending, Confirmed, CheckedIn, InProgress, Completed, Cancelled, NoShow }
public enum SampleStatus { Registered, Collected, InTransit, Received, Processing, QualityControl, Rejected, Stored }
public enum ResultStatus { Draft, TechReview, SeniorReview, DoctorReview, Approved, Released, Amended }
public enum ResultInterpretation { Normal, Low, High, CriticalLow, CriticalHigh, Positive, Negative, Indeterminate }
public enum InvoiceStatus { Draft, Issued, PartiallyPaid, Paid, Void, Refunded }
public enum PaymentMethod { Cash, CreditCard, DebitCard, Insurance, BankTransfer, OnlinePayment }
public enum HomeCollectionStatus { Pending, Assigned, Dispatched, Arrived, Collected, Cancelled }
public enum NotificationChannel { Email, SMS, WhatsApp, Push }
public enum StockTransactionType { Receipt, Issue, Adjustment, Return, Waste, Transfer }
public enum UserRole { SuperAdmin, Owner, BranchManager, Doctor, LabTechnician, Receptionist, Phlebotomist, Patient }
```
