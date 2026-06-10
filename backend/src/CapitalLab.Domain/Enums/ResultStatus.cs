namespace CapitalLab.Domain.Enums;

public enum ResultStatus
{
    Draft = 1,
    TechReview = 2,
    SeniorReview = 3,
    DoctorReview = 4,
    Approved = 5,
    Released = 6,
    Amended = 7,
    PendingReview = 8
}

public enum ResultInterpretation
{
    Normal = 1,
    Low = 2,
    High = 3,
    CriticalLow = 4,
    CriticalHigh = 5,
    Positive = 6,
    Negative = 7,
    Indeterminate = 8
}
