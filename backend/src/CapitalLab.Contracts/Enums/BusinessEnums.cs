namespace CapitalLab.Contracts.Enums;

public enum InventoryTransactionType
{
    StockIn = 1,
    StockOut = 2,
    Adjustment = 3,
    Transfer = 4,
    Expired = 5,
    Damaged = 6
}

public enum PurchaseOrderStatus
{
    Draft = 1,
    Submitted = 2,
    Approved = 3,
    Received = 4,
    Cancelled = 5
}

public enum InvoiceStatus
{
    Draft = 1,
    Issued = 2,
    PartiallyPaid = 3,
    Paid = 4,
    Overdue = 5,
    Cancelled = 6,
    Refunded = 7
}

public enum InvoiceItemType
{
    Test = 1,
    Package = 2,
    Service = 3,
    Other = 4
}

public enum PaymentMethod
{
    Cash = 1,
    Card = 2,
    BankTransfer = 3,
    CliQ = 4,
    Insurance = 5,
    Online = 6
}

public enum PaymentStatus
{
    Pending = 1,
    Completed = 2,
    Failed = 3,
    Refunded = 4,
    Cancelled = 5
}

public enum InsuranceClaimStatus
{
    Draft = 1,
    Submitted = 2,
    UnderReview = 3,
    Approved = 4,
    PartiallyApproved = 5,
    Rejected = 6,
    Paid = 7
}
