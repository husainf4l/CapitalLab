using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Contracts.Common;
using CapitalLab.Contracts.Laboratory;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ContractInterpretation = CapitalLab.Contracts.Enums.ResultInterpretation;

namespace CapitalLab.Application.Features.PatientHistory.Queries;

public record GetPatientResultHistoryQuery(Guid PatientId)
    : IRequest<Result<List<PatientResultHistoryResponse>>>;

public record GetPatientResultTrendQuery(Guid PatientId, Guid LabTestId)
    : IRequest<Result<ResultTrendResponse>>;

public class GetPatientResultHistoryQueryHandler(
    IRepository<Patient> patientRepo,
    IRepository<TestResult> resultRepo,
    IRepository<LabTest> labTestRepo)
    : IRequestHandler<GetPatientResultHistoryQuery, Result<List<PatientResultHistoryResponse>>>
{
    public async Task<Result<List<PatientResultHistoryResponse>>> Handle(GetPatientResultHistoryQuery request, CancellationToken cancellationToken)
    {
        if (!await patientRepo.ExistsAsync(p => p.Id == request.PatientId, cancellationToken))
            throw new NotFoundException(nameof(Patient), request.PatientId);

        // Only approved/released results contribute to a patient's clinical history.
        var results = await resultRepo.Query()
            .Where(r => r.PatientId == request.PatientId
                        && (r.Status == ResultStatus.Approved || r.Status == ResultStatus.Released))
            .OrderBy(r => r.EnteredAt)
            .ToListAsync(cancellationToken);

        if (results.Count == 0)
            return Result<List<PatientResultHistoryResponse>>.Success([]);

        var labTestIds = results.Select(r => r.LabTestId).Distinct().ToList();
        var names = await labTestRepo.Query()
            .Where(t => labTestIds.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id, t => t.Name, cancellationToken);

        var grouped = results
            .GroupBy(r => r.LabTestId)
            .Select(g => new PatientResultHistoryResponse(
                g.Key,
                names.TryGetValue(g.Key, out var n) ? n : "Unknown Test",
                g.Select(x => x.Unit).FirstOrDefault(u => u != null),
                g.Select(x => new ResultHistoryPointResponse(
                    x.EnteredAt, x.ResultValue, x.ResultText, x.Unit, x.ReferenceRange,
                    (ContractInterpretation?)x.Interpretation, x.IsCritical)).ToList()))
            .ToList();

        return Result<List<PatientResultHistoryResponse>>.Success(grouped);
    }
}

public class GetPatientResultTrendQueryHandler(
    IRepository<Patient> patientRepo,
    IRepository<TestResult> resultRepo,
    IRepository<LabTest> labTestRepo)
    : IRequestHandler<GetPatientResultTrendQuery, Result<ResultTrendResponse>>
{
    public async Task<Result<ResultTrendResponse>> Handle(GetPatientResultTrendQuery request, CancellationToken cancellationToken)
    {
        if (!await patientRepo.ExistsAsync(p => p.Id == request.PatientId, cancellationToken))
            throw new NotFoundException(nameof(Patient), request.PatientId);

        var labTest = await labTestRepo.GetByIdAsync(request.LabTestId, cancellationToken)
            ?? throw new NotFoundException(nameof(LabTest), request.LabTestId);

        // Trend charts use numeric values from approved/released results, oldest-first.
        var points = await resultRepo.Query()
            .Where(r => r.PatientId == request.PatientId
                        && r.LabTestId == request.LabTestId
                        && r.ResultValue != null
                        && (r.Status == ResultStatus.Approved || r.Status == ResultStatus.Released))
            .OrderBy(r => r.EnteredAt)
            .Select(r => new TrendPointResponse(
                r.EnteredAt, r.ResultValue, r.ReferenceRange, (ContractInterpretation?)r.Interpretation))
            .ToListAsync(cancellationToken);

        var unit = await resultRepo.Query()
            .Where(r => r.PatientId == request.PatientId && r.LabTestId == request.LabTestId && r.Unit != null)
            .Select(r => r.Unit)
            .FirstOrDefaultAsync(cancellationToken);

        return Result<ResultTrendResponse>.Success(new ResultTrendResponse(
            request.PatientId, request.LabTestId, labTest.Name, unit, points));
    }
}
