using System.Text.RegularExpressions;

namespace CapitalLab.Domain.Common.ValueObjects;

public sealed class PhoneNumber : ValueObject
{
    private static readonly Regex PhoneRegex =
        new(@"^\+?[1-9]\d{6,14}$", RegexOptions.Compiled, TimeSpan.FromSeconds(1));

    public string Value { get; }

    private PhoneNumber() { Value = string.Empty; }

    private PhoneNumber(string value) => Value = value;

    public static PhoneNumber Create(string raw)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(raw);

        var normalized = raw.Trim().Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "");

        if (!PhoneRegex.IsMatch(normalized))
            throw new ArgumentException($"'{raw}' is not a valid phone number.", nameof(raw));

        return new PhoneNumber(normalized);
    }

    public static implicit operator string(PhoneNumber phone) => phone.Value;

    public override string ToString() => Value;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}
