using CapitalLab.Domain.Entities.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Inventory;

public class InventoryTransactionConfiguration : AuditableEntityConfiguration<InventoryTransaction>
{
    public override void Configure(EntityTypeBuilder<InventoryTransaction> builder)
    {
        base.Configure(builder);

        builder.ToTable("inventory_transactions", "inventory");

        builder.Property(t => t.TransactionType).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(t => t.Quantity).HasPrecision(18, 3);
        builder.Property(t => t.UnitCost).HasPrecision(18, 3);
        builder.Property(t => t.TotalCost).HasPrecision(18, 3);
        builder.Property(t => t.Reason).HasMaxLength(500);
        builder.Property(t => t.ReferenceNumber).HasMaxLength(50);

        builder.HasIndex(t => t.InventoryItemId).HasDatabaseName("ix_inventory_transactions_item_id");
        builder.HasIndex(t => t.BranchId).HasDatabaseName("ix_inventory_transactions_branch_id");
        builder.HasIndex(t => t.TransactionType).HasDatabaseName("ix_inventory_transactions_type");
    }
}
