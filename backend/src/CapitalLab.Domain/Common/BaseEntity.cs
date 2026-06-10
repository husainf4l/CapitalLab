namespace CapitalLab.Domain.Common;

/// <summary>
/// Root base class for all domain entities.
/// Manages identity, concurrency token, and domain event collection.
/// </summary>
public abstract class BaseEntity
{
    private readonly List<IDomainEvent> _domainEvents = [];

    public Guid Id { get; protected set; } = Guid.NewGuid();

    /// <summary>Optimistic concurrency token — incremented by EF Core on each save.</summary>
    public uint RowVersion { get; protected set; }

    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void RaiseDomainEvent(IDomainEvent @event) => _domainEvents.Add(@event);

    public void ClearDomainEvents() => _domainEvents.Clear();
}
