import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PackageApiService } from '../../../core/api/package-api.service';
import { LabTestApiService } from '../../../core/api/lab-test-api.service';
import { HealthPackage } from '../../../core/models/health-package.models';
import { LabTest } from '../../../core/models/lab-test.models';
import { ToastService } from '../../../core/services/toast.service';

interface PackageForm {
  id?: string;
  code: string;
  name: string;
  nameAr: string;
  description: string;
  price: number | null;
  discountPercentage: number;
  isPopular: boolean;
  testIds: string[];
}

@Component({
  selector: 'app-admin-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  template: `
    <div class="packages-page">
      <div class="page-header">
        <div>
          <h2>Health Packages</h2>
          <p>Create the packages patients can choose while booking appointments.</p>
        </div>
        <button mat-flat-button color="primary" type="button" (click)="startCreate()">
          <mat-icon>add</mat-icon>
          New Package
        </button>
      </div>

      @if (showForm()) {
        <section class="form-card">
          <div class="form-head">
            <div>
              <h3>{{ form.id ? 'Edit Package' : 'New Package' }}</h3>
              <p>Choose real lab tests so the package is bookable by patients.</p>
            </div>
            <button mat-icon-button type="button" aria-label="Close package form" (click)="cancelForm()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="form-grid">
            <label class="field">
              <span>Code</span>
              <input [(ngModel)]="form.code" [disabled]="!!form.id" placeholder="VIT-PKG" />
            </label>
            <label class="field">
              <span>Name</span>
              <input [(ngModel)]="form.name" placeholder="Vitamin Package" />
            </label>
            <label class="field">
              <span>Arabic Name</span>
              <input [(ngModel)]="form.nameAr" placeholder="Optional" />
            </label>
            <label class="field">
              <span>Price (SAR)</span>
              <input type="number" min="0" [(ngModel)]="form.price" />
            </label>
            <label class="field">
              <span>Discount %</span>
              <input type="number" min="0" max="100" [(ngModel)]="form.discountPercentage" />
            </label>
            <label class="check-field">
              <input type="checkbox" [(ngModel)]="form.isPopular" />
              <span>Mark as popular</span>
            </label>
            <label class="field full">
              <span>Description</span>
              <textarea rows="3" [(ngModel)]="form.description" placeholder="Short patient-facing package description"></textarea>
            </label>
          </div>

          @if (!form.id) {
            <div class="tests-picker">
              <div class="picker-head">
                <h4>Included Tests</h4>
                <span>{{ form.testIds.length }} selected</span>
              </div>
              <div class="test-grid">
                @for (test of tests(); track test.id) {
                  <label class="test-option">
                    <input type="checkbox" [checked]="form.testIds.includes(test.id)" (change)="toggleTest(test.id)" />
                    <span>
                      <strong>{{ test.name }}</strong>
                      <small>{{ test.code }} · SAR {{ test.price | number:'1.0-0' }}</small>
                    </span>
                  </label>
                }
              </div>
            </div>
          } @else {
            <p class="edit-note">To change included tests later, create a new package or use the backend package test endpoints.</p>
          }

          <div class="form-actions">
            <button mat-flat-button color="primary" type="button" [disabled]="saving()" (click)="savePackage()">
              <mat-icon>{{ saving() ? 'hourglass_empty' : 'save' }}</mat-icon>
              {{ saving() ? 'Saving...' : 'Save Package' }}
            </button>
            <button mat-stroked-button type="button" (click)="cancelForm()">Cancel</button>
          </div>
        </section>
      }

      <section class="table-card">
        <div class="table-head">
          <div>
            <h3>Packages</h3>
            <p>{{ packages().length }} total</p>
          </div>
          <button mat-stroked-button type="button" (click)="load()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>

        @if (loading()) {
          <div class="empty">Loading packages...</div>
        } @else if (packages().length === 0) {
          <div class="empty">
            <mat-icon>inventory_2</mat-icon>
            <p>No packages yet. Create one to show it in patient booking.</p>
          </div>
        } @else {
          <div class="pkg-table">
            <div class="pkg-row pkg-head">
              <span>Package</span>
              <span>Tests</span>
              <span>Price</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            @for (pkg of packages(); track pkg.id) {
              <div class="pkg-row">
                <div class="pkg-main">
                  <strong>{{ pkg.name }}</strong>
                  <small>{{ pkg.code }} @if (pkg.isPopular) { · Popular }</small>
                </div>
                <span>{{ pkg.testCount ?? pkg.testsCount ?? 0 }}</span>
                <span>SAR {{ (pkg.effectivePrice ?? pkg.price) | number:'1.0-0' }}</span>
                <span class="status" [class.inactive]="!pkg.isActive">{{ pkg.isActive ? 'Active' : 'Inactive' }}</span>
                <div class="row-actions">
                  <button mat-icon-button type="button" aria-label="Edit package" (click)="startEdit(pkg)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button type="button" [attr.aria-label]="pkg.isActive ? 'Deactivate package' : 'Activate package'" (click)="toggleStatus(pkg)">
                    <mat-icon>{{ pkg.isActive ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <button mat-icon-button type="button" aria-label="Delete package" class="danger" (click)="deletePackage(pkg)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .packages-page { max-width: 1120px; margin: 0 auto; }
    .page-header, .table-head, .form-head, .picker-head {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .page-header { margin-bottom: 20px; }
    h2, h3, h4, p { margin: 0; }
    h2 { font-size: 1.6rem; font-weight: 800; }
    h3 { font-size: 1.05rem; font-weight: 800; }
    p { color: var(--text-muted, #64748b); font-size: .9rem; }

    .form-card, .table-card {
      background: #fff; border: 1px solid #dce6ed; border-radius: 16px;
      box-shadow: 0 10px 28px rgba(15, 20, 25, .05); padding: 22px; margin-bottom: 20px;
    }
    .form-head { margin-bottom: 18px; }
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field.full { grid-column: 1 / -1; }
    .field span, .check-field span { font-size: .82rem; font-weight: 700; color: #334155; }
    input, textarea {
      border: 1px solid #cfdbe3; border-radius: 10px; padding: 10px 12px; font: inherit; background: #fff;
    }
    textarea { resize: vertical; }
    .check-field { display: flex; align-items: center; gap: 8px; padding-top: 24px; }
    .check-field input, .test-option input { width: 16px; height: 16px; accent-color: $primary; }

    .tests-picker { margin-top: 18px; border-top: 1px solid #e5edf3; padding-top: 18px; }
    .picker-head { margin-bottom: 12px; }
    .picker-head span { color: $primary; font-weight: 800; font-size: .85rem; }
    .test-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-height: 320px; overflow: auto;
      @media (max-width: 760px) { grid-template-columns: 1fr; }
    }
    .test-option {
      display: flex; align-items: flex-start; gap: 10px; padding: 12px; border: 1px solid #dce6ed;
      border-radius: 12px; background: #f8fbfd; cursor: pointer;
      strong { display: block; font-size: .88rem; }
      small { display: block; color: #64748b; margin-top: 2px; }
      &:hover { border-color: rgba($primary, .45); background: #eef8ff; }
    }
    .edit-note { margin-top: 14px; padding: 12px; border-radius: 10px; background: #f8fafc; border: 1px solid #e5edf3; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }

    .table-head { margin-bottom: 14px; }
    .pkg-table { display: grid; gap: 8px; }
    .pkg-row {
      display: grid; grid-template-columns: 1.7fr .5fr .75fr .7fr 132px; align-items: center; gap: 12px;
      padding: 12px 14px; border: 1px solid #e5edf3; border-radius: 12px; background: #fff;
      @media (max-width: 900px) { grid-template-columns: 1fr; align-items: start; }
    }
    .pkg-head { background: #f7fafc; color: #64748b; font-size: .78rem; font-weight: 800; text-transform: uppercase; }
    .pkg-main small { display: block; color: #64748b; margin-top: 3px; }
    .status {
      width: fit-content; border-radius: 999px; padding: 4px 9px; font-size: .75rem; font-weight: 800;
      color: #047857; background: #ecfdf5;
      &.inactive { color: #9a3412; background: #fff7ed; }
    }
    .row-actions { display: flex; align-items: center; gap: 2px; }
    .danger { color: #dc2626; }
    .empty {
      min-height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 8px; color: #64748b; border: 1px dashed #cfdbe3; border-radius: 14px; background: #f8fbfd;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #94a3b8; }
    }
  `]
})
export class AdminPackagesComponent implements OnInit {
  private packageApi = inject(PackageApiService);
  private labTestApi = inject(LabTestApiService);
  private toast = inject(ToastService);

  packages = signal<HealthPackage[]>([]);
  tests = signal<LabTest[]>([]);
  loading = signal(false);
  saving = signal(false);
  showForm = signal(false);

  form: PackageForm = this.blankForm();
  ngOnInit(): void {
    this.load();
    this.loadTests();
  }

  load(): void {
    this.loading.set(true);
    this.packageApi.getAll({ pageSize: 100 }).subscribe({
      next: res => { this.packages.set(res.items ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Could not load packages'); },
    });
  }

  loadTests(): void {
    this.labTestApi.getTests({ pageSize: 100, pageNumber: 1 }).subscribe({
      next: res => this.tests.set(res.data?.items ?? []),
      error: () => this.toast.error('Could not load tests'),
    });
  }

  startCreate(): void {
    this.form = this.blankForm();
    this.showForm.set(true);
  }

  startEdit(pkg: HealthPackage): void {
    this.form = {
      id: pkg.id,
      code: pkg.code ?? '',
      name: pkg.name,
      nameAr: pkg.nameAr ?? '',
      description: pkg.description ?? '',
      price: pkg.price,
      discountPercentage: pkg.discountPercentage ?? 0,
      isPopular: pkg.isPopular,
      testIds: [],
    };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.form = this.blankForm();
    this.showForm.set(false);
  }

  toggleTest(testId: string): void {
    this.form.testIds = this.form.testIds.includes(testId)
      ? this.form.testIds.filter(id => id !== testId)
      : [...this.form.testIds, testId];
  }

  savePackage(): void {
    if (!this.canSave()) {
      this.toast.warning('Package name, code, and price are required');
      return;
    }

    this.saving.set(true);
    const done = () => {
      this.toast.success('Package saved');
      this.saving.set(false);
      this.cancelForm();
      this.load();
    };
    const fail = () => {
      this.saving.set(false);
      this.toast.error('Could not save package');
    };

    if (this.form.id) {
      this.packageApi.update(this.form.id, {
        name: this.form.name.trim(),
        nameAr: this.form.nameAr.trim() || null,
        description: this.form.description.trim() || null,
        price: Number(this.form.price),
        currency: 'SAR',
        discountPercentage: Number(this.form.discountPercentage ?? 0),
        isPopular: this.form.isPopular,
      }).subscribe({ next: done, error: fail });
      return;
    }

    this.packageApi.create({
      code: this.form.code.trim().toUpperCase(),
      name: this.form.name.trim(),
      nameAr: this.form.nameAr.trim() || null,
      description: this.form.description.trim() || null,
      price: Number(this.form.price),
      currency: 'SAR',
      discountPercentage: Number(this.form.discountPercentage ?? 0),
      isPopular: this.form.isPopular,
      testIds: this.form.testIds,
    }).subscribe({ next: done, error: fail });
  }

  toggleStatus(pkg: HealthPackage): void {
    const request = pkg.isActive ? this.packageApi.deactivate(pkg.id) : this.packageApi.activate(pkg.id);
    request.subscribe({
      next: () => { this.toast.success(pkg.isActive ? 'Package deactivated' : 'Package activated'); this.load(); },
      error: () => this.toast.error('Could not update package status'),
    });
  }

  deletePackage(pkg: HealthPackage): void {
    if (!confirm(`Delete ${pkg.name}?`)) return;
    this.packageApi.delete(pkg.id).subscribe({
      next: () => { this.toast.success('Package deleted'); this.load(); },
      error: () => this.toast.error('Could not delete package'),
    });
  }

  private blankForm(): PackageForm {
    return {
      code: '',
      name: '',
      nameAr: '',
      description: '',
      price: null,
      discountPercentage: 0,
      isPopular: false,
      testIds: [],
    };
  }

  private canSave(): boolean {
    return !!this.form.name.trim() && !!this.form.price && (!!this.form.id || !!this.form.code.trim());
  }
}
