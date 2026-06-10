using System.Text.RegularExpressions;

namespace CapitalLab.Domain.Common.ValueObjects;

public sealed class EmailAddress : ValueObject
{
    private static readonly Regex EmailRegex =
        new(@"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$",
            RegexOptions.Compiled | RegexOptions.IgnoreCase,
            TimeSpan.FromSeconds(1));

    public string Value { get; }

    private EmailAddress() { Value = string.Empty; }

    private EmailAddress(string value) => Value = value;

    public static EmailAddress Create(string raw)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(raw);

        var normalized = raw.Trim().ToLowerInvariant();

        if (!EmailRegex.IsMatch(normalized))
            throw new ArgumentException($"'{raw}' is not a valid email address.", nameof(raw));

        return new EmailAddress(normalized);
    }

    public static implicit operator string(EmailAddress email) => email.Value;

    public override string ToString() => Value;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}
