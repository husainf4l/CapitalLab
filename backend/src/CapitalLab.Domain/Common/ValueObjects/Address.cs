namespace CapitalLab.Domain.Common.ValueObjects;

public sealed class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string Region { get; }
    public string PostalCode { get; }
    public string Country { get; }

    private Address() { Street = City = Region = PostalCode = Country = string.Empty; }

    public Address(string street, string city, string region, string postalCode, string country)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(street);
        ArgumentException.ThrowIfNullOrWhiteSpace(city);
        ArgumentException.ThrowIfNullOrWhiteSpace(country);

        Street = street.Trim();
        City = city.Trim();
        Region = region?.Trim() ?? string.Empty;
        PostalCode = postalCode?.Trim() ?? string.Empty;
        Country = country.Trim().ToUpperInvariant();
    }

    public override string ToString() => $"{Street}, {City}, {Region}, {PostalCode}, {Country}";

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return Region;
        yield return PostalCode;
        yield return Country;
    }
}
