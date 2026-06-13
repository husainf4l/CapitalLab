import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { A11yModule } from '@angular/cdk/a11y';
import { Observable } from 'rxjs';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { ContentEventSummary } from '../../../../core/models/content.models';

@Component({
  selector: 'app-admin-content-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, MatIconModule, A11yModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1>Events</h1>
          <p>Manage health fairs, workshops, and community events</p>
        </div>
        <button class="btn-primary" (click)="openForm(null)"><mat-icon>event</mat-icon> New Event</button>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading events...</div>
      } @else if (events().length === 0) {
        <div class="empty-state"><mat-icon>event_busy</mat-icon><p>No events yet.</p></div>
      } @else {
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (ev of events(); track ev.id) {
                <tr>
                  <td><strong>{{ ev.titleEn }}</strong></td>
                  <td>{{ ev.eventDate | date:'mediumDate' }}</td>
                  <td>{{ ev.location ?? '—' }}</td>
                  <td>
                    <span [class]="ev.isUpcoming ? 'badge-upcoming' : 'badge-past'">
                      {{ ev.isUpcoming ? 'Upcoming' : 'Past' }}
                    </span>
                  </td>
                  <td>
                    <span [class]="ev.isPublished ? 'status-badge published' : 'status-badge draft'">
                      {{ ev.isPublished ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td>
                    <div class="actions-cell">
                      <button class="action-btn" (click)="openForm(ev)" title="Edit"><mat-icon>edit</mat-icon></button>
                      <button class="action-btn" (click)="togglePublish(ev)" [title]="ev.isPublished ? 'Unpublish' : 'Publish'">
                        <mat-icon>{{ ev.isPublished ? 'unpublished' : 'publish' }}</mat-icon>
                      </button>
                      <button class="action-btn danger" (click)="confirmDelete(ev)" title="Delete"><mat-icon>delete</mat-icon></button>
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
          <div class="modal large" (click)="$event.stopPropagation()" (keydown.escape)="showForm.set(false)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="event-form-title">
            <h3 id="event-form-title">{{ editTarget() ? 'Edit Event' : 'New Event' }}</h3>
            <form [formGroup]="form" (ngSubmit)="submitForm()">
              <div class="form-grid">
                <div class="form-row"><label>Title (English) *</label><input formControlName="titleEn" /></div>
                <div class="form-row"><label>Title (Arabic) *</label><input formControlName="titleAr" dir="rtl" /></div>
                <div class="form-row"><label>Slug *</label><input formControlName="slug" /></div>
                <div class="form-row"><label>Location</label><input formControlName="location" /></div>
                <div class="form-row"><label>Start Date *</label><input type="datetime-local" formControlName="eventDate" /></div>
                <div class="form-row"><label>End Date</label><input type="datetime-local" formControlName="endDate" /></div>
                <div class="form-row full"><label>Description (English)</label><textarea formControlName="descriptionEn" rows="3"></textarea></div>
                <div class="form-row full"><label>Description (Arabic)</label><textarea formControlName="descriptionAr" rows="3" dir="rtl"></textarea></div>
                <div class="form-row"><label>Cover Image URL</label><input formControlName="coverImageUrl" /></div>
                <div class="form-row"><label>Registration URL</label><input formControlName="registrationUrl" /></div>
                <div class="form-row"><label>Meta Title</label><input formControlName="metaTitle" /></div>
                <div class="form-row"><label>Meta Description</label><input formControlName="metaDescription" /></div>
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
          <div class="modal" (click)="$event.stopPropagation()" (keydown.escape)="deleteTarget.set(null)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="event-del-title">
            <h3 id="event-del-title">Delete Event?</h3>
            <p>Delete <strong>{{ deleteTarget()!.titleEn }}</strong>? This cannot be undone.</p>
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
    .badge-upcoming { padding: 3px 9px; background: #dcfce7; color: #166534; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .badge-past { padding: 3px 9px; background: var(--bg-surface); color: var(--text-muted); border-radius: 10px; font-size: 11px; border: 1px solid var(--border); }
    .status-badge.published { padding: 3px 9px; background: #d1fae5; color: #065f46; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .status-badge.draft { padding: 3px 9px; background: var(--bg-surface); color: var(--text-muted); border-radius: 10px; font-size: 11px; border: 1px solid var(--border); }
    .actions-cell { display: flex; gap: 4px; }
    .action-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface); cursor: pointer; color: var(--text-secondary); transition: all .2s; }
    .action-btn:hover { background: var(--bg-card); color: var(--accent); border-color: var(--accent); }
    .action-btn.danger:hover { color: #dc2626; border-color: #dc2626; }
    .action-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .loading-state, .empty-state { text-align: center; padding: 60px; color: var(--text-muted); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 20, 25, .58); display: flex; align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px; backdrop-filter: none; -webkit-backdrop-filter: none; }
    .modal { background: #fff; border-radius: 12px; padding: 28px; max-width: 420px; width: min(90vw, 420px); border: 1px solid #d8e2e8; box-shadow: 0 20px 60px rgba(15, 20, 25, .28); color: #0f1419; filter: none; opacity: 1; }
    .modal.large { max-width: 760px; width: min(92vw, 760px); max-height: calc(100vh - 48px); overflow-y: auto; }
    .modal h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 20px; color: #0f1419; }
    .modal p { color: #4b5563; font-size: 14px; margin: 0 0 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    .form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
    .form-row.full { grid-column: 1 / -1; }
    .form-row label { font-size: 13px; font-weight: 600; color: #253341; }
    .form-row input, .form-row textarea { padding: 10px 12px; border: 1px solid #cfdbe3; border-radius: 8px; background: #fff; color: #0f1419; font-size: 14px; font-family: inherit; line-height: 1.45; outline: none; box-shadow: none; filter: none; opacity: 1; }
    .form-row input:focus, .form-row textarea:focus { border-color: #1e9df1; box-shadow: 0 0 0 3px rgba(30, 157, 241, .14); }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
    .btn-ghost { padding: 8px 18px; border: 1px solid #cfdbe3; border-radius: 8px; background: #fff; cursor: pointer; color: #253341; }
    .btn-danger { padding: 8px 18px; border-radius: 8px; background: #dc2626; border: none; color: #fff; cursor: pointer; font-weight: 600; }
  `]
})
export class AdminContentEventsComponent implements OnInit {
  private api = inject(ContentApiService);
  private fb = inject(FormBuilder);

  events = signal<ContentEventSummary[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editTarget = signal<ContentEventSummary | null>(null);
  deleteTarget = signal<ContentEventSummary | null>(null);

  form = this.fb.group({
    titleEn: ['', Validators.required],
    titleAr: ['', Validators.required],
    slug: ['', Validators.required],
    descriptionEn: [''],
    descriptionAr: [''],
    eventDate: ['', Validators.required],
    endDate: [''],
    location: [''],
    coverImageUrl: [''],
    registrationUrl: [''],
    metaTitle: [''],
    metaDescription: [''],
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.adminGetEvents({ pageSize: 50 }).subscribe({ next: r => this.events.set(r.data?.items ?? []), complete: () => this.loading.set(false) });
  }

  openForm(ev: ContentEventSummary | null) {
    this.editTarget.set(ev);
    if (ev) {
      this.form.patchValue({ ...ev, eventDate: ev.eventDate?.substring(0, 16) ?? '', endDate: ev.endDate?.substring(0, 16) ?? '' });
    } else {
      this.form.reset();
    }
    this.showForm.set(true);
  }

  submitForm() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.value as any;
    const req = { ...val, endDate: val.endDate || undefined };
    const call: Observable<unknown> = this.editTarget()
      ? this.api.updateEvent(this.editTarget()!.id, req)
      : this.api.createEvent(req);
    call.subscribe({ next: () => { this.showForm.set(false); this.load(); }, complete: () => this.saving.set(false) });
  }

  togglePublish(ev: ContentEventSummary) {
    const call = ev.isPublished ? this.api.unpublishEvent(ev.id) : this.api.publishEvent(ev.id);
    call.subscribe(() => this.load());
  }

  confirmDelete(ev: ContentEventSummary) { this.deleteTarget.set(ev); }
  doDelete() {
    this.api.deleteEvent(this.deleteTarget()!.id).subscribe(() => { this.deleteTarget.set(null); this.load(); });
  }
}
