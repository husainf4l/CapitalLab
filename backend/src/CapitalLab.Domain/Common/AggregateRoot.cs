namespace CapitalLab.Domain.Common;

/// <summary>
/// Marker base class for aggregate roots.
/// Aggregate roots are the only entities that should be accessed via repositories.
/// </summary>
public abstract class AggregateRoot : AuditableEntity;
