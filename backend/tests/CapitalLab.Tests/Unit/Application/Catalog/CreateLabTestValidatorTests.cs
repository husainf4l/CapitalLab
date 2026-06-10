using CapitalLab.Application.Features.LabTests.Commands;
using CapitalLab.Domain.Enums;
using FluentValidation.TestHelper;
using Xunit;

namespace CapitalLab.Tests.Unit.Application.Catalog;

public class CreateLabTestValidatorTests
{
    private readonly CreateLabTestCommandValidator _validator = new();

    private static CreateLabTestCommand ValidCommand() => new(
        Guid.NewGuid(),
        "CBC",
        "Complete Blood Count",
        null,
        null,
        SampleType.Blood,
        null,
        4,
        50m,
        "SAR",
        null,
        null,
        false,
        true);

    [Fact]
    public void Should_Pass_With_Valid_Input()
    {
        _validator.TestValidate(ValidCommand()).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_CategoryId_Empty()
    {
        var cmd = ValidCommand() with { CategoryId = Guid.Empty };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.CategoryId);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Should_Fail_When_Code_Empty(string code)
    {
        var cmd = ValidCommand() with { Code = code };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Should_Fail_When_Name_Empty(string name)
    {
        var cmd = ValidCommand() with { Name = name };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Fail_When_Price_Negative()
    {
        var cmd = ValidCommand() with { Price = -1m };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.Price);
    }

    [Fact]
    public void Should_Fail_When_TurnaroundTime_Negative()
    {
        var cmd = ValidCommand() with { TurnaroundTimeHours = -1 };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.TurnaroundTimeHours);
    }

    [Theory]
    [InlineData("US")]
    [InlineData("SAUD")]
    public void Should_Fail_When_Currency_Not_3_Chars(string currency)
    {
        var cmd = ValidCommand() with { Currency = currency };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.Currency);
    }

    [Fact]
    public void Should_Fail_When_SampleType_Invalid()
    {
        var cmd = ValidCommand() with { SampleType = (SampleType)99 };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.SampleType);
    }
}
