using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Api.Controllers.V1;

[Route("api/v{version:apiVersion}/public")]
public class PublicController(IMediator mediator, IRepository<Report> reportRepo) : BaseController(mediator)
{
    [HttpGet("report-verification/{reportNumber}")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyReport(string reportNumber, CancellationToken ct)
    {
        var report = await reportRepo.Query()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.ReportNumber == reportNumber, ct);

        if (report is null)
            return NotFound(new { verified = false, message = "Report not found." });

        return OkResponse(new
        {
            verified = true,
            reportNumber = report.ReportNumber,
            status = report.Status.ToString(),
            generatedAt = report.GeneratedAt,
            releasedAt = report.ReleasedAt
        });
    }
}
