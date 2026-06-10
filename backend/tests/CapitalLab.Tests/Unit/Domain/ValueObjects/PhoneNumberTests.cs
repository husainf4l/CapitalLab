using CapitalLab.Domain.Common.ValueObjects;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Domain.ValueObjects;

public sealed class PhoneNumberTests
{
    [Theory]
    [InlineData("+966501234567")]
    [InlineData("+12025551234")]
    [InlineData("+447911123456")]
    public void Create_WithValidPhone_ShouldSucceed(string phone)
    {
        var number = PhoneNumber.Create(phone);
        number.Value.Should().NotBeNullOrEmpty();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("123")]
    [InlineData("not-a-phone")]
    public void Create_WithInvalidPhone_ShouldThrow(string phone)
    {
        var act = () => PhoneNumber.Create(phone);
        act.Should().Throw<Exception>();
    }

    [Fact]
    public void Create_WithSpacesAndDashes_ShouldNormalize()
    {
        var number = PhoneNumber.Create("+966 50 123 4567");
        number.Value.Should().Be("+966501234567");
    }

    [Fact]
    public void Equality_SamePhone_ShouldBeEqual()
    {
        var a = PhoneNumber.Create("+966501234567");
        var b = PhoneNumber.Create("+966501234567");
        a.Should().Be(b);
    }
}
