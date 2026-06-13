import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { ContentTag } from '../../../../core/models/content.models';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-admin-content-tags',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, A11yModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1>Content Tags</h1>
          <p>Tag posts for better discoverability</p>
        </div>
        <button class="btn-primary" (click)="openForm()"><mat-icon>add</mat-icon> New Tag</button>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading tags...</div>
      } @else if (tags().length === 0) {
        <div class="empty-state"><mat-icon>label_outline</mat-icon><p>No tags yet.</p></div>
      } @else {
        <div class="tags-grid">
          @for (tag of tags(); track tag.id) {
            <div class="tag-card">
              <div class="tag-info">
                <span class="tag-name">{{ tag.name }}</span>
                <code class="tag-slug">{{ tag.slug }}</code>
              </div>
              <div class="tag-meta">
                <span class="post-count">{{ tag.postCount }} posts</span>
                <button class="action-btn danger" (click)="confirmDelete(tag)"><mat-icon>delete</mat-icon></button>
              </div>
            </div>
          }
        </div>
      }

      @if (showForm()) {
        <div class="modal-backdrop" (click)="showForm.set(false)">
          <div class="modal" (click)="$event.stopPropagation()" (keydown.escape)="showForm.set(false)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="tag-form-title">
            <h3 id="tag-form-title">New Tag</h3>
            <form [formGroup]="form" (ngSubmit)="submitForm()">
              <div class="form-row"><label>Tag Name *</label><input formControlName="name" placeholder="e.g. Blood Tests" (input)="autoSlug()" /></div>
              <div class="form-row"><label>Slug *</label><input formControlName="slug" placeholder="blood-tests" /></div>
              <div class="modal-actions">
                <button type="button" class="btn-ghost" (click)="showForm.set(false)">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="saving()">{{ saving() ? 'Saving...' : 'Create Tag' }}</button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (deleteTarget()) {
        <div class="modal-backdrop" (click)="deleteTarget.set(null)">
          <div class="modal" (click)="$event.stopPropagation()" (keydown.escape)="deleteTarget.set(null)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="tag-del-title">
            <h3 id="tag-del-title">Delete Tag?</h3>
            <p>Delete tag <strong>{{ deleteTarget()!.name }}</strong>? It will be removed from all posts.</p>
            <div class="modal-actions">
              <button class="btn-ghost" (click)="deleteTarget.set(null)">Cancel</button>
              <button class="btn-danger" (click)="doDelete()">Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../../styles/variables' as *;
    .page-wrapper { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; color: var(--text-primary); }
    .page-header p { color: var(--text-muted); font-size: 14px; margin: 0; }
    .btn-primary { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
    .btn-primary:disabled { opacity: .6; }
    .tags-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
    .tag-card { background: var(--bg-card); border-radius: 10px; padding: 14px 16px; border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .tag-info { display: flex; flex-direction: column; gap: 4px; }
    .tag-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .tag-slug { font-size: 11px; color: var(--accent); background: none; padding: 0; }
    .tag-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .post-count { font-size: 12px; color: var(--text-muted); }
    .action-btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface); cursor: pointer; color: var(--text-secondary); transition: all .2s; }
    .action-btn.danger:hover { color: #dc2626; border-color: #dc2626; }
    .action-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .loading-state, .empty-state { text-align: center; padding: 60px; color: var(--text-muted); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--bg-card); border-radius: 12px; padding: 28px; max-width: 400px; width: 90%; border: 1px solid var(--border); }
    .modal h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 20px; color: var(--text-primary); }
    .modal p { color: var(--text-secondary); font-size: 14px; margin: 0 0 20px; }
    .form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
    .form-row label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
    .form-row input { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); color: var(--text-primary); font-size: 14px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
    .btn-ghost { padding: 8px 18px; border: 1px solid var(--border); border-radius: 8px; background: none; cursor: pointer; color: var(--text-secondary); }
    .btn-danger { padding: 8px 18px; border-radius: 8px; background: #dc2626; border: none; color: #fff; cursor: pointer; font-weight: 600; }
  `]
})
export class AdminContentTagsComponent implements OnInit {
  private api = inject(ContentApiService);
  private fb = inject(FormBuilder);

  tags = signal<ContentTag[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  deleteTarget = signal<ContentTag | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.adminGetTags().subscribe({ next: r => this.tags.set(r.data ?? []), complete: () => this.loading.set(false) });
  }

  openForm() { this.form.reset(); this.showForm.set(true); }

  autoSlug() {
    const name = this.form.get('name')?.value ?? '';
    this.form.patchValue({ slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }, { emitEvent: false });
  }

  submitForm() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.api.createTag(this.form.value as any).subscribe({
      next: () => { this.showForm.set(false); this.load(); },
      complete: () => this.saving.set(false)
    });
  }

  confirmDelete(tag: ContentTag) { this.deleteTarget.set(tag); }
  doDelete() {
    this.api.deleteTag(this.deleteTarget()!.id).subscribe(() => { this.deleteTarget.set(null); this.load(); });
  }
}
