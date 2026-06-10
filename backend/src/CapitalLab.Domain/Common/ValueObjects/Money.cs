namespace CapitalLab.Domain.Common.ValueObjects;

public sealed class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    public static readonly Money Zero = new(0m, "SAR");

    private Money() { Amount = 0; Currency = "SAR"; }

    public Money(decimal amount, string currency = "SAR")
    {
        if (amount < 0)
            throw new ArgumentOutOfRangeException(nameof(amount), "Money amount cannot be negative.");

        ArgumentException.ThrowIfNullOrWhiteSpace(currency);

        Amount = Math.Round(amount, 3);
        Currency = currency.Trim().ToUpperInvariant();
    }

    public Money Add(Money other)
    {
        EnsureSameCurrency(other);
        return new Money(Amount + other.Amount, Currency);
    }

    public Money Subtract(Money other)
    {
        EnsureSameCurrency(other);
        return new Money(Amount - other.Amount, Currency);
    }

    public Money Multiply(decimal factor) => new(Amount * factor, Currency);

    public Money ApplyDiscount(decimal percent)
    {
        if (percent is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(percent), "Discount must be 0–100.");
        return new Money(Amount * (1 - percent / 100), Currency);
    }

    private void EnsureSameCurrency(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot operate on different currencies: {Currency} vs {other.Currency}.");
    }

    public static Money operator +(Money a, Money b) => a.Add(b);
    public static Money operator -(Money a, Money b) => a.Subtract(b);
    public static Money operator *(Money a, decimal factor) => a.Multiply(factor);

    public override string ToString() => $"{Amount:F3} {Currency}";

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }
}
