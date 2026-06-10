import { Injectable, inject, signal } from '@angular/core';
import { PatientApiService } from '../../../core/api/patient-api.service';
import { FamilyMember } from '../../../core/models/patient.models';

@Injectable({ providedIn: 'root' })
export class FamilyMembersStore {
  private patientApi = inject(PatientApiService);

  readonly members = signal<FamilyMember[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  load(): void {
    this.isLoading.set(true);
    this.patientApi.getFamilyMembers().subscribe({
      next: res => {
        this.members.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  add(member: Partial<FamilyMember>): Promise<FamilyMember | null> {
    this.isSaving.set(true);
    return new Promise(resolve => {
      this.patientApi.addFamilyMember(member).subscribe({
        next: res => {
          if (res.success && res.data) {
            this.members.update(list => [...list, res.data!]);
          }
          this.isSaving.set(false);
          resolve(res.data ?? null);
        },
        error: () => { this.isSaving.set(false); resolve(null); },
      });
    });
  }

  update(id: string, member: Partial<FamilyMember>): Promise<boolean> {
    this.isSaving.set(true);
    return new Promise(resolve => {
      this.patientApi.updateFamilyMember(id, member).subscribe({
        next: res => {
          if (res.success && res.data) {
            this.members.update(list => list.map(m => m.id === id ? res.data! : m));
          }
          this.isSaving.set(false);
          resolve(res.success);
        },
        error: () => { this.isSaving.set(false); resolve(false); },
      });
    });
  }

  remove(id: string): Promise<boolean> {
    return new Promise(resolve => {
      this.patientApi.deleteFamilyMember(id).subscribe({
        next: () => {
          this.members.update(list => list.filter(m => m.id !== id));
          resolve(true);
        },
        error: () => resolve(false),
      });
    });
  }
}
