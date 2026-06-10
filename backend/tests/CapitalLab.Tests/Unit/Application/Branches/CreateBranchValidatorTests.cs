using CapitalLab.Application.Features.Branches.Commands;
using FluentValidation.TestHelper;
using Xunit;

namespace CapitalLab.Tests.Unit.Application.Branches;

public class CreateBranchValidatorTests
{
    private readonly CreateBranchCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_With_Valid_Input()
    {
        var command = new CreateBranchCommand(
            "HQ", "Main Branch", null, null, null,
            null, null, null, null, null, null, null, false);
        _validator.TestValidate(command).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Should_Fail_When_Code_Empty(string code)
    {
        var command = new CreateBranchCommand(code, "Name", null, null, null, null, null, null, null, null, null, null, false);
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Fact]
    public void Should_Fail_When_Code_Too_Long()
    {
        var command = new CreateBranchCommand(
            new string('A', 21), "Name", null, null, null, null, null, null, null, null, null, null, false);
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Should_Fail_When_Name_Empty(string name)
    {
        var command = new CreateBranchCommand("HQ", name, null, null, null, null, null, null, null, null, null, null, false);
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Fail_When_Email_Invalid()
    {
        var command = new CreateBranchCommand("HQ", "Name", null, null, "not-an-email", null, null, null, null, null, null, null, false);
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_Pass_When_Email_Null()
    {
        var command = new CreateBranchCommand("HQ", "Name", null, null, null, null, null, null, null, null, null, null, false);
        _validator.TestValidate(command).ShouldNotHaveValidationErrorFor(x => x.Email);
    }

    [Theory]
    [InlineData(91)]
    [InlineData(-91)]
    public void Should_Fail_When_Latitude_Out_Of_Range(decimal lat)
    {
        var command = new CreateBranchCommand("HQ", "Name", null, null, null, null, null, null, lat, null, null, null, false);
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Latitude);
    }

    [Theory]
    [InlineData(181)]
    [InlineData(-181)]
    public void Should_Fail_When_Longitude_Out_Of_Range(decimal lng)
    {
        var command = new CreateBranchCommand("HQ", "Name", null, null, null, null, null, null, null, lng, null, null, false);
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Longitude);
    }
}
