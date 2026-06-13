import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { ContentFaqItem, CreateFaqItemRequest } from '../../../../core/models/content.models';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-admin-content-faq',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, A11yModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1>FAQ Management</h1>
          <p>Manage frequently asked questions shown on the public site</p>
        </div>
        <button class="btn-primary" (click)="openForm(null)">
          <mat-icon>add</mat-icon> New FAQ
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-icon class="spin">autorenew</mat-icon>
          <span>Loading FAQ items...</span>
        </div>
      } @else if (items().length === 0) {
        <div class="empty-state">
          <mat-icon>quiz</mat-icon>
          <p>No FAQ items yet. Add your first question.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="col-q">Question (EN)</th>
                <th class="col-cat">Category</th>
                <th class="col-order">Order</th>
                <th class="col-active">Active</th>
                <th class="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item.id) {
                <tr [class.inactive-row]="!item.isActive">
                  <td class="col-q">
                    <span class="question-text">{{ item.questionEn }}</span>
                  </td>
                  <td class="col-cat">
                    @if (item.category) {
                      <span class="cat-badge">{{ item.category }}</span>
                    } @else {
                      <span class="no-cat">—</span>
                    }
                  </td>
                  <td class="col-order">
                    <span class="order-num">{{ item.sortOrder }}</span>
                  </td>
                  <td class="col-active">
                    <button
                      class="toggle-btn"
                      [class.on]="item.isActive"
                      (click)="toggleItem(item)"
                      [title]="item.isActive ? 'Deactivate' : 'Activate'"
                    >
                      <span class="toggle-track">
                        <span class="toggle-thumb"></span>
                      </span>
                    </button>
                  </td>
                  <td class="col-actions">
                    <div class="actions">
                      <button class="action-btn" (click)="openForm(item)" title="Edit">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button class="action-btn danger" (click)="confirmDelete(item)" title="Delete">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Create / Edit modal -->
      @if (showForm()) {
        <div class="modal-backdrop" (click)="closeForm()">
          <div class="modal modal-wide" (click)="$event.stopPropagation()" (keydown.escape)="closeForm()" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="faq-form-title">
            <div class="modal-header">
              <h3 id="faq-form-title">{{ editTarget() ? 'Edit FAQ Item' : 'New FAQ Item' }}</h3>
              <button class="close-btn" (click)="closeForm()"><mat-icon>close</mat-icon></button>
            </div>
            <form [formGroup]="form" (ngSubmit)="submitForm()">
              <div class="form-grid">
                <div class="form-row full">
                  <label>Question (English) *</label>
                  <input formControlName="questionEn" placeholder="e.g. How do I book a test?" />
                </div>
                <div class="form-row full">
                  <label>Question (Arabic) *</label>
                  <input formControlName="questionAr" placeholder="السؤال بالعربية" dir="rtl" />
                </div>
                <div class="form-row full">
                  <label>Answer (English) *</label>
                  <textarea formControlName="answerEn" rows="4" placeholder="Provide a clear, concise answer..."></textarea>
                </div>
                <div class="form-row full">
                  <label>Answer (Arabic) *</label>
                  <textarea formControlName="answerAr" rows="4" placeholder="الإجابة بالعربية..." dir="rtl"></textarea>
                </div>
                <div class="form-row">
                  <label>Category</label>
                  <input formControlName="category" placeholder="e.g. Booking, Results..." />
                </div>
                <div class="form-row">
                  <label>Sort Order</label>
                  <input type="number" formControlName="sortOrder" min="0" />
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-ghost" (click)="closeForm()">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
                  {{ saving() ? 'Saving...' : (editTarget() ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete confirmation modal -->
      @if (deleteTarget()) {
        <div class="modal-backdrop" (click)="deleteTarget.set(null)">
          <div class="modal" (click)="$event.stopPropagation()" (keydown.escape)="deleteTarget.set(null)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="faq-del-title">
            <div class="modal-icon">
              <mat-icon>warning</mat-icon>
            </div>
            <h3 id="faq-del-title">Delete FAQ Item?</h3>
            <p>Remove "<strong>{{ deleteTarget()!.questionEn }}</strong>"? This cannot be undone.</p>
            <div class="modal-actions">
              <button class="btn-ghost" (click)="deleteTarget.set(null)">Cancel</button>
              <button class="btn-danger" (click)="doDelete()" [disabled]="deleting()">
                {{ deleting() ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../../styles/variables' as *;

    .page-wrapper { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; color: var(--text-primary); }
    .page-header p { color: var(--text-muted); font-size: 14px; margin: 0; }
    .btn-primary { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--accent, #7b1fa2); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: opacity .2s; }
    .btn-primary:hover:not(:disabled) { opacity: .9; }
    .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
    .btn-primary mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Loading / empty */
    .loading-state { display: flex; align-items: center; gap: 10px; padding: 60px; color: var(--text-muted); justify-content: center; font-size: 15px; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 60px; color: var(--text-muted); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; color: var(--text-muted); }
    .empty-state p { font-size: 15px; margin: 0; }

    /* Table */
    .table-wrap { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    thead th { padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); background: var(--bg-surface); text-align: left; border-bottom: 1px solid var(--border); }
    tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: var(--bg-surface); }
    tbody tr.inactive-row { opacity: .6; }
    tbody td { padding: 14px 16px; font-size: 14px; color: var(--text-secondary); vertical-align: middle; }
    .col-q { width: 50%; }
    .col-cat { width: 15%; }
    .col-order { width: 10%; text-align: center; }
    .col-active { width: 10%; text-align: center; }
    .col-actions { width: 10%; text-align: right; }
    .question-text { font-weight: 500; color: var(--text-primary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .cat-badge { padding: 3px 10px; background: #f3e5f5; color: #7b1fa2; border-radius: 10px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .no-cat { color: var(--text-muted); }
    .order-num { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: var(--bg-surface); border: 1px solid var(--border); font-size: 12px; font-weight: 600; color: var(--text-muted); }

    /* Toggle */
    .toggle-btn { background: none; border: none; cursor: pointer; padding: 0; display: inline-flex; }
    .toggle-track { display: block; width: 36px; height: 20px; border-radius: 10px; background: var(--border); position: relative; transition: background .25s; }
    .toggle-btn.on .toggle-track { background: #7b1fa2; }
    .toggle-thumb { display: block; width: 16px; height: 16px; border-radius: 50%; background: white; position: absolute; top: 2px; left: 2px; transition: left .25s; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
    .toggle-btn.on .toggle-thumb { left: 18px; }

    /* Action buttons */
    .actions { display: flex; gap: 4px; justify-content: flex-end; }
    .action-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface); cursor: pointer; color: var(--text-muted); transition: all .2s; }
    .action-btn:hover { color: var(--accent, #7b1fa2); border-color: var(--accent, #7b1fa2); background: var(--bg-card); }
    .action-btn.danger:hover { color: #dc2626; border-color: #dc2626; background: #fee2e2; }
    .action-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
    .modal { background: var(--bg-card); border-radius: 16px; padding: 28px; max-width: 440px; width: 100%; border: 1px solid var(--border); }
    .modal-wide { max-width: 680px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; color: var(--text-primary); }
    .close-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; padding: 4px; border-radius: 6px; }
    .close-btn:hover { background: var(--bg-surface); color: var(--text-primary); }
    .modal-icon { width: 52px; height: 52px; border-radius: 50%; background: #fee2e2; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .modal-icon mat-icon { color: #dc2626; font-size: 26px; width: 26px; height: 26px; }
    .modal h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 10px; color: var(--text-primary); text-align: center; }
    .modal p { color: var(--text-secondary); font-size: 14px; margin: 0 0 24px; line-height: 1.6; text-align: center; }

    /* Form */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
    .form-row { display: flex; flex-direction: column; gap: 6px; }
    .form-row.full { grid-column: 1 / -1; }
    .form-row label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .04em; }
    .form-row input, .form-row textarea { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); color: var(--text-primary); font-size: 14px; font-family: inherit; resize: vertical; transition: border-color .2s; }
    .form-row input:focus, .form-row textarea:focus { outline: none; border-color: #7b1fa2; }

    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-ghost { padding: 9px 22px; border: 1px solid var(--border); border-radius: 8px; background: none; cursor: pointer; color: var(--text-secondary); font-size: 14px; }
    .btn-danger { padding: 9px 22px; border-radius: 8px; background: #dc2626; border: none; color: #fff; cursor: pointer; font-weight: 600; font-size: 14px; }
    .btn-danger:disabled { opacity: .6; cursor: not-allowed; }
  `]
})
export class AdminContentFaqComponent implements OnInit {
  private api = inject(ContentApiService);
  private fb = inject(FormBuilder);

  items = signal<ContentFaqItem[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  deleting = signal(false);
  editTarget = signal<ContentFaqItem | null>(null);
  deleteTarget = signal<ContentFaqItem | null>(null);

  form = this.fb.group({
    questionEn: ['', Validators.required],
    questionAr: ['', Validators.required],
    answerEn: ['', Validators.required],
    answerAr: ['', Validators.required],
    category: [''],
    sortOrder: [0],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.adminGetFaq().subscribe({
      next: r => this.items.set(r.data ?? []),
      complete: () => this.loading.set(false),
    });
  }

  openForm(item: ContentFaqItem | null): void {
    this.editTarget.set(item);
    this.form.reset({
      questionEn: item?.questionEn ?? '',
      questionAr: item?.questionAr ?? '',
      answerEn: item?.answerEn ?? '',
      answerAr: item?.answerAr ?? '',
      category: item?.category ?? '',
      sortOrder: item?.sortOrder ?? 0,
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editTarget.set(null);
  }

  submitForm(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.value as CreateFaqItemRequest;
    const target = this.editTarget();
    const call: Observable<unknown> = target
      ? this.api.updateFaqItem(target.id, val)
      : this.api.createFaqItem(val);
    call.subscribe({
      next: () => { this.closeForm(); this.load(); },
      error: () => this.saving.set(false),
      complete: () => this.saving.set(false),
    });
  }

  toggleItem(item: ContentFaqItem): void {
    this.api.toggleFaqItem(item.id, !item.isActive).subscribe({
      next: () => {
        this.items.update(list =>
          list.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i)
        );
      },
    });
  }

  confirmDelete(item: ContentFaqItem): void {
    this.deleteTarget.set(item);
  }

  doDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.api.deleteFaqItem(target.id).subscribe({
      next: () => {
        this.items.update(list => list.filter(i => i.id !== target.id));
        this.deleteTarget.set(null);
        this.deleting.set(false);
      },
      error: () => this.deleting.set(false),
    });
  }
}
