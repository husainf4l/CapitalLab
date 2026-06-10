import { Injectable, inject, signal, computed } from '@angular/core';
import { ResultApiService, CreateResultRequest, UpdateResultRequest } from '../../../core/api/result-api.service';
import { SampleApiService } from '../../../core/api/sample-api.service';
import { TestResult } from '../../../core/models/result.models';
import { Sample } from '../../../core/models/sample.models';

export interface ResultEntry extends Partial<TestResult> {
  isDirty: boolean;
  isCritical: boolean;
}

@Injectable({ providedIn: 'root' })
export class LabResultsEntryStore {
  private resultApi = inject(ResultApiService);
  private sampleApi = inject(SampleApiService);

  readonly samples = signal<Sample[]>([]);
  readonly selectedSample = signal<Sample | null>(null);
  readonly results = signal<ResultEntry[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly hasCritical = computed(() => this.results().some(r => r.isCritical));
  readonly hasUnsaved = computed(() => this.results().some(r => r.isDirty));

  load(): void {
    this.isLoading.set(true);
    this.sampleApi.getAll({ status: 'qc_passed' }).subscribe({
      next: res => { this.samples.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  selectSample(sample: Sample): void {
    this.selectedSample.set(sample);
    this.resultApi.getAllResults({ sampleId: sample.id }).subscribe({
      next: res => {
        const entries: ResultEntry[] = (res.data?.items ?? []).map(r => ({
          ...r,
          isDirty: false,
          isCritical: r.interpretation === 'critical',
        }));
        if (entries.length === 0) {
          entries.push({
            id: '',
            sampleId: sample.id,
            testId: sample.testId,
            testName: sample.testName,
            patientId: sample.patientId,
            value: '',
            unit: '',
            referenceRange: '',
            interpretation: undefined,
            notes: '',
            status: 'pending',
            isDirty: false,
            isCritical: false,
          });
        }
        this.results.set(entries);
      },
      error: () => this.results.set([]),
    });
  }

  updateEntry(index: number, field: keyof ResultEntry, value: string): void {
    this.results.update(list => {
      const updated = [...list];
      updated[index] = {
        ...updated[index],
        [field]: value,
        isDirty: true,
        isCritical: field === 'interpretation' ? value === 'critical' : updated[index].isCritical,
      };
      return updated;
    });
  }

  async saveDraft(index: number): Promise<boolean> {
    const entry = this.results()[index];
    const sample = this.selectedSample();
    if (!sample) return false;
    this.isSaving.set(true);

    const data: CreateResultRequest | UpdateResultRequest = {
      value: entry.value,
      unit: entry.unit,
      referenceRange: entry.referenceRange,
      interpretation: entry.interpretation as any,
      notes: entry.notes,
    };

    return new Promise(resolve => {
      const req = entry.id
        ? this.resultApi.updateResult(entry.id, data as UpdateResultRequest)
        : this.resultApi.createResult({
            ...(data as UpdateResultRequest),
            sampleId: sample.id,
            testId: sample.testId,
            orderId: sample.orderId,
            patientId: sample.patientId,
          });

      req.subscribe({
        next: res => {
          if (res.data) {
            this.results.update(list => {
              const updated = [...list];
              updated[index] = { ...res.data!, isDirty: false, isCritical: res.data!.interpretation === 'critical' };
              return updated;
            });
          }
          this.isSaving.set(false);
          resolve(true);
        },
        error: () => { this.isSaving.set(false); resolve(false); },
      });
    });
  }

  async submitAll(): Promise<boolean> {
    const results = this.results();
    this.isSaving.set(true);

    const unsaved = results.filter(r => r.isDirty);
    for (const [i, r] of results.entries()) {
      if (r.isDirty) await this.saveDraft(i);
    }

    const ids = results.filter(r => r.id).map(r => r.id!);
    if (ids.length === 0) { this.isSaving.set(false); return false; }

    return new Promise(resolve => {
      this.resultApi.submitForReview(ids[0]).subscribe({
        next: () => { this.isSaving.set(false); resolve(true); },
        error: () => { this.isSaving.set(false); resolve(false); },
      });
    });
  }
}
