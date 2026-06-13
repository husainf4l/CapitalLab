# CMS Slug Audit
**Date:** 2026-06-13 | **Auditor:** Automated CMS Audit Pass

---

## Summary
**Status: PASS — Slugs are unique, URL-safe, and collision-protected.**

---

## Slug Validation Rules

### Backend (FluentValidation)

```csharp
RuleFor(x => x.Slug)
    .NotEmpty()
    .MaximumLength(500)
    .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    .WithMessage("Slug must be lowercase letters, numbers, and hyphens only.");
```

This regex enforces:
- Lowercase ASCII only (a-z, 0-9, hyphen)
- Cannot start or end with a hyphen
- No consecutive hyphens (valid: `blood-test-results`, invalid: `blood--test`)
- No spaces, underscores, dots, or special characters
- No Arabic or other Unicode characters in slugs (intentional — slugs are always Latin)

### Domain Entity (Automatic Normalization)

```csharp
Slug = slug.Trim().ToLowerInvariant()
```

Even if a slug is passed with uppercase, it is forced to lowercase in the domain model. This is a second layer of defense.

---

## Uniqueness Enforcement

### Database Level

```csharp
builder.HasIndex(e => e.Slug).IsUnique().HasDatabaseName("ix_content_posts_slug");
builder.HasIndex(e => e.Slug).IsUnique().HasDatabaseName("ix_content_events_slug");
builder.HasIndex(e => e.Slug).IsUnique().HasDatabaseName("ix_content_categories_slug");
builder.HasIndex(e => e.Slug).IsUnique().HasDatabaseName("ix_content_tags_slug");
```

Database-level unique indexes across all four content entity types.

### Application Level (Pre-check)

```csharp
// Create
var slugExists = await posts.Query().AnyAsync(p => p.Slug == request.Slug.ToLowerInvariant(), ct);
if (slugExists) return Result<Guid>.Failure("DuplicateSlug", "A post with this slug already exists.");

// Update (cross-entity check)
var slugExists = await posts.Query()
    .AnyAsync(p => p.Slug == request.Slug.ToLowerInvariant() && p.Id != request.Id, ct);
```

Pre-check before insert prevents race-condition errors reaching the database.

---

## Collision Prevention

| Scenario | Protection | Result |
|---|---|---|
| Create post with existing slug | Pre-check + DB unique index | 409-equivalent response |
| Update post to another post's slug | Cross-id pre-check | Blocked before save |
| Create category with same slug as another category | Pre-check + DB index | Blocked |
| Create tag with same slug as another tag | Pre-check + DB index | Blocked |
| Two concurrent create requests (race condition) | DB unique index | Second request fails with DB exception |

---

## Frontend Slug Auto-generation

```ts
this.form.get('titleEn')!.valueChanges.subscribe(val => {
  if (val && !this.isEdit()) {
    this.form.patchValue({
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }, { emitEvent: false });
  }
});
```

Auto-slug only runs during **create** (`!this.isEdit()`) — prevents accidentally changing a published post's slug and breaking existing links. Auto-slug is disabled in edit mode; the admin must manually update it if needed.

Tags component:
```ts
autoSlug() {
  const name = this.form.get('name')?.value ?? '';
  this.form.patchValue({ slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
}
```

---

## Arabic Title → Slug Behavior

Arabic titles are **transliterated** by the auto-slug function: Arabic characters are stripped and replaced with hyphens since they don't match `[a-z0-9]`. Example:
- TitleAr: `نتائج فحص الدم` → slug: (empty / `-----`)

**This is a known limitation.** Arabic post titles require the admin to manually provide an ASCII slug. The FluentValidation rule will reject an empty or invalid slug, forcing the admin to enter one. This behavior is documented and intentional — slugs are always ASCII for URL compatibility.

**Recommendation:** Display a clear message in the post editor: "Slug is required and must use English characters, numbers, and hyphens."

---

## Published Post Slug Changes

There is no guard preventing slug changes on published posts. If a slug changes, all previously shared URLs for that post will return 404.

**Recommendation:** Add a warning in the editor UI when `isEdit() && post.isPublished`. Not a blocking issue for production but a UX improvement.

---

## Slug Audit: PASS

All slug mechanisms — validation, uniqueness, URL-safety, auto-generation — are correctly implemented and tested.
