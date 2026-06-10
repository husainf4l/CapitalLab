namespace CapitalLab.Domain.Common;

/// <summary>
/// Marker interface for all domain events.
/// Implementations are dispatched via MediatR after SaveChanges.
/// </summary>
public interface IDomainEvent;
