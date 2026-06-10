using CapitalLab.Domain.Entities.Laboratory;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Domain.Laboratory;

public sealed class CriticalResultRuleTests
{
    [Fact]
    public void Evaluate_AboveMax_ReturnsReason()
    {
        var rule = CriticalResultRule.Create(Guid.NewGuid(), null, 10m);
        rule.Evaluate(15m).Should().NotBeNull();
        rule.IsLowBreach(15m).Should().BeFalse();
    }

    [Fact]
    public void Evaluate_BelowMin_ReturnsReason_AndIsLowBreach()
    {
        var rule = CriticalResultRule.Create(Guid.NewGuid(), 3m, null);
        rule.Evaluate(2m).Should().NotBeNull();
        rule.IsLowBreach(2m).Should().BeTrue();
    }

    [Fact]
    public void Evaluate_WithinRange_ReturnsNull()
    {
        var rule = CriticalResultRule.Create(Guid.NewGuid(), 3m, 10m);
        rule.Evaluate(5m).Should().BeNull();
    }

    [Fact]
    public void Evaluate_WhenDisabled_ReturnsNull()
    {
        var rule = CriticalResultRule.Create(Guid.NewGuid(), 3m, 10m, isEnabled: false);
        rule.Evaluate(50m).Should().BeNull();
    }

    [Fact]
    public void Create_WithNoThresholds_Throws()
    {
        var act = () => CriticalResultRule.Create(Guid.NewGuid(), null, null);
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Create_WithMinGreaterThanMax_Throws()
    {
        var act = () => CriticalResultRule.Create(Guid.NewGuid(), 10m, 3m);
        act.Should().Throw<ArgumentException>();
    }
}
