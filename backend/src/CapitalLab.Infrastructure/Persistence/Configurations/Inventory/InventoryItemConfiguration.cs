using CapitalLab.Domain.Entities.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Inventory;

public class InventoryItemConfiguration : AuditableEntityConfiguration<InventoryItem>
{
    public override void Configure(EntityTypeBuilder<InventoryItem> builder)
    {
        base.Configure(builder);

        builder.ToTable("inventory_items", "inventory");

        builder.Property(i => i.Name).IsRequired().HasMaxLength(200);
        builder.Property(i => i.Code).IsRequired().HasMaxLength(50);
        builder.Property(i => i.Category).IsRequired().HasMaxLength(100);
        builder.Property(i => i.Unit).IsRequired().HasMaxLength(50);
        builder.Property(i => i.CurrentStock).HasPrecision(18, 3);
        builder.Property(i => i.MinimumStock).HasPrecision(18, 3);
        builder.Property(i => i.MaximumStock).HasPrecision(18, 3);
        builder.Property(i => i.CostPrice).HasPrecision(18, 3);
        builder.Property(i => i.SupplierName).HasMaxLength(200);
        builder.Property(i => i.BatchNumber).HasMaxLength(100);

        builder.HasIndex(i => new { i.BranchId, i.Code }).IsUnique().HasDatabaseName("ix_inventory_items_branch_code");
        builder.HasIndex(i => i.BranchId).HasDatabaseName("ix_inventory_items_branch_id");
        builder.HasIndex(i => i.Category).HasDatabaseName("ix_inventory_items_category");
        builder.HasIndex(i => i.ExpiryDate).HasDatabaseName("ix_inventory_items_expiry");
    }
}
