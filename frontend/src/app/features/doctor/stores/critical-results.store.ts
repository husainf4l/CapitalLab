import { Injectable, inject, signal, computed } from '@angular/core';
import { CriticalResultsApiService } from '../../../core/api/critical-results-api.service';
import { CriticalResult, CriticalResultStatus } from '../../../core/models/critical-result.models';

@Injectable({ providedIn: 'root' })
export class CriticalResultsStore {
  private api = inject(CriticalResultsApiService);

  readonly results = signal<CriticalResult[]>([]);
  readonly selectedResult = signal<CriticalResult | null>(null);
  readonly isLoading = signal(false);
  readonly isActing = signal('');
  readonly filterStatus = signal<CriticalResultStatus | ''>('');
  readonly filterLevel = signal('');
  readonly noteInput = signal('');

  readonly unacknowledged = computed(() =>
    this.results().filter(r => r.status === 'unacknowledged')
  );
  readonly acknowledged = computed(() =>
    this.results().filter(r => r.status !== 'unacknowledged')
  );
  readonly criticalHigh = computed(() =>
    this.results().filter(r => r.level === 'critical_high')
  );
  readonly criticalLow = computed(() =>
    this.results().filter(r => r.level === 'critical_low')
  );

  readonly filtered = computed(() => {
    return this.results().filter(r => {
      if (this.filterStatus() && r.status !== this.filterStatus()) return false;
      if (this.filterLevel() && r.level !== this.filterLevel()) return false;
      return true;
    });
  });

  load(): void {
    this.isLoading.set(true);
    this.api.getAll().subscribe({
      next: res => { this.results.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  select(result: CriticalResult): void {
    this.selectedResult.set(result);
    this.noteInput.set('');
  }

  clearSelection(): void {
    this.selectedResult.set(null);
    this.noteInput.set('');
  }

  acknowledge(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.acknowledge(id, { notes: this.noteInput() || undefined }).subscribe({
        next: res => {
          if (res.data) this.results.update(list => list.map(r => r.id === id ? res.data! : r));
          this.selectedResult.set(null);
          this.isActing.set('');
          resolve(true);
        },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  addNote(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.addNote(id, this.noteInput()).subscribe({
        next: res => {
          if (res.data) this.results.update(list => list.map(r => r.id === id ? res.data! : r));
          this.noteInput.set('');
          this.isActing.set('');
          resolve(true);
        },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  requestRetest(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.requestRetest(id, this.noteInput() || undefined).subscribe({
        next: () => {
          this.results.update(list => list.map(r => r.id === id ? { ...r, status: 'actioned' as const } : r));
          this.selectedResult.set(null);
          this.isActing.set('');
          resolve(true);
        },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }
}
