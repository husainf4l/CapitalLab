using CapitalLab.Domain.Common;
using CapitalLab.Domain.Enums;

namespace CapitalLab.Domain.Entities.Laboratory;

public class DoctorReview : AggregateRoot
{
    public Guid SampleId { get; private set; }
    public Guid DoctorId { get; private set; }
    public string? Notes { get; private set; }
    public DoctorReviewStatus Status { get; private set; } = DoctorReviewStatus.Pending;
    public DateTime? ReviewedAt { get; private set; }

    private DoctorReview() { }

    public static DoctorReview Create(Guid sampleId, Guid doctorId, string? notes)
    {
        return new DoctorReview
        {
            Id = Guid.NewGuid(),
            SampleId = sampleId,
            DoctorId = doctorId,
            Notes = notes?.Trim(),
            Status = DoctorReviewStatus.Pending
        };
    }

    public void Approve(string? notes, DateTime reviewedAt) => Decide(DoctorReviewStatus.Approved, notes, reviewedAt);
    public void RequestRetest(string? notes, DateTime reviewedAt) => Decide(DoctorReviewStatus.RetestRequired, notes, reviewedAt);
    public void Reject(string? notes, DateTime reviewedAt) => Decide(DoctorReviewStatus.Rejected, notes, reviewedAt);

    private void Decide(DoctorReviewStatus status, string? notes, DateTime reviewedAt)
    {
        if (Status != DoctorReviewStatus.Pending)
            throw new InvalidOperationException($"Review already concluded with status '{Status}'.");
        Status = status;
        if (!string.IsNullOrWhiteSpace(notes)) Notes = notes.Trim();
        ReviewedAt = reviewedAt;
    }
}
