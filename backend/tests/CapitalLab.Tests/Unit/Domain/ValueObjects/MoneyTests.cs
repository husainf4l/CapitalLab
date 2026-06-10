using CapitalLab.Domain.Common.ValueObjects;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Domain.ValueObjects;

public sealed class MoneyTests
{
    [Fact]
    public void Create_WithValidAmount_ShouldSucceed()
    {
        var money = new Money(100.50m, "SAR");
        money.Amount.Should().Be(100.500m);
        money.Currency.Should().Be("SAR");
    }

    [Fact]
    public void Create_WithNegativeAmount_ShouldThrow()
    {
        var act = () => new Money(-1m);
        act.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void Add_SameCurrency_ShouldReturnSum()
    {
        var a = new Money(100m);
        var b = new Money(50m);
        var result = a + b;
        result.Amount.Should().Be(150m);
    }

    [Fact]
    public void Add_DifferentCurrency_ShouldThrow()
    {
        var sar = new Money(100m, "SAR");
        var usd = new Money(100m, "USD");
        var act = () => sar + usd;
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Equality_SameAmountAndCurrency_ShouldBeEqual()
    {
        var a = new Money(100m, "SAR");
        var b = new Money(100m, "SAR");
        a.Should().Be(b);
        (a == b).Should().BeTrue();
    }

    [Fact]
    public void ApplyDiscount_25Percent_ShouldReduceAmount()
    {
        var money = new Money(100m);
        var discounted = money.ApplyDiscount(25);
        discounted.Amount.Should().Be(75m);
    }

    [Fact]
    public void Zero_ShouldHaveZeroAmount()
    {
        Money.Zero.Amount.Should().Be(0);
        Money.Zero.Currency.Should().Be("SAR");
    }
}
