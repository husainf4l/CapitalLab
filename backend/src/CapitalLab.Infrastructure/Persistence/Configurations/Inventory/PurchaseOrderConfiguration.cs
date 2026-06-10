using CapitalLab.Domain.Entities.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Inventory;

public class PurchaseOrderConfiguration : AuditableEntityConfiguration<PurchaseOrder>
{
    public override void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        base.Configure(builder);

        builder.ToTable("purchase_orders", "inventory");

        builder.Property(p => p.OrderNumber).IsRequired().HasMaxLength(30);
        builder.Property(p => p.SupplierName).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Status).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(p => p.TotalAmount).HasPrecision(18, 3);
        builder.Property(p => p.Currency).IsRequired().HasMaxLength(3);
        builder.Property(p => p.OrderedAt).HasColumnType("timestamptz");
        builder.Property(p => p.ReceivedAt).HasColumnType("timestamptz");
        builder.Property(p => p.Notes).HasMaxLength(1000);

        builder.HasIndex(p => p.OrderNumber).IsUnique().HasDatabaseName("ix_purchase_orders_number");
        builder.HasIndex(p => p.BranchId).HasDatabaseName("ix_purchase_orders_branch_id");
        builder.HasIndex(p => p.Status).HasDatabaseName("ix_purchase_orders_status");

        builder.HasMany(p => p.Items)
            .WithOne(i => i.PurchaseOrder)
            .HasForeignKey(i => i.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PurchaseOrderItemConfiguration : AuditableEntityConfiguration<PurchaseOrderItem>
{
    public override void Configure(EntityTypeBuilder<PurchaseOrderItem> builder)
    {
        base.Configure(builder);

        builder.ToTable("purchase_order_items", "inventory");

        builder.Property(i => i.Quantity).HasPrecision(18, 3);
        builder.Property(i => i.UnitCost).HasPrecision(18, 3);
        builder.Property(i => i.TotalCost).HasPrecision(18, 3);

        builder.HasIndex(i => i.PurchaseOrderId).HasDatabaseName("ix_purchase_order_items_po_id");
        builder.HasIndex(i => i.InventoryItemId).HasDatabaseName("ix_purchase_order_items_item_id");
    }
}
