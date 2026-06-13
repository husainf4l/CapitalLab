import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state/app-empty-state.component';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { DoctorNotesStore } from '../stores/doctor-notes.store';
import { DoctorNoteCardComponent } from '../shared/doctor-note-card.component';
import { NoteType, NOTE_TYPE_LABELS } from '../../../core/models/doctor-note.models';
import { DoctorNote } from '../../../core/models/doctor-note.models';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-doctor-notes',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatInputModule, DoctorNoteCardComponent, AppEmptyStateComponent, A11yModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Medical Notes</h2>
          <p class="sub">{{ store.notes().length }} notes</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreate()">
          <mat-icon>add</mat-icon> Add Note
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select [ngModel]="store.filterType()" (ngModelChange)="store.filterType.set($event); store.load()">
            <mat-option value="">All Types</mat-option>
            @for (t of noteTypes; track t.value) {
              <mat-option [value]="t.value">{{ t.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="flex-field">
          <mat-label>Filter by Patient ID</mat-label>
          <input matInput [ngModel]="store.filterPatientId()" (ngModelChange)="store.filterPatientId.set($event)" (keydown.enter)="store.load()" placeholder="Patient ID" />
        </mat-form-field>
      </div>

      <!-- Form modal -->
      @if (showForm()) {
        <div class="modal-backdrop" (click)="closeForm()">
          <div class="modal-card" (click)="$event.stopPropagation()" (keydown.escape)="closeForm()" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="notes-form-title">
            <h3 id="notes-form-title">{{ store.editingNote() ? 'Edit Note' : 'New Medical Note' }}</h3>

            @if (!store.editingNote()) {
              <mat-form-field appearance="outline" class="full">
                <mat-label>Patient ID</mat-label>
                <input matInput [ngModel]="store.formPatientId()" (ngModelChange)="store.formPatientId.set($event)" placeholder="Enter patient ID" />
              </mat-form-field>
            }

            <mat-form-field appearance="outline" class="full">
              <mat-label>Note Type</mat-label>
              <mat-select [ngModel]="store.formType()" (ngModelChange)="store.formType.set($event)">
                @for (t of noteTypes; track t.value) {
                  <mat-option [value]="t.value">{{ t.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Note Content</mat-label>
              <textarea matInput [ngModel]="store.formContent()" (ngModelChange)="store.formContent.set($event)" rows="5" placeholder="Write the medical note..."></textarea>
            </mat-form-field>

            <div class="modal-actions">
              <button mat-stroked-button (click)="closeForm()">Cancel</button>
              <button mat-raised-button color="primary" [disabled]="!canSave() || store.isSaving()" (click)="save()">
                @if (store.isSaving()) {
                  <ng-container><mat-icon class="spin">refresh</mat-icon> Saving...</ng-container>
                } @else {
                  <ng-container><mat-icon>save</mat-icon> Save Note</ng-container>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Notes list -->
      @if (store.isLoading()) {
        <div class="notes-grid">
          @for (i of [1,2,3,4]; track i) { <div class="skel-card"></div> }
        </div>
      } @else if (store.notes().length === 0) {
        <app-empty-state icon="sticky_note_2" title="No notes yet" description="Clinical notes you add for patients will appear here.">
          <button mat-stroked-button (click)="openCreate()"><mat-icon>add</mat-icon> Add First Note</button>
        </app-empty-state>
      } @else {
        <div class="notes-grid">
          @for (note of store.notes(); track note.id) {
            <doctor-note-card [note]="note" (edit)="openEdit($event)" (delete)="remove($event)" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    $accent: #4f46e5;

    .page { max-width: 1000px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
      h2 { margin: 0 0 4px; } .sub { margin: 0; font-size: 0.875rem; color: $text-secondary; }
    }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
      mat-form-field { min-width: 150px; } .flex-field { flex: 1; min-width: 200px; }
    }

    .notes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;
      @media (max-width: 700px) { grid-template-columns: 1fr; }
    }
    .skel-card { height: 120px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 56px 0; color: $text-secondary;
      mat-icon { font-size: 48px; opacity: 0.3; margin-bottom: 10px; }
      p { margin: 0 0 14px; }
    }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal-card { background: white; border-radius: $border-radius-lg; padding: 28px; width: 480px; max-width: 100%; max-height: 90vh; overflow-y: auto;
      h3 { margin: 0 0 18px; }
    }
    .full { width: 100%; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class DoctorNotesComponent implements OnInit {
  store = inject(DoctorNotesStore);
  showForm = signal(false);

  noteTypes: { value: NoteType; label: string }[] = (Object.keys(NOTE_TYPE_LABELS) as NoteType[])
    .map(k => ({ value: k, label: NOTE_TYPE_LABELS[k] }));

  ngOnInit(): void { this.store.load(); }

  openCreate(): void { this.store.startCreate(); this.showForm.set(true); }
  openEdit(note: DoctorNote): void { this.store.startEdit(note); this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); this.store.editingNote.set(null); }

  canSave(): boolean {
    const hasContent = this.store.formContent().trim().length > 0;
    const hasPatient = this.store.editingNote() ? true : this.store.formPatientId().trim().length > 0;
    return hasContent && hasPatient;
  }

  async save(): Promise<void> {
    const ok = await this.store.save();
    if (ok) this.showForm.set(false);
  }

  async remove(id: string): Promise<void> {
    await this.store.delete(id);
  }
}
