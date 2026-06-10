import { Injectable, inject, signal } from '@angular/core';
import { SampleApiService } from '../../../core/api/sample-api.service';
import { Sample, QualityCheckRequest } from '../../../core/models/sample.models';

@Injectable({ providedIn: 'root' })
export class LabSamplesStore {
  private api = inject(SampleApiService);

  readonly samples = signal<Sample[]>([]);
  readonly selectedSample = signal<Sample | null>(null);
  readonly isLoading = signal(false);
  readonly isActing = signal('');

  readonly filterStatus = signal('');
  readonly filterType = signal('');
  readonly searchTerm = signal('');

  load(): void {
    this.isLoading.set(true);
    this.api.getAll({
      status: this.filterStatus() || undefined,
      sampleType: this.filterType() || undefined,
      search: this.searchTerm() || undefined,
    }).subscribe({
      next: res => { this.samples.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  selectSample(sample: Sample): void {
    this.selectedSample.set(sample);
  }

  clearSelection(): void {
    this.selectedSample.set(null);
  }

  private updateInList(updated: Sample): void {
    this.samples.update(list => list.map(s => s.id === updated.id ? updated : s));
    if (this.selectedSample()?.id === updated.id) this.selectedSample.set(updated);
  }

  collect(id: string, notes?: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.collect(id, notes).subscribe({
        next: res => { if (res.data) this.updateInList(res.data); this.isActing.set(''); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  receive(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.receive(id).subscribe({
        next: res => { if (res.data) this.updateInList(res.data); this.isActing.set(''); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  startProcessing(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.startProcessing(id).subscribe({
        next: res => { if (res.data) this.updateInList(res.data); this.isActing.set(''); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  completeProcessing(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.completeProcessing(id).subscribe({
        next: res => { if (res.data) this.updateInList(res.data); this.isActing.set(''); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  qualityCheck(id: string, request: QualityCheckRequest): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.qualityCheck(id, request).subscribe({
        next: res => { if (res.data) this.updateInList(res.data); this.isActing.set(''); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  complete(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.completeSample(id).subscribe({
        next: res => { if (res.data) this.updateInList(res.data); this.isActing.set(''); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }
}
