import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { ContentCategory, ContentAuthor, ContentTag } from '../../../../core/models/content.models';

@Component({
  selector: 'app-admin-content-post-editor',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <a routerLink="/admin/content/posts" class="back-link"><mat-icon>arrow_back</mat-icon> Posts</a>
          <h1>{{ isEdit() ? 'Edit Post' : 'New Post' }}</h1>
        </div>
        <div class="header-actions">
          <button class="btn-ghost" (click)="save(false)" [disabled]="saving()">Save Draft</button>
          <button class="btn-primary" (click)="save(true)" [disabled]="saving()">
            {{ saving() ? 'Saving...' : (isEdit() ? 'Update Post' : 'Publish Post') }}
          </button>
        </div>
      </div>

      @if (loadingPost()) {
        <div class="loading-state">Loading post...</div>
      } @else {
        <form [formGroup]="form" class="editor-layout">
          <!-- Main column -->
          <div class="editor-main">

            <div class="form-card">
              <h3>English Content</h3>
              <div class="form-row">
                <label>Title (English) <span class="req">*</span></label>
                <input formControlName="titleEn" placeholder="Post title in English" />
              </div>
              <div class="form-row">
                <label>Summary (English)</label>
                <textarea formControlName="summaryEn" rows="3" placeholder="Brief summary for listings and SEO..."></textarea>
              </div>
              <div class="form-row">
                <label>Content (English) <span class="req">*</span></label>
                <textarea formControlName="contentEn" rows="12" placeholder="Full article content in English (HTML supported)..."></textarea>
              </div>
            </div>

            <div class="form-card">
              <h3>Arabic Content</h3>
              <div class="form-row">
                <label>Title (Arabic) <span class="req">*</span></label>
                <input formControlName="titleAr" placeholder="عنوان المقال بالعربية" dir="rtl" />
              </div>
              <div class="form-row">
                <label>Summary (Arabic)</label>
                <textarea formControlName="summaryAr" rows="3" placeholder="ملخص قصير..." dir="rtl"></textarea>
              </div>
              <div class="form-row">
                <label>Content (Arabic) <span class="req">*</span></label>
                <textarea formControlName="contentAr" rows="12" placeholder="محتوى المقال الكامل بالعربية..." dir="rtl"></textarea>
              </div>
            </div>

            <div class="form-card">
              <h3>SEO</h3>
              <div class="form-row">
                <label>Meta Title</label>
                <input formControlName="metaTitle" placeholder="SEO page title" />
              </div>
              <div class="form-row">
                <label>Meta Description</label>
                <textarea formControlName="metaDescription" rows="2" placeholder="SEO description (150-160 chars)"></textarea>
              </div>
              <div class="form-row">
                <label>Keywords</label>
                <input formControlName="keywords" placeholder="Comma-separated keywords" />
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="editor-sidebar">
            <div class="form-card">
              <h3>Settings</h3>
              <div class="form-row">
                <label>Type <span class="req">*</span></label>
                <select formControlName="type">
                  <option value="News">News</option>
                  <option value="Blog">Blog</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Announcement">Announcement</option>
                </select>
              </div>
              <div class="form-row">
                <label>Slug <span class="req">*</span></label>
                <input formControlName="slug" placeholder="url-friendly-slug" />
                <small>Auto-generated from English title</small>
              </div>
              <div class="form-row">
                <label>Category</label>
                <select formControlName="categoryId">
                  <option value="">No category</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.nameEn }}</option>
                  }
                </select>
              </div>
              <div class="form-row">
                <label>Author</label>
                <select formControlName="authorId">
                  <option value="">No author</option>
                  @for (author of authors(); track author.id) {
                    <option [value]="author.id">{{ author.fullName }}</option>
                  }
                </select>
              </div>
              <div class="form-row">
                <label>Expiry Date</label>
                <input type="datetime-local" formControlName="expiryDate" />
              </div>
            </div>

            <div class="form-card">
              <h3>Media</h3>
              <div class="form-row">
                <label>Featured Image URL</label>
                <input formControlName="featuredImageUrl" placeholder="https://..." />
              </div>
              <div class="form-row">
                <label>Thumbnail URL</label>
                <input formControlName="thumbnailUrl" placeholder="https://..." />
              </div>
            </div>

            <div class="form-card">
              <h3>Tags</h3>
              <div class="tags-picker">
                @for (tag of tags(); track tag.id) {
                  <label class="tag-option" [class.selected]="isTagSelected(tag.id)">
                    <input type="checkbox" [checked]="isTagSelected(tag.id)" (change)="toggleTag(tag.id)" />
                    {{ tag.name }}
                  </label>
                }
              </div>
            </div>
          </aside>
        </form>

        @if (errorMsg()) {
          <div class="error-banner">{{ errorMsg() }}</div>
        }
      }
    </div>
  `,
  styles: [`
    @use '../../../../../styles/variables' as *;
    .page-wrapper { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .back-link { display: flex; align-items: center; gap: 4px; color: var(--text-muted); font-size: 13px; text-decoration: none; margin-bottom: 8px; }
    .back-link:hover { color: var(--text-primary); }
    .back-link mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--text-primary); }
    .header-actions { display: flex; gap: 10px; }
    .btn-primary { padding: 10px 22px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
    .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
    .btn-ghost { padding: 10px 22px; border: 1px solid var(--border); border-radius: 8px; background: none; cursor: pointer; color: var(--text-secondary); font-size: 14px; }
    .editor-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
    .editor-main { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
    .editor-sidebar { display: flex; flex-direction: column; gap: 20px; }
    .form-card { background: var(--bg-card); border-radius: 12px; padding: 20px; border: 1px solid var(--border); }
    .form-card h3 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
    .form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-row:last-child { margin-bottom: 0; }
    .form-row label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
    .form-row small { font-size: 11px; color: var(--text-muted); }
    .req { color: #dc2626; }
    .form-row input, .form-row textarea, .form-row select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); color: var(--text-primary); font-size: 14px; font-family: inherit; resize: vertical; }
    .form-row input:focus, .form-row textarea:focus, .form-row select:focus { outline: none; border-color: var(--accent); }
    .tags-picker { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag-option { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border: 1px solid var(--border); border-radius: 20px; cursor: pointer; font-size: 13px; color: var(--text-secondary); transition: all .2s; }
    .tag-option input { display: none; }
    .tag-option.selected { background: var(--accent); border-color: var(--accent); color: #fff; }
    .loading-state { text-align: center; padding: 60px; color: var(--text-muted); }
    .error-banner { margin-top: 16px; padding: 12px 16px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; color: #dc2626; font-size: 14px; }
    @media (max-width: 1024px) { .editor-layout { grid-template-columns: 1fr; } }
  `]
})
export class AdminContentPostEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ContentApiService);
  private fb = inject(FormBuilder);

  isEdit = signal(false);
  loadingPost = signal(false);
  saving = signal(false);
  errorMsg = signal('');
  categories = signal<ContentCategory[]>([]);
  authors = signal<ContentAuthor[]>([]);
  tags = signal<ContentTag[]>([]);
  selectedTags = signal<string[]>([]);
  private postId: string | null = null;

  form = this.fb.group({
    type: ['News', Validators.required],
    titleEn: ['', Validators.required],
    titleAr: ['', Validators.required],
    summaryEn: [''],
    summaryAr: [''],
    contentEn: ['', Validators.required],
    contentAr: ['', Validators.required],
    slug: ['', Validators.required],
    categoryId: [''],
    authorId: [''],
    featuredImageUrl: [''],
    thumbnailUrl: [''],
    metaTitle: [''],
    metaDescription: [''],
    keywords: [''],
    expiryDate: [''],
  });

  ngOnInit() {
    this.api.adminGetCategories().subscribe(r => this.categories.set(r.data ?? []));
    this.api.adminGetAuthors().subscribe(r => this.authors.set(r.data ?? []));
    this.api.adminGetTags().subscribe(r => this.tags.set(r.data ?? []));

    this.form.get('titleEn')!.valueChanges.subscribe(val => {
      if (val && !this.isEdit()) {
        this.form.patchValue({ slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }, { emitEvent: false });
      }
    });

    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.isEdit.set(true);
      this.loadingPost.set(true);
      this.api.adminGetPostBySlug(slug).subscribe({
        next: r => {
          if (r.data) {
            this.form.patchValue({ ...r.data, categoryId: r.data.categoryId ?? '', authorId: r.data.authorId ?? '' });
            this.selectedTags.set(r.data.tags.map(t => t.id));
            this.postId = r.data.id;
          }
        },
        complete: () => this.loadingPost.set(false)
      });
    }
  }

  isTagSelected(id: string) { return this.selectedTags().includes(id); }

  toggleTag(id: string) {
    this.selectedTags.update(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id]);
  }

  save(publish: boolean) {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.errorMsg.set('');

    const val = this.form.value;
    const req: any = {
      ...val,
      categoryId: val.categoryId || undefined,
      authorId: val.authorId || undefined,
      expiryDate: val.expiryDate || undefined,
      tagIds: this.selectedTags(),
    };

    const call: Observable<unknown> = this.isEdit() && this.postId
      ? this.api.updatePost(this.postId, req)
      : this.api.createPost(req);

    call.subscribe({
      next: (r: any) => {
        const newId = this.isEdit() ? this.postId : r.data;
        if (publish && newId) {
          this.api.publishPost(newId as string).subscribe(() => this.router.navigate(['/admin/content/posts']));
        } else {
          this.router.navigate(['/admin/content/posts']);
        }
      },
      error: () => {
        this.errorMsg.set('Failed to save post. Please check the form and try again.');
        this.saving.set(false);
      }
    });
  }
}
