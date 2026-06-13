using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Content;

public class ContentFaqItem : AuditableEntity
{
    public string QuestionEn { get; private set; } = string.Empty;
    public string QuestionAr { get; private set; } = string.Empty;
    public string AnswerEn { get; private set; } = string.Empty;
    public string AnswerAr { get; private set; } = string.Empty;
    public string? Category { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    private ContentFaqItem() { }

    public static ContentFaqItem Create(
        string questionEn, string questionAr,
        string answerEn, string answerAr,
        string? category, int sortOrder)
    {
        return new ContentFaqItem
        {
            Id = Guid.NewGuid(),
            QuestionEn = questionEn.Trim(),
            QuestionAr = questionAr.Trim(),
            AnswerEn = answerEn.Trim(),
            AnswerAr = answerAr.Trim(),
            Category = category?.Trim(),
            SortOrder = sortOrder,
            IsActive = true
        };
    }

    public void Update(
        string questionEn, string questionAr,
        string answerEn, string answerAr,
        string? category, int sortOrder)
    {
        QuestionEn = questionEn.Trim();
        QuestionAr = questionAr.Trim();
        AnswerEn = answerEn.Trim();
        AnswerAr = answerAr.Trim();
        Category = category?.Trim();
        SortOrder = sortOrder;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
