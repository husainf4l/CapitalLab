using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CapitalLab.Infrastructure.Services.Pdf;

public sealed class PdfReportService(
    IRepository<Report> reportRepo,
    IRepository<Patient> patientRepo,
    IFileStorageService fileStorage,
    ILogger<PdfReportService> logger) : IPdfReportService
{
    public async Task<byte[]> GenerateReportAsync(Guid reportId, CancellationToken cancellationToken = default)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var report = await reportRepo.Query()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == reportId, cancellationToken)
            ?? throw new InvalidOperationException($"Report {reportId} not found.");

        var patient = await patientRepo.GetByIdAsync(report.PatientId, cancellationToken);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(ComposeHeader);

                page.Content().Element(c => ComposeContent(c, report, patient));

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Capital Lab | Report #").FontSize(8).FontColor(Colors.Grey.Medium);
                    text.Span(report.ReportNumber).FontSize(8).FontColor(Colors.Grey.Medium);
                    text.Span(" | Page ").FontSize(8).FontColor(Colors.Grey.Medium);
                    text.CurrentPageNumber().FontSize(8);
                    text.Span(" of ").FontSize(8);
                    text.TotalPages().FontSize(8);
                });
            });
        });

        return document.GeneratePdf();
    }

    public async Task<string> GenerateAndStoreReportAsync(Guid reportId, CancellationToken cancellationToken = default)
    {
        var bytes = await GenerateReportAsync(reportId, cancellationToken);
        using var stream = new MemoryStream(bytes);
        var folder = $"reports/{DateTime.UtcNow:yyyy/MM}";
        var fileName = $"{reportId}.pdf";
        var result = await fileStorage.UploadAsync(stream, fileName, "application/pdf", folder, cancellationToken);
        logger.LogInformation("Report PDF stored at {Path}", result.StoragePath);
        return result.StoragePath;
    }

    private static void ComposeHeader(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(col =>
            {
                col.Item().Text("Capital Lab").FontSize(22).Bold().FontColor(Colors.Blue.Darken2);
                col.Item().Text("Laboratory Report").FontSize(12).FontColor(Colors.Grey.Darken1);
            });
            row.ConstantItem(120).AlignRight().Column(col =>
            {
                col.Item().Text(DateTime.UtcNow.ToString("dd MMM yyyy")).FontSize(9).FontColor(Colors.Grey.Medium);
            });
        });
    }

    private static void ComposeContent(IContainer container, Report report, Patient? patient)
    {
        container.Column(col =>
        {
            col.Spacing(10);

            // Patient info
            col.Item().Background(Colors.Grey.Lighten3).Padding(10).Column(p =>
            {
                p.Item().Text("PATIENT INFORMATION").Bold().FontSize(9).FontColor(Colors.Blue.Darken2);
                p.Spacing(4);
                if (patient is not null)
                {
                    p.Item().Text($"Name: {patient.FirstName} {patient.LastName}");
                    p.Item().Text($"Phone: {patient.Phone}");
                    p.Item().Text($"Date of Birth: {patient.DateOfBirth:dd MMM yyyy}");
                }
                p.Item().Text($"Report #: {report.ReportNumber}");
                p.Item().Text($"Generated: {report.GeneratedAt:dd MMM yyyy HH:mm}");
            });

            // Results table
            col.Item().Text("TEST RESULTS").Bold().FontSize(9).FontColor(Colors.Blue.Darken2);
            col.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(2);
                });

                table.Header(header =>
                {
                    static IContainer HeaderCell(IContainer c) => c.Background(Colors.Blue.Darken2).Padding(5);
                    static void HeaderText(TextDescriptor t, string text) { t.Span(text).FontColor(Colors.White).Bold().FontSize(9); }

                    header.Cell().Element(HeaderCell).Text(t => HeaderText(t, "Test"));
                    header.Cell().Element(HeaderCell).Text(t => HeaderText(t, "Result"));
                    header.Cell().Element(HeaderCell).Text(t => HeaderText(t, "Unit"));
                    header.Cell().Element(HeaderCell).Text(t => HeaderText(t, "Reference Range"));
                    header.Cell().Element(HeaderCell).Text(t => HeaderText(t, "Interpretation"));
                });

                var isOdd = false;
                foreach (var item in report.Items)
                {
                    isOdd = !isOdd;
                    var bg = isOdd ? Colors.White : Colors.Grey.Lighten4;
                    static IContainer DataCell(IContainer c, string color) => c.Background(color).Padding(5);

                    table.Cell().Element(c => DataCell(c, bg)).Text(item.TestName).FontSize(9);
                    table.Cell().Element(c => DataCell(c, bg)).Text(item.ResultValue ?? "-").FontSize(9).Bold();
                    table.Cell().Element(c => DataCell(c, bg)).Text(item.Unit ?? "-").FontSize(9);
                    table.Cell().Element(c => DataCell(c, bg)).Text(item.ReferenceRange ?? "-").FontSize(9);
                    table.Cell().Element(c => DataCell(c, bg)).Text(item.Interpretation ?? "-").FontSize(9);
                }
            });

            if (report.QRCode is not null)
            {
                col.Item().AlignRight().Column(qr =>
                {
                    qr.Item().Text("Verification QR Code").FontSize(8).FontColor(Colors.Grey.Medium);
                    qr.Item().Text(report.QRCode).FontSize(7).FontColor(Colors.Grey.Lighten1);
                });
            }
        });
    }
}
