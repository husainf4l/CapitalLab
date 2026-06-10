using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Enums;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Application.HomeCollections;

public sealed class HomeCollectionPhase2Tests
{
    [Fact]
    public void AssignStaff_ShouldSetStatusAndAssignedAt()
    {
        var request = HomeCollectionRequest.Create(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "123 Main Street",
            "Riyadh",
            "Olaya",
            null,
            null,
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            new TimeOnly(8, 0),
            new TimeOnly(10, 0),
            null);
        var staffId = Guid.NewGuid();

        request.AssignStaff(staffId);

        request.AssignedStaffId.Should().Be(staffId);
        request.Status.Should().Be(HomeCollectionStatus.Assigned);
        request.AssignedAt.Should().NotBeNull();
    }
}
