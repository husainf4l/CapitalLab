import { Injectable, inject, signal, computed } from '@angular/core';
import { FollowUpsApiService } from '../../../core/api/follow-ups-api.service';
import { FollowUp, FollowUpStatus, CreateFollowUpRequest } from '../../../core/models/follow-up.models';

@Injectable({ providedIn: 'root' })
export class FollowUpsStore {
  private api = inject(FollowUpsApiService);

  readonly followUps = signal<FollowUp[]>([]);
  readonly isLoading = signal(false);
  readonly isActing = signal('');
  readonly filterStatus = signal<FollowUpStatus | ''>('');

  // Create form
  readonly showForm = signal(false);
  readonly formPatientId = signal('');
  readonly formReason = signal('');
  readonly formDate = signal('');
  readonly formNotes = signal('');
  readonly isSaving = signal(false);

  readonly pending = computed(() => this.followUps().filter(f => f.status === 'pending'));
  readonly scheduled = computed(() => this.followUps().filter(f => f.status === 'scheduled'));
  readonly completed = computed(() => this.followUps().filter(f => f.status === 'completed'));

  readonly filtered = computed(() => {
    const s = this.filterStatus();
    if (!s) return this.followUps();
    return this.followUps().filter(f => f.status === s);
  });

  load(patientId?: string): void {
    this.isLoading.set(true);
    this.api.getAll({
      status: this.filterStatus() || undefined,
      patientId,
    }).subscribe({
      next: res => { this.followUps.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  create(): Promise<boolean> {
    this.isSaving.set(true);
    const req: CreateFollowUpRequest = {
      patientId: this.formPatientId(),
      reason: this.formReason(),
      scheduledDate: this.formDate(),
      notes: this.formNotes() || undefined,
    };
    return new Promise(resolve => {
      this.api.create(req).subscribe({
        next: res => {
          if (res.data) this.followUps.update(list => [res.data!, ...list]);
          this.showForm.set(false);
          this.isSaving.set(false);
          resolve(true);
        },
        error: () => { this.isSaving.set(false); resolve(false); },
      });
    });
  }

  complete(id: string, notes?: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.complete(id, notes).subscribe({
        next: res => {
          if (res.data) this.followUps.update(list => list.map(f => f.id === id ? res.data! : f));
          this.isActing.set('');
          resolve(true);
        },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  cancel(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.cancel(id).subscribe({
        next: () => {
          this.followUps.update(list => list.map(f => f.id === id ? { ...f, status: 'cancelled' as FollowUpStatus } : f));
          this.isActing.set('');
          resolve(true);
        },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }
}
