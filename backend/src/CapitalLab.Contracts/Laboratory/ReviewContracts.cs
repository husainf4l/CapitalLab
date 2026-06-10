using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Laboratory;

public record CreateDoctorReviewRequest(Guid SampleId, Guid DoctorId, string? Notes);

public record ReviewDecisionRequest(string? Notes);

public record DoctorReviewResponse(
    Guid Id,
    Guid SampleId,
    Guid DoctorId,
    string? Notes,
    DoctorReviewStatus Status,
    DateTime? ReviewedAt,
    DateTime CreatedAt);
