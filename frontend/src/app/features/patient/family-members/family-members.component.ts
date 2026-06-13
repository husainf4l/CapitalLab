import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FamilyMember } from '../../../core/models/patient.models';
import { FamilyMembersStore } from '../stores/family-members.store';
import { ToastService } from '../../../core/services/toast.service';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-family-members',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule, MatButtonModule, MatIconModule, CommonModule, A11yModule,
  ],
  template: `
    <div class="family-page">

      <!-- Hero Strip -->
      <div class="hero-strip">
        <div class="hero-left">
          <div class="hero-icon-circle">
            <mat-icon>group</mat-icon>
          </div>
          <div class="hero-text">
            <h1 class="hero-title">Family Members</h1>
            <p class="hero-subtitle">Manage profiles and view results for your family</p>
          </div>
        </div>
        <button class="hero-add-btn" (click)="openAdd()">
          <mat-icon style="font-size:18px;width:18px;height:18px;line-height:18px">person_add</mat-icon>
          Add Member
        </button>
      </div>

      <!-- Empty State -->
      @if (store.members().length === 0 && !store.isLoading()) {
        <div class="empty-state">
          <div class="empty-icon-circle">
            <mat-icon>group</mat-icon>
          </div>
          <h3 class="empty-title">No family members yet</h3>
          <p class="empty-desc">Add your family members to book tests and track their health.</p>
          <button class="empty-add-btn" (click)="openAdd()">Add First Member</button>
        </div>
      } @else {
        <!-- Members Grid -->
        <div class="members-grid">
          @for (member of store.members(); track member.id) {
            <div class="member-card">
              <div class="member-avatar" [ngClass]="'gender-' + member.gender">
                {{ member.firstName.charAt(0) }}
              </div>
              <span class="relationship-badge">{{ member.relationship }}</span>
              <p class="member-name">{{ member.fullName }}</p>
              <p class="member-dob">{{ member.dateOfBirth | date:'d MMM yyyy' }}</p>
              <div class="member-actions">
                <button mat-stroked-button (click)="openEdit(member)" class="action-btn">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-stroked-button routerLink="/patient/results" class="action-btn">
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

      <!-- Add / Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div
            class="modal-card"
            (click)="$event.stopPropagation()"
            (keydown.escape)="closeModal()"
            cdkTrapFocus
            cdkTrapFocusAutoCapture
            role="dialog"
            aria-modal="true"
            aria-labelledby="family-form-title"
          >
            <div class="modal-header">
              <h4 id="family-form-title" class="modal-title">
                {{ editingMember() ? 'Edit Member' : 'Add Family Member' }}
              </h4>
              <button mat-icon-button (click)="closeModal()">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-form">
              <!-- Row 1: First Name + Last Name -->
              <div class="form-row">
                <div class="field-group">
                  <label class="field-label">First Name</label>
                  <input class="field-input" type="text" formControlName="firstName" placeholder="First name" />
                </div>
                <div class="field-group">
                  <label class="field-label">Last Name</label>
                  <input class="field-input" type="text" formControlName="lastName" placeholder="Last name" />
                </div>
              </div>

              <!-- Row 2: Date of Birth + Gender -->
              <div class="form-row">
                <div class="field-group">
                  <label class="field-label">Date of Birth</label>
                  <input class="field-input" type="date" formControlName="dateOfBirth" />
                </div>
                <div class="field-group">
                  <label class="field-label">Gender</label>
                  <select class="field-input" formControlName="gender">
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <!-- Row 3: Relationship + National ID -->
              <div class="form-row">
                <div class="field-group">
                  <label class="field-label">Relationship</label>
                  <select class="field-input" formControlName="relationship">
                    <option value="" disabled>Select relationship</option>
                    @for (rel of relationships; track rel.value) {
                      <option [value]="rel.value">{{ rel.label }}</option>
                    }
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label">National ID <span class="optional">(optional)</span></label>
                  <input class="field-input" type="text" formControlName="nationalId" placeholder="National ID" />
                </div>
              </div>

              <!-- Footer -->
              <div class="modal-footer">
                <button mat-stroked-button type="button" class="cancel-btn" (click)="closeModal()">Cancel</button>
                <button
                  class="submit-btn"
                  type="submit"
                  [disabled]="form.invalid || store.isSaving()"
                >
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
    .family-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ── Hero Strip ── */
    .hero-strip {
      background: linear-gradient(135deg, #1e9df1 0%, #1565c0 100%);
      border-radius: 16px;
      padding: 24px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .hero-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .hero-icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon {
        color: white;
        font-size: 24px;
        width: 24px;
        height: 24px;
        line-height: 24px;
      }
    }

    .hero-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .hero-title {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 700;
      color: white;
      line-height: 1.2;
    }

    .hero-subtitle {
      margin: 0;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .hero-add-btn {
      background: white;
      color: #1565c0;
      border-radius: 999px;
      padding: 10px 22px;
      font-weight: 700;
      font-size: 0.85rem;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      transition: opacity 0.2s;
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        line-height: 18px;
      }
      &:hover {
        opacity: 0.9;
      }
    }

    /* ── Members Grid ── */
    .members-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }

    .member-card {
      background: white;
      border-radius: 16px;
      padding: 22px;
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      transition: all 0.2s;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        border-color: #1e9df1;
      }
    }

    .member-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      font-weight: 800;
      flex-shrink: 0;
      &.gender-male {
        background: linear-gradient(135deg, #1e9df1, #1565c0);
      }
      &.gender-female {
        background: linear-gradient(135deg, #ec4899, #be185d);
      }
      &.gender-other {
        background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      }
    }

    .relationship-badge {
      background: #ede9fe;
      color: #7c3aed;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 999px;
      text-transform: capitalize;
    }

    .member-name {
      font-size: 1rem;
      font-weight: 700;
      color: #0f1419;
      margin: 0;
    }

    .member-dob {
      font-size: 0.8rem;
      color: #72767a;
      margin: 0;
    }

    .member-actions {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: auto;
    }

    .action-btn {
      font-size: 0.8rem;
    }

    /* ── Empty State ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      border-radius: 16px;
      padding: 60px 32px;
      border: 1px dashed #e2e8f0;
      gap: 12px;
    }

    .empty-icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #f0f9ff;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon {
        color: #94a3b8;
        font-size: 32px;
        width: 32px;
        height: 32px;
        line-height: 32px;
      }
    }

    .empty-title {
      font-weight: 700;
      font-size: 1rem;
      margin: 0;
      color: #0f1419;
    }

    .empty-desc {
      font-size: 0.85rem;
      color: #72767a;
      margin: 0;
    }

    .empty-add-btn {
      background: linear-gradient(135deg, #1e9df1, #1565c0);
      color: white;
      border: none;
      border-radius: 999px;
      padding: 10px 24px;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 8px;
      transition: opacity 0.2s;
      &:hover {
        opacity: 0.9;
      }
    }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-card {
      background: white;
      border-radius: 20px;
      padding: 28px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .modal-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f1419;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .field-group {
      display: flex;
      flex-direction: column;
    }

    .field-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: #72767a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 5px;
      display: block;
    }

    .optional {
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
    }

    .field-input {
      padding: 10px 13px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.875rem;
      width: 100%;
      box-sizing: border-box;
      outline: none;
      background: white;
      font-family: inherit;
      color: #0f1419;
      transition: border-color 0.15s, box-shadow 0.15s;
      &:focus {
        border-color: #1e9df1;
        box-shadow: 0 0 0 3px rgba(30, 157, 241, 0.12);
      }
    }

    select.field-input {
      appearance: auto;
      cursor: pointer;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 8px;
    }

    .cancel-btn {
      border-radius: 10px !important;
    }

    .submit-btn {
      background: linear-gradient(135deg, #1e9df1, #1565c0);
      color: white;
      border: none;
      border-radius: 10px;
      height: 44px;
      padding: 0 24px;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: opacity 0.2s;
      &:hover:not(:disabled) {
        opacity: 0.9;
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
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
