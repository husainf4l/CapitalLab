using CapitalLab.Application.Features.CriticalResults.Commands;
using CapitalLab.Application.Features.Reports.Commands;
using CapitalLab.Application.Features.Results.Commands;
using CapitalLab.Application.Features.Samples.Commands;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Enums;
using CapitalLab.Infrastructure.Persistence;
using FluentAssertions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CapitalLab.Tests.Integration;

public sealed class LaboratoryWorkflowTests(TestWebApplicationFactory factory)
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory = factory;

    private async Task<(Guid orderId, Guid labTestId)> SeedOrderAndTestAsync(ApplicationDbContext db)
    {
        var labTest = LabTest.Create(
            Guid.NewGuid(), $"CBC{Guid.NewGuid():N}".Substring(0, 10), "Complete Blood Count", null, null,
            SampleType.Blood, null, 4, 50m, "SAR", "3-7", "mg/dL", false, true);
        db.LabTests.Add(labTest);

        var order = TestOrder.Create(
            $"ORD-{Guid.NewGuid():N}".Substring(0, 18), Guid.NewGuid(), null, Guid.NewGuid(),
            50m, 0m, 50m, "SAR", null);
        db.TestOrders.Add(order);

        await db.SaveChangesAsync();
        return (order.Id, labTest.Id);
    }

    [Fact]
    public async Task FullWorkflow_Sample_To_Report_Succeeds()
    {
        using var scope = _factory.Services.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<ISender>();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var (orderId, labTestId) = await SeedOrderAndTestAsync(db);

        // 1. Register a sample with one item
        var sampleId = (await sender.Send(new CreateSampleCommand(
            orderId, SampleType.Blood, "fasting",
            [new CreateSampleItemInput(Guid.NewGuid(), labTestId)]))).Value;

        var sample = await db.Samples.IgnoreQueryFilters().FirstAsync(s => s.Id == sampleId);
        sample.Barcode.Should().NotBeNullOrEmpty("barcode is auto-generated at registration");
        sample.QRCode.Should().NotBeNullOrEmpty("QR verification is auto-generated at registration");

        // 2. Walk the collection → completion workflow
        await sender.Send(new CollectSampleCommand(sampleId, Guid.NewGuid(), null));
        await sender.Send(new ReceiveSampleCommand(sampleId, null));
        await sender.Send(new StartProcessingCommand(sampleId));
        await sender.Send(new CompleteProcessingCommand(sampleId));
        await sender.Send(new QualityCheckCommand(sampleId, QualityControlResult.Passed, "ok", null));
        await sender.Send(new CompleteSampleCommand(sampleId));

        (await db.Samples.IgnoreQueryFilters().FirstAsync(s => s.Id == sampleId))
            .Status.Should().Be(SampleStatus.Completed);

        // 3. Enter a result and run it through review → release
        var resultId = (await sender.Send(new CreateResultCommand(
            sampleId, labTestId, ResultType.Numeric, 5m, null, "mg/dL", "3-7", null))).Value;

        await sender.Send(new SubmitResultForReviewCommand(resultId));
        await sender.Send(new ApproveResultCommand(resultId));
        await sender.Send(new ReleaseResultCommand(resultId));

        (await db.TestResults.IgnoreQueryFilters().FirstAsync(r => r.Id == resultId))
            .Status.Should().Be(ResultStatus.Released);

        // 4. Generate and release a report
        var reportId = (await sender.Send(new GenerateReportCommand(sampleId, null))).Value;
        var report = await db.Reports.IgnoreQueryFilters().Include(r => r.Items).FirstAsync(r => r.Id == reportId);
        report.Items.Should().NotBeEmpty();
        report.ReportNumber.Should().StartWith("REP-");

        await sender.Send(new ReleaseReportCommand(reportId));
        (await db.Reports.IgnoreQueryFilters().FirstAsync(r => r.Id == reportId))
            .Status.Should().Be(ReportStatus.Released);
    }

    [Fact]
    public async Task CriticalResult_AboveThreshold_RaisesAlert()
    {
        using var scope = _factory.Services.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<ISender>();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var (orderId, labTestId) = await SeedOrderAndTestAsync(db);

        var sampleId = (await sender.Send(new CreateSampleCommand(
            orderId, SampleType.Blood, null,
            [new CreateSampleItemInput(Guid.NewGuid(), labTestId)]))).Value;

        // Define a critical rule: anything >= 10 is critical-high
        await sender.Send(new CreateCriticalResultRuleCommand(labTestId, null, 10m, true));

        // Enter a breaching result
        var resultId = (await sender.Send(new CreateResultCommand(
            sampleId, labTestId, ResultType.Numeric, 50m, null, "mg/dL", "3-7", null))).Value;

        var result = await db.TestResults.IgnoreQueryFilters().FirstAsync(r => r.Id == resultId);
        result.IsCritical.Should().BeTrue();
        result.Interpretation.Should().Be(ResultInterpretation.CriticalHigh);

        var alert = await db.CriticalResultAlerts.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.TestResultId == resultId);
        alert.Should().NotBeNull();
        alert!.IsAcknowledged.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateResult_RecordsHistory()
    {
        using var scope = _factory.Services.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<ISender>();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var (orderId, labTestId) = await SeedOrderAndTestAsync(db);
        var sampleId = (await sender.Send(new CreateSampleCommand(
            orderId, SampleType.Blood, null,
            [new CreateSampleItemInput(Guid.NewGuid(), labTestId)]))).Value;

        var resultId = (await sender.Send(new CreateResultCommand(
            sampleId, labTestId, ResultType.Numeric, 5m, null, "mg/dL", "3-7", null))).Value;

        await sender.Send(new UpdateResultCommand(resultId, 8m, null, "mg/dL", "3-7", null));

        var history = await db.TestResultHistory.IgnoreQueryFilters().Where(h => h.TestResultId == resultId).ToListAsync();
        history.Should().ContainSingle();
        history[0].OldValue.Should().Be("5");
        history[0].NewValue.Should().Be("8");
    }
}
