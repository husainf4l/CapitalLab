namespace CapitalLab.Domain.Common;

/// <summary>
/// Extends BaseEntity with full audit fields (who/when created and last modified, soft delete).
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime? DeletedAt { get; private set; }
    public Guid? DeletedBy { get; private set; }

    public bool IsDeleted => DeletedAt.HasValue;

    public void SoftDelete(Guid deletedBy)
    {
        DeletedAt = DateTime.UtcNow;
        DeletedBy = deletedBy;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = deletedBy;
    }

    public void Restore()
    {
        DeletedAt = null;
        DeletedBy = null;
    }
}
