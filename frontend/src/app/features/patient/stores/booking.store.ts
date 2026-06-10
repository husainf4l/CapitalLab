import { Injectable, signal, computed } from '@angular/core';
import { LabTest } from '../../../core/models/lab-test.models';
import { HealthPackage } from '../../../core/models/health-package.models';
import { Branch } from '../../../core/models/branch.models';
import { Appointment } from '../../../core/models/appointment.models';

export interface BookingPatient {
  id: string;
  name: string;
  isSelf: boolean;
}

@Injectable({ providedIn: 'root' })
export class BookingStore {
  readonly totalSteps = 6;

  // Wizard navigation
  readonly currentStep = signal(1);

  // Step 1: Type
  readonly appointmentType = signal<'branch' | 'home_collection'>('branch');

  // Step 2: Tests/Packages
  readonly selectedTests = signal<LabTest[]>([]);
  readonly selectedPackages = signal<HealthPackage[]>([]);

  // Step 3: Location
  readonly selectedBranch = signal<Branch | null>(null);
  readonly address = signal('');
  readonly city = signal('');

  // Step 4: Date/Time
  readonly appointmentDate = signal('');
  readonly appointmentTime = signal('');

  // Step 5: Patient
  readonly selectedPatient = signal<BookingPatient | null>(null);

  // Step 6: Notes
  readonly notes = signal('');

  // Result after booking
  readonly bookedAppointment = signal<Appointment | null>(null);
  readonly isSubmitting = signal(false);

  // Computed
  readonly totalPrice = computed(() => {
    const t = this.selectedTests().reduce((s, item) => s + (item.price ?? 0), 0);
    const p = this.selectedPackages().reduce((s, item) => s + (item.price ?? 0), 0);
    return t + p;
  });

  readonly testIds = computed(() => this.selectedTests().map(t => t.id));
  readonly packageIds = computed(() => this.selectedPackages().map(p => p.id));

  readonly selectionCount = computed(() =>
    this.selectedTests().length + this.selectedPackages().length
  );

  readonly isCurrentStepValid = computed(() => {
    switch (this.currentStep()) {
      case 1: return true;
      case 2: return this.selectionCount() > 0;
      case 3: return this.appointmentType() === 'branch'
        ? !!this.selectedBranch()
        : !!(this.address() && this.city());
      case 4: return !!(this.appointmentDate() && this.appointmentTime());
      case 5: return !!this.selectedPatient();
      case 6: return true;
      default: return false;
    }
  });

  toggleTest(test: LabTest): void {
    const exists = this.selectedTests().some(t => t.id === test.id);
    this.selectedTests.update(list =>
      exists ? list.filter(t => t.id !== test.id) : [...list, test]
    );
  }

  togglePackage(pkg: HealthPackage): void {
    const exists = this.selectedPackages().some(p => p.id === pkg.id);
    this.selectedPackages.update(list =>
      exists ? list.filter(p => p.id !== pkg.id) : [...list, pkg]
    );
  }

  isTestSelected(id: string): boolean {
    return this.selectedTests().some(t => t.id === id);
  }

  isPackageSelected(id: string): boolean {
    return this.selectedPackages().some(p => p.id === id);
  }

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) this.currentStep.update(s => s + 1);
  }

  prevStep(): void {
    if (this.currentStep() > 1) this.currentStep.update(s => s - 1);
  }

  reset(): void {
    this.currentStep.set(1);
    this.appointmentType.set('branch');
    this.selectedTests.set([]);
    this.selectedPackages.set([]);
    this.selectedBranch.set(null);
    this.address.set('');
    this.city.set('');
    this.appointmentDate.set('');
    this.appointmentTime.set('');
    this.selectedPatient.set(null);
    this.notes.set('');
    this.bookedAppointment.set(null);
    this.isSubmitting.set(false);
  }
}
