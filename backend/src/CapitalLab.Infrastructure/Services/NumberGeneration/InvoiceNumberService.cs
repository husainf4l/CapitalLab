using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Infrastructure.Services.NumberGeneration;

public sealed class InvoiceNumberService(ApplicationDbContext db) : IInvoiceNumberService
{
    public async Task<string> GenerateNextAsync(DateOnly invoiceDate, CancellationToken cancellationToken = default)
    {
        var prefix = $"INV-{invoiceDate:yyyyMMdd}-";
        var latest = await db.Invoices
            .IgnoreQueryFilters()
            .Where(i => i.InvoiceNumber.StartsWith(prefix))
            .OrderByDescending(i => i.InvoiceNumber)
            .Select(i => i.InvoiceNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var next = 1;
        if (latest is not null && int.TryParse(latest[prefix.Length..], out var parsed))
            next = parsed + 1;

        return $"{prefix}{next:D6}";
    }
}
