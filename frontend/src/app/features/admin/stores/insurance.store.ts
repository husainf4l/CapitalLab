import { Injectable, inject, signal } from '@angular/core';
import { InsuranceApiService } from '../../../core/api/insurance-api.service';
import { InsuranceProvider, InsuranceClaim, CreateInsuranceProviderRequest } from '../../../core/models/insurance.models';

@Injectable({ providedIn: 'root' })
export class InsuranceStore {
  private api = inject(InsuranceApiService);

  readonly providers = signal<InsuranceProvider[]>([]);
  readonly claims = signal<InsuranceClaim[]>([]);
  readonly selectedClaim = signal<InsuranceClaim | null>(null);
  readonly isLoading = signal(false);
  readonly isActing = signal('');
  readonly filterStatus = signal('');

  loadProviders(): void {
    this.isLoading.set(true);
    this.api.getProviders().subscribe({
      next: res => { this.providers.set(res.data ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  loadClaims(): void {
    this.isLoading.set(true);
    this.api.getClaims({ status: this.filterStatus() || undefined }).subscribe({
      next: res => { this.claims.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  select(claim: InsuranceClaim): void { this.selectedClaim.set(claim); }
  clearSelection(): void { this.selectedClaim.set(null); }

  createProvider(data: CreateInsuranceProviderRequest): Promise<boolean> {
    this.isActing.set('provider');
    return new Promise(resolve => {
      this.api.createProvider(data).subscribe({
        next: () => { this.isActing.set(''); this.loadProviders(); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  updateProvider(id: string, data: { name: string; phone?: string; email?: string; contactPerson?: string; isActive: boolean }): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.updateProvider(id, data).subscribe({
        next: () => { this.isActing.set(''); this.loadProviders(); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  createClaim(invoiceId: string, providerId: string, claimAmount: number): Promise<boolean> {
    this.isActing.set('claim');
    return new Promise(resolve => {
      this.api.createClaim(invoiceId, providerId, claimAmount).subscribe({
        next: () => { this.isActing.set(''); this.loadClaims(); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  submitClaim(id: string): Promise<boolean> { return this.act(id, () => this.api.submitClaim(id)); }
  approveClaim(id: string, amount: number): Promise<boolean> { return this.act(id, () => this.api.approveClaim(id, amount)); }
  rejectClaim(id: string, reason: string): Promise<boolean> { return this.act(id, () => this.api.rejectClaim(id, reason)); }
  markPaid(id: string): Promise<boolean> { return this.act(id, () => this.api.markPaid(id)); }

  private act(id: string, call: () => { subscribe: (o: any) => void }): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      call().subscribe({
        next: () => { this.isActing.set(''); this.loadClaims(); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }
}
