using System.Reflection;
using CapitalLab.Application.Common.Interfaces;
using CapitalLab.Domain.Common;
using CapitalLab.Domain.Entities.Audit;
using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Entities.Content;
using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Entities.Mobile;
using CapitalLab.Domain.Entities.Notifications;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Entities.Settings;
using CapitalLab.Infrastructure.Identity;
using CapitalLab.Infrastructure.Persistence.Interceptors;
using MediatR;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace CapitalLab.Infrastructure.Persistence;

public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    IMediator mediator,
    AuditableEntityInterceptor auditInterceptor,
    SoftDeleteInterceptor softDeleteInterceptor)
    : IdentityDbContext<AppUser, AppRole, Guid>(options), IApplicationDbContext
{
    // Organization
    public DbSet<Branch> Branches => Set<Branch>();

    // People
    public DbSet<StaffProfile> StaffProfiles => Set<StaffProfile>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<PatientFamilyMember> PatientFamilyMembers => Set<PatientFamilyMember>();

    // Catalog
    public DbSet<TestCategory> TestCategories => Set<TestCategory>();
    public DbSet<LabTest> LabTests => Set<LabTest>();
    public DbSet<HealthPackage> HealthPackages => Set<HealthPackage>();
    public DbSet<PackageTest> PackageTests => Set<PackageTest>();

    // Operations
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<AppointmentItem> AppointmentItems => Set<AppointmentItem>();
    public DbSet<AppointmentStatusHistory> AppointmentStatusHistory => Set<AppointmentStatusHistory>();
    public DbSet<HomeCollectionRequest> HomeCollectionRequests => Set<HomeCollectionRequest>();
    public DbSet<TestOrder> TestOrders => Set<TestOrder>();
    public DbSet<TestOrderItem> TestOrderItems => Set<TestOrderItem>();

    // Laboratory
    public DbSet<TestResult> TestResults => Set<TestResult>();
    public DbSet<TestResultHistory> TestResultHistory => Set<TestResultHistory>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<ReportItem> ReportItems => Set<ReportItem>();

    // Phase F — Notifications
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationTemplate> NotificationTemplates => Set<NotificationTemplate>();
    public DbSet<NotificationLog> NotificationLogs => Set<NotificationLog>();

    // Phase F — Audit
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    // Phase F — Mobile
    public DbSet<DeviceToken> DeviceTokens => Set<DeviceToken>();

    // Phase F — Settings
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    // Content CMS
    public DbSet<ContentCategory> ContentCategories => Set<ContentCategory>();
    public DbSet<ContentAuthor> ContentAuthors => Set<ContentAuthor>();
    public DbSet<ContentTag> ContentTags => Set<ContentTag>();
    public DbSet<ContentPost> ContentPosts => Set<ContentPost>();
    public DbSet<ContentPostTag> ContentPostTags => Set<ContentPostTag>();
    public DbSet<ContentEvent> ContentEvents => Set<ContentEvent>();
    public DbSet<ContentNewsletterSubscriber> ContentNewsletterSubscribers => Set<ContentNewsletterSubscriber>();
    public DbSet<ContentFaqItem> ContentFaqItems => Set<ContentFaqItem>();

    public new DatabaseFacade Database => base.Database;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        builder.Entity<AppUser>().ToTable("users", "identity");
        builder.Entity<AppRole>().ToTable("roles", "identity");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<Guid>>()
            .ToTable("user_roles", "identity");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>()
            .ToTable("user_claims", "identity");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>()
            .ToTable("user_logins", "identity");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>()
            .ToTable("user_tokens", "identity");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>()
            .ToTable("role_claims", "identity");
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(auditInterceptor, softDeleteInterceptor);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var result = await base.SaveChangesAsync(cancellationToken);
        await DispatchDomainEventsAsync(cancellationToken);
        return result;
    }

    private async Task DispatchDomainEventsAsync(CancellationToken cancellationToken)
    {
        var entities = ChangeTracker
            .Entries<BaseEntity>()
            .Where(e => e.Entity.DomainEvents.Count > 0)
            .Select(e => e.Entity)
            .ToList();

        var domainEvents = entities
            .SelectMany(e => e.DomainEvents)
            .ToList();

        foreach (var entity in entities)
            entity.ClearDomainEvents();

        foreach (var domainEvent in domainEvents)
            await mediator.Publish(domainEvent, cancellationToken);
    }
}
