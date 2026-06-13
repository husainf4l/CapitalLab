using CapitalLab.Domain.Entities.Laboratory;
using CapitalLab.Domain.Entities.Operations;
using CapitalLab.Domain.Entities.Organization;
using CapitalLab.Domain.Entities.People;
using CapitalLab.Domain.Enums;
using CapitalLab.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.Persistence.Seed;

public sealed class DemoDataSeeder(
    ApplicationDbContext db,
    UserManager<AppUser> userManager,
    ILogger<DemoDataSeeder> logger)
{
    private const string Password = "Demo@123456";

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var targets = DemoTargets.FromEnvironment();

        await SeedDemoUsersAsync(cancellationToken);
        await SeedBranchesAsync(targets.Branches, cancellationToken);
        await SeedDoctorsAsync(targets.Doctors, cancellationToken);
        await SeedStaffAsync(targets.Staff, cancellationToken);
        await SeedPatientsAsync(targets.Patients, cancellationToken);
        await SeedOperationalDataAsync(targets, cancellationToken);

        logger.LogInformation("Demo data seed completed with targets {@Targets}", targets);
    }

    private async Task SeedDemoUsersAsync(CancellationToken ct)
    {
        var accounts = new[]
        {
            ("superadmin@capitallab.demo", "Super", "Admin", new[] { "SuperAdmin", "Owner" }),
            ("owner@capitallab.demo", "Demo", "Owner", new[] { "Owner" }),
            ("branchadmin@capitallab.demo", "Branch", "Admin", new[] { "BranchAdmin" }),
            ("labmanager@capitallab.demo", "Lab", "Manager", new[] { "LabManager" }),
            ("receptionist@capitallab.demo", "Front", "Desk", new[] { "Receptionist" }),
            ("technician@capitallab.demo", "Lab", "Technician", new[] { "LabTechnician" }),
            ("phlebotomist@capitallab.demo", "Demo", "Phlebotomist", new[] { "Phlebotomist" }),
            ("doctor@capitallab.demo", "Review", "Doctor", new[] { "Doctor" }),
            ("patient@capitallab.demo", "Demo", "Patient", new[] { "Patient" }),
            ("collector@capitallab.demo", "Home", "Collector", new[] { "HomeCollector" }),
        };

        foreach (var (email, firstName, lastName, roles) in accounts)
        {
            var user = await EnsureUserAsync(email, firstName, lastName, ct);
            await userManager.AddToRolesAsync(user, roles);
        }
    }

    private async Task<AppUser> EnsureUserAsync(string email, string firstName, string lastName, CancellationToken ct)
    {
        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null)
            return existing;

        var user = new AppUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FirstName = firstName,
            LastName = lastName,
            IsActive = true,
            LanguagePreference = "en"
        };

        var result = await userManager.CreateAsync(user, Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                $"Failed to create demo user {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        logger.LogInformation("Created demo user {Email}", email);
        return user;
    }

    private static readonly (string code, string name, string nameAr, string address, string city, string area, decimal lat, decimal lon)[] BranchData =
    [
        ("BR01", "Capital Lab — Abdali",         "كابيتال لاب - العبدلي",      "King Hussein Street, Abdali Complex", "Amman", "Abdali",      31.9769m, 35.9244m),
        ("BR02", "Capital Lab — Mecca Street",   "كابيتال لاب - شارع مكة",    "Mecca Street, Building 42",           "Amman", "Mecca Street", 31.9642m, 35.9000m),
        ("BR03", "Capital Lab — Khalda",          "كابيتال لاب - خلدا",        "Khalda Medical Complex, 3rd Circle",  "Amman", "Khalda",       31.9906m, 35.8706m),
        ("BR04", "Capital Lab — Sweifieh",        "كابيتال لاب - الصويفية",    "Sweifieh Village Mall, Ground Floor", "Amman", "Sweifieh",     31.9641m, 35.8726m),
        ("BR05", "Capital Lab — Irbid Main",      "كابيتال لاب - إربد المركزي","University Street, Irbid",            "Irbid", "University",   32.5556m, 35.8500m),
        ("BR06", "Capital Lab — Bayader",         "كابيتال لاب - البيادر",     "Bayader Wadi Seer, Block B",          "Amman", "Bayader",      31.9432m, 35.8498m),
        ("BR07", "Capital Lab — Zarqa",           "كابيتال لاب - الزرقاء",     "King Talal Street, Zarqa",            "Zarqa", "Downtown",     32.0751m, 36.0882m),
        ("BR08", "Capital Lab — Jubeiha",         "كابيتال لاب - الجبيهة",     "University of Jordan Area, Jubeiha",  "Amman", "Jubeiha",      32.0099m, 35.8772m),
        ("BR09", "Capital Lab — Gardens",         "كابيتال لاب - الحدائق",     "Gardens Street, Next to Al-Faidi",    "Amman", "Gardens",      31.9804m, 35.8882m),
        ("BR10", "Capital Lab — Aqaba",           "كابيتال لاب - العقبة",      "Hammamat Al-Mishna Street, Aqaba",    "Aqaba", "Downtown",     29.5327m, 35.0061m),
    ];

    private async Task SeedBranchesAsync(int targetCount, CancellationToken ct)
    {
        var existing = await db.Branches.CountAsync(ct);
        for (var i = existing + 1; i <= targetCount; i++)
        {
            var idx = (i - 1) % BranchData.Length;
            var b = idx < BranchData.Length ? BranchData[idx] : default;
            var isKnown = idx < BranchData.Length;

            db.Branches.Add(Branch.Create(
                code: isKnown ? b.code : $"BR{i:00}",
                name: isKnown ? b.name : $"Capital Lab — Branch {i:00}",
                nameAr: isKnown ? b.nameAr : $"كابيتال لاب — فرع {i:00}",
                phone: $"+9626{5550000 + i:0000000}",
                email: $"branch{i:00}@capitallab.demo",
                address: isKnown ? b.address : $"Medical Street {i}, Building {i * 2}",
                city: isKnown ? b.city : "Amman",
                area: isKnown ? b.area : "Downtown",
                latitude: isKnown ? b.lat : 31.9500m + (i * 0.002m),
                longitude: isKnown ? b.lon : 35.9300m + (i * 0.002m),
                openingTime: new TimeOnly(7, 30),
                closingTime: new TimeOnly(22, 0),
                isMainBranch: existing == 0 && i == 1));
        }

        await db.SaveChangesAsync(ct);
    }

    private static readonly string[] DoctorFirstNames =
        ["Ahmad", "Khalid", "Rania", "Lara", "Samer", "Nadia", "Tariq", "Leen", "Omar", "Hana",
         "Faisal", "Mona", "Bassam", "Dima", "Wissam", "Samar", "Ziad", "Maya", "Iyad", "Ola"];
    private static readonly string[] DoctorLastNames =
        ["Al-Rashid", "Mansour", "Haddad", "Khalil", "Najjar", "Sabbagh", "Barakat", "Saleh",
         "Nasser", "Amin", "Khoury", "Masri", "Halabi", "Shami", "Qasim", "Daoud", "Hamdan", "Jaber"];
    private static readonly string[] Specializations =
        ["Clinical Pathology", "Laboratory Medicine", "Microbiology", "Hematology", "Biochemistry",
         "Immunology", "Genetics", "Anatomical Pathology"];

    private async Task SeedDoctorsAsync(int targetCount, CancellationToken ct)
    {
        var branches = await db.Branches.OrderBy(b => b.Code).Select(b => b.Id).ToListAsync(ct);
        var current = await db.Doctors.CountAsync(ct);

        for (var i = current + 1; i <= targetCount; i++)
        {
            var first = DoctorFirstNames[(i - 1) % DoctorFirstNames.Length];
            var last  = DoctorLastNames[(i - 1) % DoctorLastNames.Length];
            var email = $"doctor{i:0000}@capitallab.demo";
            var user  = await EnsureUserAsync(email, first, last, ct);
            await userManager.AddToRoleAsync(user, "Doctor");

            db.Doctors.Add(Doctor.Create(
                branchId: branches[(i - 1) % branches.Count],
                fullName: $"Dr. {first} {last}",
                specialization: Specializations[(i - 1) % Specializations.Length],
                licenseNumber: $"JMC-{30000 + i}",
                phone: $"+96279{i:0000000}",
                email: email,
                isReviewer: true,
                isApprover: i % 4 == 0,
                userId: user.Id));
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task SeedStaffAsync(int targetCount, CancellationToken ct)
    {
        var branches = await db.Branches.OrderBy(b => b.Code).Select(b => b.Id).ToListAsync(ct);
        var current = await db.StaffProfiles.CountAsync(ct);
        var departments = new[] { "Reception", "Phlebotomy", "Clinical", "Administration", "Patient Services" };
        var roles = new[] { "Receptionist", "Phlebotomist", "LabTechnician", "LabManager", "HomeCollector" };

        for (var i = current + 1; i <= targetCount; i++)
        {
            var role = roles[(i - 1) % roles.Length];
            var email = $"staff{i:0000}@capitallab.demo";
            var user = await EnsureUserAsync(email, "Staff", $"{i:0000}", ct);
            await userManager.AddToRoleAsync(user, role);

            db.StaffProfiles.Add(StaffProfile.Create(
                branchId: branches[(i - 1) % branches.Count],
                employeeCode: $"EMP{i:0000}",
                fullName: $"Demo Staff {i:0000}",
                jobTitle: role,
                department: departments[(i - 1) % departments.Length],
                phone: $"+962780{i:000000}",
                email: email,
                hireDate: DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-i)),
                userId: user.Id));
        }

        await db.SaveChangesAsync(ct);
    }

    private static readonly string[] PatientFirstNamesMale =
        ["Omar", "Yousef", "Ahmad", "Khalid", "Tariq", "Firas", "Zaid", "Adam", "Samer",
         "Bassam", "Iyad", "Fadi", "Rami", "Wissam", "Nidal", "Ayman", "Hasan", "Kareem"];
    private static readonly string[] PatientFirstNamesFemale =
        ["Lina", "Maya", "Sara", "Noor", "Rania", "Hana", "Dima", "Leen", "Samar",
         "Mona", "Ola", "Reem", "Lara", "Jana", "Sana", "Mais", "Huda", "Ruba"];
    private static readonly string[] PatientLastNames =
        ["Al-Ahmad", "Khalil", "Haddad", "Mansour", "Nasser", "Saleh", "Rashid", "Amin",
         "Sabbagh", "Khoury", "Masri", "Halabi", "Barakat", "Najjar", "Qasim", "Daoud",
         "Hamdan", "Jaber", "Zubi", "Shami", "Tawfiq", "Saad", "Bani Younes"];
    private static readonly string[] MedicalHistories =
        ["Type 2 Diabetes — monitoring HbA1c quarterly",
         "Hypertension — annual lipid panel",
         "Hypothyroidism — TSH monitoring every 6 months",
         "Anemia — follow-up CBC",
         "Chronic kidney disease stage 2 — renal function monitoring",
         null!, null!, null!, null!, null!];
    private static readonly string[] CityAreas =
        ["Abdali", "Shmeisani", "Sweifieh", "Khalda", "Jubeiha", "Gardens", "Bayader", "7th Circle",
         "3rd Circle", "Mecca Street", "Jabal Amman", "Rabieh", "Zahran", "University"];

    private async Task SeedPatientsAsync(int targetCount, CancellationToken ct)
    {
        var current = await db.Patients.CountAsync(ct);

        for (var i = current + 1; i <= targetCount; i++)
        {
            var isFemale = i % 2 == 0;
            var first = isFemale
                ? PatientFirstNamesFemale[(i - 1) % PatientFirstNamesFemale.Length]
                : PatientFirstNamesMale[(i - 1) % PatientFirstNamesMale.Length];
            var last  = PatientLastNames[(i - 1) % PatientLastNames.Length];
            var area  = CityAreas[(i - 1) % CityAreas.Length];
            var medical = MedicalHistories[(i - 1) % MedicalHistories.Length];

            db.Patients.Add(Patient.Create(
                patientNumber: $"P-{i:000000}",
                firstName: first,
                lastName: last,
                nameAr: $"{first} {last}",
                gender: isFemale ? Gender.Female : Gender.Male,
                dateOfBirth: DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-20 - (i % 55)).AddDays(i % 365)),
                nationalId: $"9{i:000000000}",
                passportNumber: i % 15 == 0 ? $"J{i:0000000}" : null,
                phone: $"+96277{i % 10000000:0000000}",
                email: $"patient{i:000000}@capitallab.demo",
                address: $"Street {(i % 50) + 1}, Building {(i % 20) + 1}, {area}",
                city: i % 8 == 0 ? "Irbid" : (i % 12 == 0 ? "Zarqa" : "Amman"),
                area: area,
                emergencyContactName: $"{PatientFirstNamesMale[i % PatientFirstNamesMale.Length]} {last}",
                emergencyContactPhone: $"+96279{(i * 3) % 10000000:0000000}",
                insuranceProvider: null,
                insuranceNumber: null,
                medicalHistory: medical,
                allergies: i % 13 == 0 ? "Penicillin" : (i % 19 == 0 ? "Sulfa drugs" : null)));

            if (i % 500 == 0)
                await db.SaveChangesAsync(ct);
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task SeedOperationalDataAsync(DemoTargets targets, CancellationToken ct)
    {
        var branchIds = await db.Branches.OrderBy(b => b.Code).Select(b => b.Id).ToListAsync(ct);
        var patients = await db.Patients.OrderBy(p => p.PatientNumber).Select(p => p.Id).Take(targets.Patients).ToListAsync(ct);
        var tests = await db.LabTests.OrderBy(t => t.Code)
            .Select(t => new { t.Id, t.Code, t.Name, t.Price, t.Currency })
            .ToListAsync(ct);

        if (branchIds.Count == 0 || patients.Count == 0 || tests.Count == 0)
            throw new InvalidOperationException("Demo data requires branches, patients, and lab tests.");

        var appointmentCount = await db.Appointments.CountAsync(ct);
        var orderCount = await db.TestOrders.CountAsync(ct);

        var targetRows = Math.Max(targets.Appointments, targets.Orders);

        for (var i = 1; i <= targetRows; i++)
        {
            var patientId = patients[(i - 1) % patients.Count];
            var branchId = branchIds[(i - 1) % branchIds.Count];
            var test = tests[(i - 1) % tests.Count];

            Appointment? appointment = null;

            if (appointmentCount + i <= targets.Appointments)
            {
                appointment = Appointment.Create(
                    appointmentNumber: $"APT-DEMO-{appointmentCount + i:000000}",
                    patientId: patientId,
                    branchId: branchId,
                    appointmentType: i % 6 == 0 ? AppointmentType.HomeCollection : AppointmentType.BranchVisit,
                    appointmentDate: DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(i % 30)),
                    startTime: new TimeOnly(8 + (i % 10), 0),
                    endTime: new TimeOnly(9 + (i % 10), 0),
                    notes: "Demo appointment");

                db.Appointments.Add(appointment);
                db.AppointmentItems.Add(AppointmentItem.CreateLabTest(
                    appointment.Id, test.Id, test.Name, test.Code, test.Price, test.Currency));
            }

            if (orderCount + i <= targets.Orders)
            {
                var order = TestOrder.Create(
                    orderNumber: $"ORD-DEMO-{orderCount + i:000000}",
                    patientId: patientId,
                    appointmentId: appointment?.Id,
                    branchId: branchId,
                    subtotalAmount: test.Price,
                    discountAmount: 0m,
                    totalAmount: test.Price,
                    currency: test.Currency,
                    notes: "Demo order");

                var orderItem = TestOrderItem.CreateLabTest(order.Id, test.Id, test.Name, test.Code, 1, test.Price, test.Currency);
                db.TestOrders.Add(order);
                db.TestOrderItems.Add(orderItem);
            }

            if (i % 500 == 0)
                await db.SaveChangesAsync(ct);
        }

        await db.SaveChangesAsync(ct);
    }

    private sealed record DemoTargets(
        int Branches,
        int Doctors,
        int Staff,
        int Patients,
        int Appointments,
        int Orders)
    {
        public static DemoTargets FromEnvironment() => new(
            Branches: Get("DEMO_BRANCH_COUNT", 10),
            Doctors: Get("DEMO_DOCTOR_COUNT", 50),
            Staff: Get("DEMO_STAFF_COUNT", 100),
            Patients: Get("DEMO_PATIENT_COUNT", 5_000),
            Appointments: Get("DEMO_APPOINTMENT_COUNT", 50_000),
            Orders: Get("DEMO_ORDER_COUNT", 50_000));

        private static int Get(string name, int fallback) =>
            int.TryParse(Environment.GetEnvironmentVariable(name), out var value) && value >= 0
                ? value
                : fallback;
    }
}
