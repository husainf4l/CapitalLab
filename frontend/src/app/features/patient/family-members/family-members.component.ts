import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FamilyMember } from '../../../core/models/patient.models';
import { AppPageHeaderComponent } from '../../../shared/ui/app-page-header/app-page-header.component';
import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state/app-empty-state.component';
import { FamilyMembersStore } from '../stores/family-members.store';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-family-members',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatIconModule, CommonModule,
    AppPageHeaderComponent, AppEmptyStateComponent,
  ],
  template: `
    <div class="family-page">
      <app-page-header title="Family Members" subtitle="Manage family member profiles and view their results">
        <button mat-flat-button color="primary" (click)="openAdd()">
          <mat-icon>person_add</mat-icon> Add Member
        </button>
      </app-page-header>

      @if (store.members().length === 0 && !store.isLoading()) {
        <app-empty-state
          icon="group"
          title="No family members yet"
          description="Add family members to book tests and view results on their behalf."
        >
          <button mat-flat-button color="primary" (click)="openAdd()">Add First Member</button>
        </app-empty-state>
      } @else {
        <div class="members-grid">
          @for (member of store.members(); track member.id) {
            <div class="member-card">
              <div class="member-avatar" [class]="'gender-' + member.gender">
                {{ member.firstName.charAt(0) }}
              </div>
              <div class="member-info">
                <h5>{{ member.fullName }}</h5>
                <p>{{ member.relationship | titlecase }} · {{ member.gender | titlecase }}</p>
                <p>{{ member.dateOfBirth | date:'mediumDate' }}</p>
              </div>
              <div class="member-actions">
                <button mat-stroked-button (click)="openEdit(member)">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-stroked-button routerLink="/patient/results">
                  <mat-icon>science</mat-icon> Results
                </button>
                <button mat-icon-button color="warn" (click)="deleteMember(member)" title="Remove">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Add / Edit modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h4>{{ editingMember() ? 'Edit Member' : 'Add Family Member' }}</h4>
              <button mat-icon-button (click)="closeModal()"><mat-icon>close</mat-icon></button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="add-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" />
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Date of Birth</mat-label>
                  <input matInput type="date" formControlName="dateOfBirth" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Gender</mat-label>
                  <mat-select formControlName="gender">
                    <mat-option value="male">Male</mat-option>
                    <mat-option value="female">Female</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Relationship</mat-label>
                  <mat-select formControlName="relationship">
                    @for (rel of relationships; track rel.value) {
                      <mat-option [value]="rel.value">{{ rel.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>National ID (optional)</mat-label>
                  <input matInput formControlName="nationalId" />
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="closeModal()">Cancel</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || store.isSaving()">
                  {{ store.isSaving() ? 'Saving…' : (editingMember() ? 'Save Changes' : 'Add Member') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .members-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
      @media (max-width: 992px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 576px) { grid-template-columns: 1fr; }
    }
    .member-card {
      background: white; border-radius: $border-radius; padding: 20px;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
    }
    .member-avatar {
      width: 60px; height: 60px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 700; color: white;
      &.gender-male { background: $primary; }
      &.gender-female { background: #e91e63; }
    }
    .member-info h5 { margin: 0 0 4px; }
    .member-info p { margin: 0 0 2px; font-size: 0.8rem; color: $text-secondary; }
    .member-actions { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; justify-content: center; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal-card { background: white; border-radius: $border-radius-lg; padding: 28px; width: 100%; max-width: 560px; box-shadow: $shadow-lg; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h4 { margin: 0; } }
    .add-form { display: flex; flex-direction: column; gap: 4px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; @media (max-width: 480px) { grid-template-columns: 1fr; } }
    mat-form-field { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
  `]
})
export class FamilyMembersComponent implements OnInit {
  store = inject(FamilyMembersStore);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  showModal = signal(false);
  editingMember = signal<FamilyMember | null>(null);

  relationships = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'other', label: 'Other' },
  ];

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    gender: ['', Validators.required],
    relationship: ['', Validators.required],
    nationalId: [''],
  });

  ngOnInit(): void {
    this.store.load();
  }

  openAdd(): void {
    this.editingMember.set(null);
    this.form.reset();
    this.showModal.set(true);
  }

  openEdit(member: FamilyMember): void {
    this.editingMember.set(member);
    this.form.patchValue({
      firstName: member.firstName,
      lastName: member.lastName,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      relationship: member.relationship,
      nationalId: member.nationalId ?? '',
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingMember.set(null);
    this.form.reset();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    const { firstName, lastName, dateOfBirth, gender, relationship, nationalId } = this.form.value;
    const data: Partial<FamilyMember> = {
      firstName: firstName!,
      lastName: lastName!,
      fullName: `${firstName} ${lastName}`,
      dateOfBirth: dateOfBirth!,
      gender: gender as 'male' | 'female',
      relationship: relationship!,
      nationalId: nationalId ?? undefined,
    };

    const editing = this.editingMember();
    if (editing) {
      const ok = await this.store.update(editing.id, data);
      if (ok) { this.toast.success('Member updated.'); this.closeModal(); }
      else this.toast.error('Failed to update member.');
    } else {
      const result = await this.store.add(data);
      if (result) { this.toast.success('Family member added!'); this.closeModal(); }
      else this.toast.error('Failed to add member.');
    }
  }

  async deleteMember(member: FamilyMember): Promise<void> {
    const ok = await this.store.remove(member.id);
    if (ok) this.toast.success('Family member removed.');
    else this.toast.error('Failed to remove member.');
  }
}
