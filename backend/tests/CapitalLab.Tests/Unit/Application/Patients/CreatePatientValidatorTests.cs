using CapitalLab.Application.Features.Patients.Commands;
using CapitalLab.Domain.Enums;
using FluentValidation.TestHelper;
using Xunit;

namespace CapitalLab.Tests.Unit.Application.Patients;

public class CreatePatientValidatorTests
{
    private readonly CreatePatientCommandValidator _validator = new();

    private static CreatePatientCommand ValidCommand() => new(
        "John", "Doe", null,
        Gender.Male, new DateOnly(1990, 1, 1),
        null, null, "+966501234567",
        null, null, null, null,
        null, null, null, null, null, null);

    [Fact]
    public void Should_Pass_With_Valid_Input()
    {
        _validator.TestValidate(ValidCommand()).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Should_Fail_When_FirstName_Empty(string firstName)
    {
        var cmd = ValidCommand() with { FirstName = firstName };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.FirstName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Should_Fail_When_LastName_Empty(string lastName)
    {
        var cmd = ValidCommand() with { LastName = lastName };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.LastName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Should_Fail_When_Phone_Empty(string phone)
    {
        var cmd = ValidCommand() with { Phone = phone };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.Phone);
    }

    [Fact]
    public void Should_Fail_When_Email_Invalid()
    {
        var cmd = ValidCommand() with { Email = "not-an-email" };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_Fail_When_DateOfBirth_Is_Future()
    {
        var cmd = ValidCommand() with { DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)) };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.DateOfBirth);
    }

    [Fact]
    public void Should_Fail_When_Gender_Invalid()
    {
        var cmd = ValidCommand() with { Gender = (Gender)99 };
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(x => x.Gender);
    }
}
