using CapitalLab.Infrastructure.Services.Laboratory;
using FluentAssertions;

namespace CapitalLab.Tests.Unit.Infrastructure;

public sealed class BarcodeQrServiceTests
{
    [Fact]
    public void Barcode_UsesContentAsValue_AndDeterministicPath()
    {
        var service = new BarcodeService();
        var a = service.Generate("SMP-20260610-000001");
        var b = service.Generate("SMP-20260610-000001");

        a.Value.Should().Be("SMP-20260610-000001");
        a.ImagePath.Should().StartWith("barcodes/");
        a.ImagePath.Should().Be(b.ImagePath, "the path must be deterministic for the same content");
    }

    [Fact]
    public void Barcode_EmptyContent_Throws()
    {
        var service = new BarcodeService();
        var act = () => service.Generate("  ");
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Qr_ProducesNonEmptyToken_AndUniqueValues()
    {
        var service = new QrCodeService();
        var a = service.GenerateVerification("report:1");
        var b = service.GenerateVerification("report:1");

        a.Value.Should().NotBeNullOrWhiteSpace();
        a.ImagePath.Should().StartWith("qrcodes/");
        a.Value.Should().NotBe(b.Value, "each verification token must be unique");
    }
}
