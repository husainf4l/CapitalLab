using System.Reflection;
using FluentAssertions;

namespace CapitalLab.Tests.Architecture;

/// <summary>
/// Verifies Clean Architecture dependency rules are not violated.
/// Domain must not reference Application, Infrastructure, or Api.
/// Application must not reference Infrastructure or Api.
/// Contracts must not reference any internal layer.
/// </summary>
public sealed class LayerDependencyTests
{
    private static readonly Assembly DomainAssembly =
        typeof(CapitalLab.Domain.Common.BaseEntity).Assembly;

    private static readonly Assembly ApplicationAssembly =
        typeof(CapitalLab.Application.DependencyInjection).Assembly;

    private static readonly Assembly ContractsAssembly =
        typeof(CapitalLab.Contracts.Common.Result).Assembly;

    [Fact]
    public void Domain_ShouldNotReference_Application()
    {
        var referencedAssemblies = DomainAssembly
            .GetReferencedAssemblies()
            .Select(a => a.Name)
            .ToList();

        referencedAssemblies.Should().NotContain("CapitalLab.Application",
            "Domain layer must not depend on Application layer");
    }

    [Fact]
    public void Domain_ShouldNotReference_Infrastructure()
    {
        var referencedAssemblies = DomainAssembly
            .GetReferencedAssemblies()
            .Select(a => a.Name)
            .ToList();

        referencedAssemblies.Should().NotContain("CapitalLab.Infrastructure",
            "Domain layer must not depend on Infrastructure layer");
    }

    [Fact]
    public void Application_ShouldNotReference_Infrastructure()
    {
        var referencedAssemblies = ApplicationAssembly
            .GetReferencedAssemblies()
            .Select(a => a.Name)
            .ToList();

        referencedAssemblies.Should().NotContain("CapitalLab.Infrastructure",
            "Application layer must not depend on Infrastructure layer");
    }

    [Fact]
    public void Contracts_ShouldNotReference_Domain()
    {
        var referencedAssemblies = ContractsAssembly
            .GetReferencedAssemblies()
            .Select(a => a.Name)
            .ToList();

        referencedAssemblies.Should().NotContain("CapitalLab.Domain",
            "Contracts must not depend on Domain layer");
    }
}
