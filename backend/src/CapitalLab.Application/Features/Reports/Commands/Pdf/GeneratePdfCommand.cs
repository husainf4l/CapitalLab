using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Application.Features.Reports.Commands.Pdf;

public record GenerateReportPdfCommand(Guid ReportId) : IRequest<Result<string>>;

public record GetReportPdfQuery(Guid ReportId) : IRequest<Result<byte[]>>;

public class GenerateReportPdfCommandHandler(
    IPdfReportService pdfService,
    IRepository<Report> repo,
    IUnitOfWork uow,
    ILogger<GenerateReportPdfCommandHandler> logger) : IRequestHandler<GenerateReportPdfCommand, Result<string>>
{
    public async Task<Result<string>> Handle(GenerateReportPdfCommand request, CancellationToken ct)
    {
        var report = await repo.GetByIdAsync(request.ReportId, ct);
        if (report is null) return Result<string>.Failure("NOT_FOUND", "Report not found.");

        var pdfPath = await pdfService.GenerateAndStoreReportAsync(request.ReportId, ct);
        report.SetPdfPath(pdfPath);
        repo.Update(report);
        await uow.CommitAsync(ct);

        logger.LogInformation("PDF generated for report {ReportId} at {Path}", request.ReportId, pdfPath);
        return Result<string>.Success(pdfPath);
    }
}

public class GetReportPdfQueryHandler(
    IPdfReportService pdfService,
    IRepository<Report> repo) : IRequestHandler<GetReportPdfQuery, Result<byte[]>>
{
    public async Task<Result<byte[]>> Handle(GetReportPdfQuery request, CancellationToken ct)
    {
        var report = await repo.GetByIdAsync(request.ReportId, ct);
        if (report is null) return Result<byte[]>.Failure("NOT_FOUND", "Report not found.");

        var bytes = await pdfService.GenerateReportAsync(request.ReportId, ct);
        return Result<byte[]>.Success(bytes);
    }
}
