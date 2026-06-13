import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { ContentAuthor } from '../../../../core/models/content.models';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-admin-content-authors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, A11yModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1>Authors</h1>
          <p>Manage content authors and contributors</p>
        </div>
        <button class="btn-primary" (click)="openForm(null)"><mat-icon>person_add</mat-icon> New Author</button>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading authors...</div>
      } @else if (authors().length === 0) {
        <div class="empty-state">
          <mat-icon>person_outline</mat-icon>
          <p>No authors yet. Add your first author.</p>
        </div>
      } @else {
        <div class="authors-grid">
          @for (author of authors(); track author.id) {
            <div class="author-card">
              <div class="author-header">
                @if (author.imageUrl) {
                  <img [src]="author.imageUrl" [alt]="author.fullName" class="author-avatar" />
                } @else {
                  <div class="author-initial">{{ author.fullName.charAt(0) }}</div>
                }
                <div>
                  <h3>{{ author.fullName }}</h3>
                  @if (author.jobTitle) { <p class="author-title">{{ author.jobTitle }}</p> }
                  <span [class]="author.isActive ? 'badge-active' : 'badge-inactive'">{{ author.isActive ? 'Active' : 'Inactive' }}</span>
                </div>
              </div>
              @if (author.bio) { <p class="author-bio">{{ author.bio }}</p> }
              <div class="author-footer">
                <span class="post-count">{{ author.postCount }} posts</span>
                <div class="actions">
                  <button class="action-btn" (click)="openForm(author)"><mat-icon>edit</mat-icon></button>
                  <button class="action-btn danger" (click)="confirmDelete(author)"><mat-icon>delete</mat-icon></button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (showForm()) {
        <div class="modal-backdrop" (click)="showForm.set(false)">
          <div class="modal" (click)="$event.stopPropagation()" (keydown.escape)="showForm.set(false)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="author-form-title">
            <h3 id="author-form-title">{{ editTarget() ? 'Edit Author' : 'New Author' }}</h3>
            <form [formGroup]="form" (ngSubmit)="submitForm()">
              <div class="form-row"><label>Full Name *</label><input formControlName="fullName" /></div>
              <div class="form-row"><label>Job Title</label><input formControlName="jobTitle" placeholder="e.g. Senior Lab Specialist" /></div>
              <div class="form-row"><label>Bio</label><textarea formControlName="bio" rows="3"></textarea></div>
              <div class="form-row"><label>Profile Image URL</label><input formControlName="imageUrl" placeholder="https://..." /></div>
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
          <div class="modal" (click)="$event.stopPropagation()" (keydown.escape)="deleteTarget.set(null)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="author-del-title">
            <h3 id="author-del-title">Delete Author?</h3>
            <p>Delete <strong>{{ deleteTarget()!.fullName }}</strong>? Their posts will remain but will be unlinked.</p>
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
    .authors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .author-card { background: var(--bg-card); border-radius: 12px; padding: 20px; border: 1px solid var(--border); }
    .author-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
    .author-avatar, .author-initial { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
    .author-initial { background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; }
    .author-header h3 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 3px; }
    .author-title { font-size: 13px; color: var(--text-muted); margin: 0 0 6px; }
    .badge-active { padding: 3px 9px; background: #d1fae5; color: #065f46; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .badge-inactive { padding: 3px 9px; background: var(--bg-surface); color: var(--text-muted); border-radius: 10px; font-size: 11px; border: 1px solid var(--border); }
    .author-bio { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .author-footer { display: flex; justify-content: space-between; align-items: center; }
    .post-count { font-size: 12px; color: var(--text-muted); }
    .actions { display: flex; gap: 4px; }
    .action-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface); cursor: pointer; color: var(--text-secondary); transition: all .2s; }
    .action-btn:hover { background: var(--bg-card); color: var(--accent); border-color: var(--accent); }
    .action-btn.danger:hover { color: #dc2626; border-color: #dc2626; }
    .action-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .loading-state, .empty-state { text-align: center; padding: 60px; color: var(--text-muted); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
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
export class AdminContentAuthorsComponent implements OnInit {
  private api = inject(ContentApiService);
  private fb = inject(FormBuilder);

  authors = signal<ContentAuthor[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editTarget = signal<ContentAuthor | null>(null);
  deleteTarget = signal<ContentAuthor | null>(null);

  form = this.fb.group({
    fullName: ['', Validators.required],
    jobTitle: [''],
    bio: [''],
    imageUrl: [''],
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.adminGetAuthors().subscribe({ next: r => this.authors.set(r.data ?? []), complete: () => this.loading.set(false) });
  }

  openForm(author: ContentAuthor | null) {
    this.editTarget.set(author);
    this.form.reset({ fullName: author?.fullName ?? '', jobTitle: author?.jobTitle ?? '', bio: author?.bio ?? '', imageUrl: author?.imageUrl ?? '' });
    this.showForm.set(true);
  }

  submitForm() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.value as any;
    const call: Observable<unknown> = this.editTarget()
      ? this.api.updateAuthor(this.editTarget()!.id, val)
      : this.api.createAuthor(val);
    call.subscribe({ next: () => { this.showForm.set(false); this.load(); }, complete: () => this.saving.set(false) });
  }

  confirmDelete(a: ContentAuthor) { this.deleteTarget.set(a); }
  doDelete() {
    this.api.deleteAuthor(this.deleteTarget()!.id).subscribe(() => { this.deleteTarget.set(null); this.load(); });
  }
}
