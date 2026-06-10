using CapitalLab.Application.Common.Exceptions;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Contracts.Common;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Enums;
using CapitalLab.Domain.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CapitalLab.Application.Features.Samples.Commands;

// ── Commands ─────────────────────────────────────────────────────────────────
public record CreateSampleItemInput(Guid TestOrderItemId, Guid LabTestId);

public record CreateSampleCommand(
    Guid TestOrderId,
    SampleType SampleType,
    string? Notes,
    List<CreateSampleItemInput> Items) : IRequest<Result<Guid>>;

public record GenerateBarcodeCommand(Guid SampleId) : IRequest<Result>;
public record CollectSampleCommand(Guid SampleId, Guid? CollectedByStaffId, DateTime? CollectionDateTime) : IRequest<Result>;
public record ReceiveSampleCommand(Guid SampleId, DateTime? ReceivedDateTime) : IRequest<Result>;
public record StartProcessingCommand(Guid SampleId) : IRequest<Result>;
public record CompleteProcessingCommand(Guid SampleId) : IRequest<Result>;
public record QualityCheckCommand(Guid SampleId, QualityControlResult Result, string? Notes, Guid? CheckedBy) : IRequest<Result>;
public record CompleteSampleCommand(Guid SampleId) : IRequest<Result>;
public record RejectSampleCommand(Guid SampleId, string? Reason) : IRequest<Result>;

// ── Validators ─────────────────────────────────────────────────────────────────
public class CreateSampleCommandValidator : AbstractValidator<CreateSampleCommand>
{
    public CreateSampleCommandValidator()
    {
        RuleFor(x => x.TestOrderId).NotEmpty();
        RuleFor(x => x.SampleType).IsInEnum();
        RuleFor(x => x.Items).NotEmpty().WithMessage("A sample must contain at least one item.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.TestOrderItemId).NotEmpty();
            item.RuleFor(i => i.LabTestId).NotEmpty();
        });
    }
}

public class QualityCheckCommandValidator : AbstractValidator<QualityCheckCommand>
{
    public QualityCheckCommandValidator()
    {
        RuleFor(x => x.SampleId).NotEmpty();
        RuleFor(x => x.Result).IsInEnum();
    }
}

// ── Handlers ─────────────────────────────────────────────────────────────────
public class CreateSampleCommandHandler(
    IRepository<Sample> sampleRepo,
    IRepository<TestOrder> orderRepo,
    ISampleNumberService sampleNumberService,
    IBarcodeService barcodeService,
    IQrCodeService qrCodeService,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<CreateSampleCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateSampleCommand request, CancellationToken cancellationToken)
    {
        var order = await orderRepo.GetByIdAsync(request.TestOrderId, cancellationToken)
            ?? throw new NotFoundException(nameof(TestOrder), request.TestOrderId);

        if (order.Status == TestOrderStatus.Cancelled)
            throw new BusinessRuleException("TestOrder.Cancelled", "Cannot register a sample for a cancelled order.");

        var sampleNumber = await sampleNumberService.GenerateNextAsync(clock.UtcToday, cancellationToken);

        var sample = Sample.Register(
            sampleNumber, order.Id, order.PatientId, order.BranchId, request.SampleType, request.Notes);

        foreach (var item in request.Items)
            sample.AddItem(item.TestOrderItemId, item.LabTestId);

        // Auto-generate barcode + QR verification at registration
        var barcode = barcodeService.Generate(sampleNumber);
        sample.SetBarcode(barcode.Value, barcode.ImagePath);

        var qr = qrCodeService.GenerateVerification($"sample:{sample.Id}");
        sample.SetQRCode(qr.Value, qr.ImagePath);

        await sampleRepo.AddAsync(sample, cancellationToken);
        await uow.CommitAsync(cancellationToken);

        return Result<Guid>.Success(sample.Id);
    }
}

public class GenerateBarcodeCommandHandler(
    IRepository<Sample> sampleRepo,
    IBarcodeService barcodeService,
    IQrCodeService qrCodeService,
    IUnitOfWork uow) : IRequestHandler<GenerateBarcodeCommand, Result>
{
    public async Task<Result> Handle(GenerateBarcodeCommand request, CancellationToken cancellationToken)
    {
        var sample = await sampleRepo.GetByIdAsync(request.SampleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sample), request.SampleId);

        var barcode = barcodeService.Generate(sample.SampleNumber);
        sample.SetBarcode(barcode.Value, barcode.ImagePath);

        if (string.IsNullOrEmpty(sample.QRCode))
        {
            var qr = qrCodeService.GenerateVerification($"sample:{sample.Id}");
            sample.SetQRCode(qr.Value, qr.ImagePath);
        }

        sampleRepo.Update(sample);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class CollectSampleCommandHandler(
    IRepository<Sample> sampleRepo,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<CollectSampleCommand, Result>
{
    public async Task<Result> Handle(CollectSampleCommand request, CancellationToken cancellationToken)
    {
        var sample = await sampleRepo.GetByIdAsync(request.SampleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sample), request.SampleId);

        try { sample.Collect(request.CollectedByStaffId, request.CollectionDateTime ?? clock.UtcNow); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Sample.InvalidTransition", ex.Message); }

        sampleRepo.Update(sample);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class ReceiveSampleCommandHandler(
    IRepository<Sample> sampleRepo,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<ReceiveSampleCommand, Result>
{
    public async Task<Result> Handle(ReceiveSampleCommand request, CancellationToken cancellationToken)
    {
        var sample = await sampleRepo.GetByIdAsync(request.SampleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sample), request.SampleId);

        try { sample.Receive(request.ReceivedDateTime ?? clock.UtcNow); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Sample.InvalidTransition", ex.Message); }

        sampleRepo.Update(sample);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class StartProcessingCommandHandler(
    IRepository<Sample> sampleRepo,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<StartProcessingCommand, Result>
{
    public async Task<Result> Handle(StartProcessingCommand request, CancellationToken cancellationToken)
    {
        var sample = await sampleRepo.GetByIdAsync(request.SampleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sample), request.SampleId);

        try { sample.StartProcessing(clock.UtcNow); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Sample.InvalidTransition", ex.Message); }

        sampleRepo.Update(sample);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class CompleteProcessingCommandHandler(
    IRepository<Sample> sampleRepo,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<CompleteProcessingCommand, Result>
{
    public async Task<Result> Handle(CompleteProcessingCommand request, CancellationToken cancellationToken)
    {
        var sample = await sampleRepo.GetByIdAsync(request.SampleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sample), request.SampleId);

        try { sample.CompleteProcessing(clock.UtcNow); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Sample.InvalidTransition", ex.Message); }

        sampleRepo.Update(sample);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class QualityCheckCommandHandler(
    IRepository<Sample> sampleRepo,
    IRepository<QualityControlRecord> qcRepo,
    IDateTimeService clock,
    IUnitOfWork uow) : IRequestHandler<QualityCheckCommand, Result>
{
    public async Task<Result> Handle(QualityCheckCommand request, CancellationToken cancellationToken)
    {
        var sample = await sampleRepo.GetByIdAsync(request.SampleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sample), request.SampleId);

        var record = QualityControlRecord.Create(
            sample.Id, request.CheckedBy, clock.UtcNow, request.Result, request.Notes);
        await qcRepo.AddAsync(record, cancellationToken);

        try { sample.ApplyQualityControl(request.Result, request.Notes); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Sample.InvalidTransition", ex.Message); }

        sampleRepo.Update(sample);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class CompleteSampleCommandHandler(
    IRepository<Sample> sampleRepo,
    IUnitOfWork uow) : IRequestHandler<CompleteSampleCommand, Result>
{
    public async Task<Result> Handle(CompleteSampleCommand request, CancellationToken cancellationToken)
    {
        var sample = await sampleRepo.Query()
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == request.SampleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sample), request.SampleId);

        try { sample.Complete(); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Sample.InvalidTransition", ex.Message); }

        sampleRepo.Update(sample);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}

public class RejectSampleCommandHandler(
    IRepository<Sample> sampleRepo,
    IUnitOfWork uow) : IRequestHandler<RejectSampleCommand, Result>
{
    public async Task<Result> Handle(RejectSampleCommand request, CancellationToken cancellationToken)
    {
        var sample = await sampleRepo.GetByIdAsync(request.SampleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Sample), request.SampleId);

        try { sample.Reject(request.Reason); }
        catch (InvalidOperationException ex) { throw new BusinessRuleException("Sample.InvalidTransition", ex.Message); }

        sampleRepo.Update(sample);
        await uow.CommitAsync(cancellationToken);
        return Result.Success();
    }
}
