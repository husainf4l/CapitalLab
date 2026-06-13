import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { A11yModule } from '@angular/cdk/a11y';
import { Observable } from 'rxjs';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { ContentCategory } from '../../../../core/models/content.models';

@Component({
  selector: 'app-admin-content-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, A11yModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1>Content Categories</h1>
          <p>Organise posts into categories</p>
        </div>
        <button class="btn-primary" (click)="openForm(null)"><mat-icon>add</mat-icon> New Category</button>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading categories...</div>
      } @else {
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name (EN)</th>
                <th>Name (AR)</th>
                <th>Slug</th>
                <th>Sort</th>
                <th>Posts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (cat of categories(); track cat.id) {
                <tr>
                  <td><strong>{{ cat.nameEn }}</strong></td>
                  <td dir="rtl">{{ cat.nameAr }}</td>
                  <td><code>{{ cat.slug }}</code></td>
                  <td>{{ cat.sortOrder }}</td>
                  <td>{{ cat.postCount }}</td>
                  <td><span [class]="cat.isActive ? 'badge-active' : 'badge-inactive'">{{ cat.isActive ? 'Active' : 'Inactive' }}</span></td>
                  <td>
                    <div class="actions-cell">
                      <button class="action-btn" (click)="openForm(cat)"><mat-icon>edit</mat-icon></button>
                      <button class="action-btn danger" (click)="confirmDelete(cat)"><mat-icon>delete</mat-icon></button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showForm()) {
        <div class="modal-backdrop" (click)="showForm.set(false)">
          <div class="modal" (click)="$event.stopPropagation()" (keydown.escape)="showForm.set(false)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="cat-form-title">
            <h3 id="cat-form-title">{{ editTarget() ? 'Edit Category' : 'New Category' }}</h3>
            <form [formGroup]="form" (ngSubmit)="submitForm()">
              <div class="form-row">
                <label>Name (English) *</label>
                <input formControlName="nameEn" placeholder="Category name" />
              </div>
              <div class="form-row">
                <label>Name (Arabic) *</label>
                <input formControlName="nameAr" placeholder="اسم الفئة" dir="rtl" />
              </div>
              <div class="form-row">
                <label>Slug *</label>
                <input formControlName="slug" placeholder="url-slug" />
              </div>
              <div class="form-row">
                <label>Description</label>
                <textarea formControlName="description" rows="2"></textarea>
              </div>
              <div class="form-row">
                <label>Sort Order</label>
                <input type="number" formControlName="sortOrder" />
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-ghost" (click)="showForm.set(false)">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="saving()">{{ saving() ? 'Saving...' : 'Save' }}</button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (deleteTarget()) {
        <div class="modal-backdrop" (click)="deleteTarget.set(null)">
          <div class="modal" (click)="$event.stopPropagation()" (keydown.escape)="deleteTarget.set(null)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="cat-del-title">
            <h3 id="cat-del-title">Delete Category?</h3>
            <p>Delete <strong>{{ deleteTarget()!.nameEn }}</strong>? Posts in this category will be uncategorized.</p>
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
    .table-card { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); background: var(--bg-surface); border-bottom: 1px solid var(--border); }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text-secondary); }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: var(--bg-surface); }
    code { font-size: 12px; background: var(--bg-surface); padding: 2px 6px; border-radius: 4px; color: var(--accent); }
    .badge-active { padding: 3px 9px; background: #d1fae5; color: #065f46; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .badge-inactive { padding: 3px 9px; background: var(--bg-surface); color: var(--text-muted); border-radius: 10px; font-size: 11px; border: 1px solid var(--border); }
    .actions-cell { display: flex; gap: 4px; }
    .action-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface); cursor: pointer; color: var(--text-secondary); transition: all .2s; }
    .action-btn:hover { background: var(--bg-card); color: var(--accent); border-color: var(--accent); }
    .action-btn.danger:hover { color: #dc2626; border-color: #dc2626; }
    .action-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .loading-state { text-align: center; padding: 60px; color: var(--text-muted); }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--bg-card); border-radius: 12px; padding: 28px; max-width: 480px; width: 90%; border: 1px solid var(--border); }
    .modal h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 20px; color: var(--text-primary); }
    .modal p { color: var(--text-secondary); font-size: 14px; margin: 0 0 20px; }
    .form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
    .form-row label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
    .form-row input, .form-row textarea { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); color: var(--text-primary); font-size: 14px; font-family: inherit; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
    .btn-ghost { padding: 8px 18px; border: 1px solid var(--border); border-radius: 8px; background: none; cursor: pointer; color: var(--text-secondary); }
    .btn-danger { padding: 8px 18px; border-radius: 8px; background: #dc2626; border: none; color: #fff; cursor: pointer; font-weight: 600; }
  `]
})
export class AdminContentCategoriesComponent implements OnInit {
  private api = inject(ContentApiService);
  private fb = inject(FormBuilder);

  categories = signal<ContentCategory[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editTarget = signal<ContentCategory | null>(null);
  deleteTarget = signal<ContentCategory | null>(null);

  form = this.fb.group({
    nameEn: ['', Validators.required],
    nameAr: ['', Validators.required],
    slug: ['', Validators.required],
    description: [''],
    sortOrder: [0],
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.adminGetCategories().subscribe({ next: r => this.categories.set(r.data ?? []), complete: () => this.loading.set(false) });
  }

  openForm(cat: ContentCategory | null) {
    this.editTarget.set(cat);
    this.form.reset({ nameEn: cat?.nameEn ?? '', nameAr: cat?.nameAr ?? '', slug: cat?.slug ?? '', description: cat?.description ?? '', sortOrder: cat?.sortOrder ?? 0 });
    this.showForm.set(true);
  }

  submitForm() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.value as any;
    const call: Observable<unknown> = this.editTarget()
      ? this.api.updateCategory(this.editTarget()!.id, val)
      : this.api.createCategory(val);
    call.subscribe({ next: () => { this.showForm.set(false); this.load(); }, complete: () => this.saving.set(false) });
  }

  confirmDelete(cat: ContentCategory) { this.deleteTarget.set(cat); }
  doDelete() {
    this.api.deleteCategory(this.deleteTarget()!.id).subscribe(() => { this.deleteTarget.set(null); this.load(); });
  }
}
