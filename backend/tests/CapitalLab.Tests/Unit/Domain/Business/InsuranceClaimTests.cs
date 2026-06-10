using CapitalLab.Domain.Entities.Insurance;
using CapitalLab.Domain.Enums;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Domain.Business;

public sealed class InsuranceClaimTests
{
    private static InsuranceClaim NewClaim(decimal amount = 1000) =>
        InsuranceClaim.Create("CLM-20260610-000001", Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), amount);

    [Fact]
    public void Create_StartsInDraft()
    {
        NewClaim().Status.Should().Be(InsuranceClaimStatus.Draft);
    }

    [Fact]
    public void Submit_MovesToSubmitted()
    {
        var claim = NewClaim();
        claim.Submit();
        claim.Status.Should().Be(InsuranceClaimStatus.Submitted);
        claim.SubmittedAt.Should().NotBeNull();
    }

    [Fact]
    public void Approve_FullAmount_SetsApproved()
    {
        var claim = NewClaim(1000);
        claim.Submit();
        claim.Approve(1000);
        claim.Status.Should().Be(InsuranceClaimStatus.Approved);
        claim.ApprovedAmount.Should().Be(1000);
        claim.RejectedAmount.Should().Be(0);
    }

    [Fact]
    public void Approve_PartialAmount_SetsPartiallyApproved()
    {
        var claim = NewClaim(1000);
        claim.Submit();
        claim.Approve(600);
        claim.Status.Should().Be(InsuranceClaimStatus.PartiallyApproved);
        claim.ApprovedAmount.Should().Be(600);
        claim.RejectedAmount.Should().Be(400);
    }

    [Fact]
    public void Approve_ExceedingClaim_Throws()
    {
        var claim = NewClaim(1000);
        claim.Submit();
        var act = () => claim.Approve(1500);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Reject_RequiresReason()
    {
        var claim = NewClaim();
        claim.Submit();
        var act = () => claim.Reject("");
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Reject_SetsRejectedWithReason()
    {
        var claim = NewClaim(1000);
        claim.Submit();
        claim.Reject("Not covered");
        claim.Status.Should().Be(InsuranceClaimStatus.Rejected);
        claim.RejectedAmount.Should().Be(1000);
        claim.RejectionReason.Should().Be("Not covered");
    }

    [Fact]
    public void MarkPaid_AfterApproval_SetsPaid()
    {
        var claim = NewClaim(1000);
        claim.Submit();
        claim.Approve(1000);
        claim.MarkPaid();
        claim.Status.Should().Be(InsuranceClaimStatus.Paid);
        claim.PaidAt.Should().NotBeNull();
    }

    [Fact]
    public void Approve_FromDraft_Throws()
    {
        var claim = NewClaim();
        var act = () => claim.Approve(500);
        act.Should().Throw<InvalidOperationException>();
    }
}
