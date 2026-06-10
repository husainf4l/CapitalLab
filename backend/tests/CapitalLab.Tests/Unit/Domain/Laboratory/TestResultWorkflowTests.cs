using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Enums;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Domain.Laboratory;

public sealed class TestResultWorkflowTests
{
    private static TestResult NewNumericResult(decimal value = 5m) =>
        TestResult.Create(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), ResultType.Numeric,
            value, null, "mg/dL", "3-7", null, Guid.NewGuid(), DateTime.UtcNow);

    [Fact]
    public void Create_StartsAsDraft_AndRaisesEnteredEvent()
    {
        var result = NewNumericResult();
        result.Status.Should().Be(ResultStatus.Draft);
        result.DomainEvents.Should().ContainSingle(e => e.GetType().Name == "ResultEnteredEvent");
    }

    [Fact]
    public void ApprovalWorkflow_Draft_To_Released()
    {
        var result = NewNumericResult();
        result.SubmitForReview();
        result.Status.Should().Be(ResultStatus.PendingReview);

        result.Approve(Guid.NewGuid(), DateTime.UtcNow);
        result.Status.Should().Be(ResultStatus.Approved);
        result.ApprovedBy.Should().NotBeNull();
        result.ApprovedAt.Should().NotBeNull();

        result.Release();
        result.Status.Should().Be(ResultStatus.Released);
    }

    [Fact]
    public void Approve_BeforeSubmit_Throws()
    {
        var result = NewNumericResult();
        var act = () => result.Approve(Guid.NewGuid(), DateTime.UtcNow);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Release_BeforeApprove_Throws()
    {
        var result = NewNumericResult();
        result.SubmitForReview();
        var act = () => result.Release();
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void UpdateValue_ReturnsOldAndNewSnapshot()
    {
        var result = NewNumericResult(5m);
        var (oldValue, newValue) = result.UpdateValue(9m, null, "mg/dL", "3-7", null);
        oldValue.Should().Be("5");
        newValue.Should().Be("9");
        result.ResultValue.Should().Be(9m);
    }

    [Fact]
    public void UpdateValue_AfterApproval_Throws()
    {
        var result = NewNumericResult();
        result.SubmitForReview();
        result.Approve(Guid.NewGuid(), DateTime.UtcNow);
        var act = () => result.UpdateValue(1m, null, null, null, null);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void MarkCriticalDetected_FlagsAndRaisesEvent()
    {
        var result = NewNumericResult(99m);
        result.MarkCriticalDetected(Guid.NewGuid(), "Above threshold", ResultInterpretation.CriticalHigh);
        result.IsCritical.Should().BeTrue();
        result.Interpretation.Should().Be(ResultInterpretation.CriticalHigh);
        result.DomainEvents.Should().Contain(e => e.GetType().Name == "CriticalResultDetectedEvent");
    }
}
