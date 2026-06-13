using CapitalLab.Domain.Common;

namespace CapitalLab.Domain.Entities.Content;

public class ContentPostTag : BaseEntity
{
    public Guid PostId { get; private set; }
    public Guid TagId { get; private set; }

    public ContentPost Post { get; private set; } = null!;
    public ContentTag Tag { get; private set; } = null!;

    private ContentPostTag() { }

    public static ContentPostTag Create(Guid postId, Guid tagId)
    {
        return new ContentPostTag
        {
            Id = Guid.NewGuid(),
            PostId = postId,
            TagId = tagId
        };
    }
}
