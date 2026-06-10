using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Enums;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Domain.Laboratory;

public sealed class SampleWorkflowTests
{
    private static Sample NewSample() =>
        Sample.Register("SMP-20260610-000001", Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), SampleType.Blood, null);

    [Fact]
    public void Register_StartsInRegisteredStatus()
    {
        var sample = NewSample();
        sample.Status.Should().Be(SampleStatus.Registered);
    }

    [Fact]
    public void FullHappyPath_TransitionsToCompleted()
    {
        var sample = NewSample();
        var now = new DateTime(2026, 6, 10, 9, 0, 0, DateTimeKind.Utc);

        sample.Collect(Guid.NewGuid(), now);
        sample.Status.Should().Be(SampleStatus.Collected);

        sample.Receive(now.AddMinutes(30));
        sample.Status.Should().Be(SampleStatus.Received);

        sample.StartProcessing(now.AddHours(1));
        sample.Status.Should().Be(SampleStatus.Processing);
        sample.ProcessingStartedAt.Should().NotBeNull();

        sample.CompleteProcessing(now.AddHours(2));
        sample.Status.Should().Be(SampleStatus.QualityControl);
        sample.ProcessingCompletedAt.Should().NotBeNull();

        sample.ApplyQualityControl(QualityControlResult.Passed, null);
        sample.Status.Should().Be(SampleStatus.QualityControl);

        sample.Complete();
        sample.Status.Should().Be(SampleStatus.Completed);
    }

    [Fact]
    public void Receive_BeforeCollect_Throws()
    {
        var sample = NewSample();
        var act = () => sample.Receive(DateTime.UtcNow);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void StartProcessing_BeforeReceive_Throws()
    {
        var sample = NewSample();
        sample.Collect(null, DateTime.UtcNow);
        var act = () => sample.StartProcessing(DateTime.UtcNow);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Complete_BeforeQualityControl_Throws()
    {
        var sample = NewSample();
        sample.Collect(null, DateTime.UtcNow);
        var act = () => sample.Complete();
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void QualityControl_Failed_RejectsSample()
    {
        var sample = NewSample();
        var now = DateTime.UtcNow;
        sample.Collect(null, now);
        sample.Receive(now);
        sample.StartProcessing(now);
        sample.CompleteProcessing(now);

        sample.ApplyQualityControl(QualityControlResult.Failed, "Hemolyzed");

        sample.Status.Should().Be(SampleStatus.Rejected);
        sample.RejectionReason.Should().Be("Hemolyzed");
    }

    [Fact]
    public void Complete_MarksAllItemsCompleted()
    {
        var sample = NewSample();
        sample.AddItem(Guid.NewGuid(), Guid.NewGuid());
        sample.AddItem(Guid.NewGuid(), Guid.NewGuid());
        var now = DateTime.UtcNow;
        sample.Collect(null, now);
        sample.Receive(now);
        sample.StartProcessing(now);
        sample.CompleteProcessing(now);
        sample.ApplyQualityControl(QualityControlResult.Passed, null);

        sample.Complete();

        sample.Items.Should().OnlyContain(i => i.Status == SampleItemStatus.Completed);
    }

    [Fact]
    public void Collect_RaisesSampleCollectedEvent()
    {
        var sample = NewSample();
        sample.Collect(Guid.NewGuid(), DateTime.UtcNow);
        sample.DomainEvents.Should().ContainSingle(e => e.GetType().Name == "SampleCollectedEvent");
    }
}
