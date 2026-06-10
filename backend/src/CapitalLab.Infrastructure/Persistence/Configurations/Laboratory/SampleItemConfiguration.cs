using CapitalLab.Domain.Entities.Laboratory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CapitalLab.Infrastructure.Persistence.Configurations.Laboratory;

public class SampleItemConfiguration : IEntityTypeConfiguration<SampleItem>
{
    public void Configure(EntityTypeBuilder<SampleItem> builder)
    {
        builder.ToTable("sample_items", "laboratory");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();
        builder.Property(i => i.Status).HasConversion<string>().IsRequired().HasMaxLength(20);

        builder.HasIndex(i => i.SampleId).HasDatabaseName("ix_sample_items_sample_id");
        builder.HasIndex(i => i.TestOrderItemId).HasDatabaseName("ix_sample_items_test_order_item_id");
        builder.HasIndex(i => i.LabTestId).HasDatabaseName("ix_sample_items_lab_test_id");
    }
}
