using CapitalLab.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace CapitalLab.Tests.Integration;

/// <summary>
/// Integration test base factory using an in-memory EF Core database.
/// Swap with a real PostgreSQL testcontainer for full integration tests.
/// </summary>
public sealed class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=capitallab_test",
                ["ConnectionStrings:Redis"] = string.Empty,
                ["Jwt:Issuer"] = "https://tests.capitallab.local",
                ["Jwt:Audience"] = "https://tests.capitallab.local",
                ["Jwt:PrivateKeyBase64"] = TestPrivateKeyBase64,
                ["Jwt:PublicKeyBase64"] = TestPublicKeyBase64,
                ["Encryption:Key"] = "dGhpcy1pcy1hLTMyLWJ5dGUta2V5LWZvci10ZXN0cw=="
            });
        });

        builder.ConfigureServices(services =>
        {
            // Replace the real DbContext with in-memory
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<ApplicationDbContext>>();
            services.RemoveAll<ApplicationDbContext>();
            services.RemoveAll<IHostedService>();

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase($"capitallab-test-{Guid.NewGuid()}"));

            // Build service provider and ensure DB is created
            using var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.EnsureCreated();
        });
    }

    private const string TestPrivateKeyBase64 =
        "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRQ3FVL1N0bHk5N1N4eU8KZWk4V29JbWlwNnJMa0R3SytVaWdhQmVya1FTbTQrSVpmNlFhdnAwajI5UVlOT0pWRCtsQ0ZjbVQ1VGdxT0EvbQpNSWk1a1J6THdoVmFTZVZXbTVXWE1JeXJWM0lYbm0yNUJCUmc0dWF4MDM4c0MvR2ZLWlNnc2JWak5idW5TMGJ6CllIWE5ncGtFOWlpY3Iya25ncWIwdlhsMW5JSm5QOXpsdVNrMFlZaFVCUHgyQVlXSTdCT2htWjVhQkFKSmw2WDMKcks2RTJodHA1blk5TzI1UytpYkVNRk5pU0hGOVc0bnRzTEt0WnorUmtnNVE0UnRaMEZXWXljL1hXNFNlQVBCbgpSQUtBck5jbXNVY2d6S003YzNnRWJQQUducVRURW9LbHViREwxbFVBVGpBQ1Jlc0g3VXM4NkZmTzdLVU5OR3A4Ci84ZDdQb0VUQWdNQkFBRUNnZ0VBR3c1MEZ5RWxlejNldnVrODBxalV4RUJER3N3Q0piSWNyZEpyTkNjNHFIUVoKcGZoSExySnB6dGpzTTU0dTk5a3JzZ0k0LzZQUlRLK1VJdnBCdGN5TjJQWXZJeVVLNTd1V1F5cUVwZkVob0F2YwpIU0EvUm5hMHM3bkhnVTB5YUJpWVVnQjRzbFpHUlZocFlGN0p4OGYvbTdDb21kOHBZb3ZZRHBlTWxEaTA1RWFYCnI3UDJwRVVWajV0T0plWjN1MkJZa3dNMWY4QlFMekQzWFZmRW9vVng0eTk3WFVVeUZGY3N1cmhqS3RTbVRsRmYKZjNTWVlCUWYwMmRncVJaMm5kVWV1K0YxMEpSN1QvMUpFK3NVM3NMUmpCL2FuODhrV0ZMQ2dIVENEK2xFSTIzWApCK2xwL2VnTE1yZ3MzZVlNSGVHQWoxaUFydWkwT0NwYlVaZGc0Vk5yelFLQmdRRGprTHV6U3JzMlArL09wZVo3ClQyanRTNzJmU2c1T1lRS3Vob3poZ0twanlvWDZjeHNkWEVIYWwxRU15MWUzRTB5YnFUamFyN2w5WlliMGhJV1IKK2JtMUZ3VjJWU2taZzJzT1lGUVltM2U0M3VKL2dkbDJlaFNkby82eXF6bmJtVmZKMU96UTVhM0dJNHQwQVJBTwpydTZxNFdLbXpQYlNabGE2cUV4dSttTTc5UUtCZ1FDL25GWDlqR2kya0NVMzBQTit2UkhqQ05XemJEcHBEZ1J2CkowYUlFZEhrN1c0M1ZlWEI3by9ZS054dERtR1ZTNjlBM3hFU1Z3MmFQNk1VeFRZQm8vYjlWaE84Um91V0hRckkKNXlBWGZYZXpzYkoxSndjS1N1UUF2clJWcVIzS3VJR3NQbUNPT2RiWFQ5d2lZcjBZbThxOTVQNkVOTEYrcmFPSAowc1B1eUpScjV3S0JnSG1XTXpPd2tpYUNNdGJ1dlI3Vlp2S2lyVVlXZzE1Tlp1bG82b3p4K2hnbmRUNURraEUxCjRkbXhUNVRPY0tkWW9HM3JGSDJEdGsvUmx6RytQTCtwOWhkVG5ZK0VJTm1JNWdKZ1pZNWdRcTk4SnZpSm9HODAKK3g3ZktJNjkvY1BmUXBDTU81dkJtLzlwcm5Ea3dIZVg3OTFOWHpCUUF2Q1h6VzhkelBqZXYzYWhBb0dBRHo5QwpmSFdTMDR3dTJmMHZreE02ZkNWMDA5MDEzS3czNEJ4dytWenBwZHphMjE1amRRWWx2aDZxUTZkVVRvd0NPeGhGCkJIK1czb0pYMk14RW11YlFQYUorMlltSGkvOXRuMFQ5QWNHREovSm83L2VXRU5TYXhoQm15elkwMzYvRTZjN2cKNGhCcUx5SDBzMnZGL2xKUFZNTUhHY0FUcTYvbmhtUllJUVVuQWxzQ2dZRUFyd2JxbzhJUFFwNDlSbm5WZFhIdQpCdFI3RXdxV0lFRXNROTh0M3haTHZwZHhxbjdMTEFITzRNcmV4Vm9sbFZSa0hoWXovUWo1VkYwLytGTWtpOE5aCnU4aWtGdlFGUHU4a1FJaVM0OEF2UE9FWWVzdytwelFpRVprNGVUTTZuMUhPUXpOM0MxYmJ0ZCt0QVR1aExhQkYKejM5am56ZnVHbzAzaWZiaC9QNVBsMVE9Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K";

    private const string TestPublicKeyBase64 =
        "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUFxbFAwclpjdmUwc2Nqbm92RnFDSgpvcWVxeTVBOEN2bElvR2dYcTVFRXB1UGlHWCtrR3I2ZEk5dlVHRFRpVlEvcFFoWEprK1U0S2pnUDVqQ0l1WkVjCnk4SVZXa25sVnB1Vmx6Q01xMWR5RjU1dHVRUVVZT0xtc2ROL0xBdnhueW1Vb0xHMVl6VzdwMHRHODJCMXpZS1oKQlBZb25LOXBKNEttOUwxNWRaeUNaei9jNWJrcE5HR0lWQVQ4ZGdHRmlPd1RvWm1lV2dRQ1NaZWw5Nnl1aE5vYgphZVoyUFR0dVV2b214REJUWWtoeGZWdUo3YkN5cldjL2taSU9VT0ViV2RCVm1NblAxMXVFbmdEd1owUUNnS3pYCkpyRkhJTXlqTzNONEJHendCcDZrMHhLQ3BibXd5OVpWQUU0d0FrWHJCKzFMUE9oWHp1eWxEVFJxZlAvSGV6NkIKRXdJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==";
}
