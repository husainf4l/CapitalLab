using CapitalLab.Domain.Entities.Catalog;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Enums;
using CapitalLab.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.Persistence.Seed;

public sealed class DataSeeder(
    ApplicationDbContext db,
    UserManager<AppUser> userManager,
    RoleManager<AppRole> roleManager,
    ILogger<DataSeeder> logger)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await SeedRolesAsync(cancellationToken);
        await SeedAdminUserAsync(cancellationToken);
        await SeedBranchAsync(cancellationToken);
        await SeedTestCategoriesAsync(cancellationToken);
        await SeedLabTestsAsync(cancellationToken);
        await SeedHealthPackagesAsync(cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Database seeding completed.");
    }

    private async Task SeedBranchAsync(CancellationToken ct)
    {
        if (await db.Branches.AnyAsync(cancellationToken: ct)) return;

        var main = Branch.Create(
            code: "HQ",
            name: "Capital Lab - Main Branch",
            nameAr: "كابيتال لاب - الفرع الرئيسي",
            phone: "+966112345678",
            email: "main@capitallab.sa",
            address: "King Fahd Road",
            city: "Riyadh",
            area: "Al Olaya",
            latitude: 24.7136m,
            longitude: 46.6753m,
            openingTime: new TimeOnly(8, 0),
            closingTime: new TimeOnly(22, 0),
            isMainBranch: true);

        db.Branches.Add(main);
    }

    private async Task SeedTestCategoriesAsync(CancellationToken ct)
    {
        if (await db.TestCategories.AnyAsync(cancellationToken: ct)) return;

        var categories = new[]
        {
            ("HEMA", "Hematology",             "علم الدم",              "Blood cell counts and related tests",          1),
            ("CHEM", "Clinical Chemistry",      "الكيمياء السريرية",     "Biochemical analysis of body fluids",          2),
            ("IMMU", "Immunology",              "علم المناعة",           "Immune system and antibody tests",             3),
            ("MICR", "Microbiology",            "علم الأحياء الدقيقة",  "Bacterial, viral, and fungal cultures",        4),
            ("ENDO", "Endocrinology",           "الغدد الصماء",          "Hormone and endocrine function tests",         5),
            ("CARD", "Cardiac Markers",         "علامات القلب",          "Heart attack and cardiac function tests",      6),
            ("COAG", "Coagulation",             "التخثر",                "Clotting and anticoagulation tests",           7),
            ("URIN", "Urinalysis",              "تحليل البول",           "Physical, chemical, and microscopic urine",    8),
            ("SERO", "Serology",                "علم الأمصال",           "Infectious disease antibody detection",        9),
            ("GENET","Genetics",                "الجينات",               "Genetic and chromosomal testing",             10),
            ("TUMOR","Tumor Markers",           "علامات الأورام",        "Cancer screening and monitoring",             11),
            ("ALLRG","Allergy Testing",         "اختبارات الحساسية",     "Allergen-specific IgE and panels",            12),
            ("VITAM","Vitamins & Minerals",     "الفيتامينات والمعادن",  "Nutritional status assessment",               13),
            ("LIVER","Liver Function",          "وظائف الكبد",           "Hepatic enzyme and protein tests",            14),
            ("RENAL","Renal Function",          "وظائف الكلى",           "Kidney function and electrolyte tests",       15),
        };

        foreach (var (code, name, nameAr, desc, order) in categories)
            db.TestCategories.Add(TestCategory.Create(code, name, nameAr, desc, order));
    }

    private async Task SeedLabTestsAsync(CancellationToken ct)
    {
        if (await db.LabTests.AnyAsync(cancellationToken: ct)) return;

        // Fetch seeded categories for FK lookup
        var cats = await db.TestCategories.ToDictionaryAsync(c => c.Code, ct);

        var tests = new[]
        {
            // Code,   Name,                            NameAr,                      Cat,    Sample,        TAT, Price,   Fasting, HomeCol
            ("CBC",   "Complete Blood Count",           "تعداد الدم الكامل",         "HEMA", SampleType.Blood, 2,  50m,    false, true),
            ("FBS",   "Fasting Blood Sugar",            "سكر الصائم",                "CHEM", SampleType.Blood, 2,  30m,    true,  true),
            ("HBA1C", "Hemoglobin A1c",                 "الهيموغلوبين السكري",        "CHEM", SampleType.Blood, 4,  70m,    false, true),
            ("TSH",   "Thyroid Stimulating Hormone",    "الهرمون المنشط للغدة",       "ENDO", SampleType.Blood, 4,  80m,    false, true),
            ("LIPID", "Lipid Profile",                  "دهون الدم",                 "CHEM", SampleType.Blood, 4,  90m,    true,  true),
            ("LFT",   "Liver Function Tests",           "وظائف الكبد",               "LIVER",SampleType.Blood, 4, 100m,   false, true),
            ("KFT",   "Kidney Function Tests",          "وظائف الكلى",               "RENAL",SampleType.Blood, 4, 100m,   false, true),
            ("UA",    "Urinalysis Complete",            "تحليل البول الشامل",        "URIN", SampleType.Urine, 2,  40m,   false, false),
            ("VIT_D", "Vitamin D (25-OH)",              "فيتامين د",                 "VITAM",SampleType.Blood, 6, 120m,   false, true),
            ("VIT_B12","Vitamin B12",                   "فيتامين ب12",               "VITAM",SampleType.Blood, 6,  80m,   false, true),
            ("FERR",  "Ferritin",                       "الفيريتين",                 "HEMA", SampleType.Blood, 4,  75m,   false, true),
            ("CRP",   "C-Reactive Protein",             "بروتين سي التفاعلي",        "IMMU", SampleType.Blood, 4,  60m,   false, true),
            ("PSA",   "Prostate Specific Antigen",      "مستضد البروستاتا النوعي",   "TUMOR",SampleType.Blood, 6, 150m,   false, true),
        };

        foreach (var (code, name, nameAr, catCode, sample, tat, price, fasting, homeCol) in tests)
        {
            if (!cats.TryGetValue(catCode, out var cat)) continue;

            db.LabTests.Add(LabTest.Create(
                categoryId: cat.Id,
                code: code,
                name: name,
                nameAr: nameAr,
                description: null,
                sampleType: sample,
                preparationInstructions: fasting ? "Fast for 8–12 hours before the test." : null,
                turnaroundTimeHours: tat,
                price: price,
                currency: "SAR",
                referenceRange: null,
                unit: null,
                isFastingRequired: fasting,
                isHomeCollectionAvailable: homeCol));
        }
    }

    private async Task SeedHealthPackagesAsync(CancellationToken ct)
    {
        if (await db.HealthPackages.AnyAsync(cancellationToken: ct)) return;

        var packages = new[]
        {
            ("PKG_BASIC",    "Basic Health Screen",         "فحص صحي أساسي",          "Essential annual health panel",    299m, 0m,   false),
            ("PKG_COMP",     "Comprehensive Health Check",  "فحص صحي شامل",           "Full annual workup",               599m, 10m,  true),
            ("PKG_CARDIAC",  "Cardiac Profile",             "ملف القلب",               "Heart health screening",           450m, 0m,   false),
            ("PKG_DIABETIC", "Diabetic Monitoring",         "متابعة السكري",           "Diabetes management panel",        380m, 0m,   false),
            ("PKG_THYROID",  "Thyroid Panel",               "تحليل الغدة الدرقية",     "Complete thyroid assessment",      320m, 0m,   false),
            ("PKG_WOMEN",    "Women's Wellness",            "صحة المرأة",              "Female-specific health screen",    550m, 10m,  true),
            ("PKG_MEN",      "Men's Wellness",              "صحة الرجل",               "Male-specific health screen",      500m, 10m,  false),
            ("PKG_SENIOR",   "Senior Care Panel",           "فحص كبار السن",           "Comprehensive geriatric screen",   750m, 15m,  true),
            ("PKG_VITAMINS", "Vitamin & Mineral Check",     "فيتامينات ومعادن",        "Nutritional deficiency panel",     350m, 0m,   false),
        };

        foreach (var (code, name, nameAr, desc, price, discount, popular) in packages)
            db.HealthPackages.Add(HealthPackage.Create(code, name, nameAr, desc, price, "SAR", discount, popular));
    }

    private static readonly string[] SystemRoles =
    [
        "SuperAdmin", "Owner", "BranchAdmin", "LabManager",
        "Receptionist", "LabTechnician", "Phlebotomist",
        "Doctor", "Patient", "HomeCollector"
    ];

    private async Task SeedRolesAsync(CancellationToken ct)
    {
        foreach (var roleName in SystemRoles)
        {
            if (await roleManager.RoleExistsAsync(roleName)) continue;

            var role = new AppRole
            {
                Name = roleName,
                Description = $"System role: {roleName}",
                IsSystem = true,
            };
            await roleManager.CreateAsync(role);
        }
        logger.LogInformation("Roles seeded.");
    }

    private async Task SeedAdminUserAsync(CancellationToken ct)
    {
        const string adminEmail = "admin@capitallab.sa";
        var existing = await userManager.FindByEmailAsync(adminEmail);
        if (existing is not null) return;

        var admin = new AppUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true,
            FirstName = "Super",
            LastName = "Admin",
            IsActive = true,
            LanguagePreference = "en",
        };

        var result = await userManager.CreateAsync(admin, "Admin@123456");
        if (!result.Succeeded)
        {
            logger.LogError("Failed to create admin user: {Errors}",
                string.Join(", ", result.Errors.Select(e => e.Description)));
            return;
        }

        await userManager.AddToRolesAsync(admin, ["SuperAdmin", "Owner"]);
        logger.LogInformation("Admin user created: {Email}", adminEmail);
    }
}
