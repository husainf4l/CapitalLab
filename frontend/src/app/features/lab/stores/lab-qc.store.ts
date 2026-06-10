import { Injectable, inject, signal } from '@angular/core';
import { SampleApiService } from '../../../core/api/sample-api.service';
import { Sample, QualityCheckRequest } from '../../../core/models/sample.models';

@Injectable({ providedIn: 'root' })
export class LabQcStore {
  private api = inject(SampleApiService);

  readonly queue = signal<Sample[]>([]);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly selectedSample = signal<Sample | null>(null);

  load(): void {
    this.isLoading.set(true);
    this.api.getAll({ status: 'qc_pending' }).subscribe({
      next: res => { this.queue.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  openQc(sample: Sample): void {
    this.selectedSample.set(sample);
  }

  closeQc(): void {
    this.selectedSample.set(null);
  }

  submitQc(id: string, request: QualityCheckRequest): Promise<boolean> {
    this.isSubmitting.set(true);
    return new Promise(resolve => {
      this.api.qualityCheck(id, request).subscribe({
        next: res => {
          if (res.data) {
            this.queue.update(list => list.filter(s => s.id !== id));
          }
          this.isSubmitting.set(false);
          this.selectedSample.set(null);
          resolve(true);
        },
        error: () => { this.isSubmitting.set(false); resolve(false); },
      });
    });
  }
}
