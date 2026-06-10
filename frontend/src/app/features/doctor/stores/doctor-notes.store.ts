import { Injectable, inject, signal } from '@angular/core';
import { DoctorNotesApiService } from '../../../core/api/doctor-notes-api.service';
import { DoctorNote, CreateDoctorNoteRequest, NoteType } from '../../../core/models/doctor-note.models';

@Injectable({ providedIn: 'root' })
export class DoctorNotesStore {
  private api = inject(DoctorNotesApiService);

  readonly notes = signal<DoctorNote[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly editingNote = signal<DoctorNote | null>(null);
  readonly filterType = signal<NoteType | ''>('');
  readonly filterPatientId = signal('');

  // Form state
  readonly formPatientId = signal('');
  readonly formType = signal<NoteType>('general');
  readonly formContent = signal('');

  load(patientId?: string): void {
    this.isLoading.set(true);
    if (patientId) this.filterPatientId.set(patientId);
    this.api.getAll({
      patientId: this.filterPatientId() || undefined,
      type: this.filterType() || undefined,
    }).subscribe({
      next: res => { this.notes.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  startEdit(note: DoctorNote): void {
    this.editingNote.set(note);
    this.formType.set(note.type);
    this.formContent.set(note.content);
  }

  startCreate(patientId?: string): void {
    this.editingNote.set(null);
    this.formPatientId.set(patientId ?? '');
    this.formType.set('general');
    this.formContent.set('');
  }

  save(): Promise<boolean> {
    this.isSaving.set(true);
    const editing = this.editingNote();
    if (editing) {
      return new Promise(resolve => {
        this.api.update(editing.id, { type: this.formType(), content: this.formContent() }).subscribe({
          next: res => {
            if (res.data) this.notes.update(list => list.map(n => n.id === editing.id ? res.data! : n));
            this.editingNote.set(null);
            this.isSaving.set(false);
            resolve(true);
          },
          error: () => { this.isSaving.set(false); resolve(false); },
        });
      });
    } else {
      const req: CreateDoctorNoteRequest = {
        patientId: this.formPatientId(),
        type: this.formType(),
        content: this.formContent(),
      };
      return new Promise(resolve => {
        this.api.create(req).subscribe({
          next: res => {
            if (res.data) this.notes.update(list => [res.data!, ...list]);
            this.formContent.set('');
            this.isSaving.set(false);
            resolve(true);
          },
          error: () => { this.isSaving.set(false); resolve(false); },
        });
      });
    }
  }

  delete(id: string): Promise<boolean> {
    return new Promise(resolve => {
      this.api.delete(id).subscribe({
        next: () => { this.notes.update(list => list.filter(n => n.id !== id)); resolve(true); },
        error: () => resolve(false),
      });
    });
  }
}
