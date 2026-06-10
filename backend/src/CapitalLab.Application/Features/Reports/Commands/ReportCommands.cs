using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Reports.Commands;

public record GenerateReportCommand(Guid SampleId, Guid? DoctorId) : IRequest<Result<Guid>>;
public record ReleaseReportCommand(Guid Id) : IRequest<Result>;

public class GenerateReportCommandHandler(
    IRepository<Report> reportRepo,
    IRepository<Sample> sampleRepo,
    IRepository<TestResult> resultRepo,
    IRepository<LabTest> labTestRepo,
    IReportNumberService reportNumberService,
    IQrCodeService qrCodeService,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<GenerateReportCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(GenerateReportCommand request, CancellationToken cancellationToken)
    {
        var sample = await sampleRepo.GetByIdAsync(request.SampleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sample), request.SampleId);

        var results = await resultRepo.Query()
            .Where(r => r.SampleId == sample.Id)
            .ToListAsync(cancellationToken);

        if (results.Count == 0)
            throw new BusinessRuleException("Report.NoResults", "Cannot generate a report for a sample with no results.");

        var labTestIds = results.Select(r => r.LabTestId).Distinct().ToList();
        var testNames = await labTestRepo.Query()
            .Where(t => labTestIds.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id, t => t.Name, cancellationToken);

        var reportNumber = await reportNumberService.GenerateNextAsync(clock.UtcToday, cancellationToken);
        var qr = qrCodeService.GenerateVerification($"report:{sample.TestOrderId}:{sample.Id}");

        var report = Report.Generate(
            reportNumber, sample.PatientId, sample.Id, sample.TestOrderId, request.DoctorId, clock.UtcNow, qr.Value);

        foreach (var r in results)
        {
            report.AddItem(
                r.LabTestId,
                testNames.TryGetValue(r.LabTestId, out var name) ? name : "Unknown Test",
                r.ResultValue?.ToString() ?? r.ResultText,
                r.Unit,
                r.ReferenceRange,
                r.Interpretation?.ToString());
        }

        report.SetPdfPath($"reports/{reportNumber}.pdf");

        await reportRepo.AddAsync(report, cancellationToken);
        await uow.CommitAsync(cancellationToken);
        return Result<Guid>.Success(report.Id);
    }
}

public class ReleaseReportCommandHandler(
    IRepository<Report> reportRepo,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<ReleaseReportCommand, Result>
{
    public async Task<Result> Handle(ReleaseReportCommand request, CancellationToken cancellationToken)
    {
        var report = await reportRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Report), request.Id);

        try { report.Release(clock.UtcNow); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Report.InvalidTransition", ex.Message); }

        reportRepo.Update(report);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}
