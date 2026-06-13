import { Injectable, signal, inject } from '@angular/core';
import { ResultApiService } from '../../../core/api/result-api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DoctorReviewStore {
  private api = inject(ResultApiService);

  doctorNotes = signal('');

  async approve(reportId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.releaseReport(reportId));
      return true;
    } catch {
      return false;
    }
  }

  async requestRetest(_reportId: string): Promise<boolean> {
    return false;
  }
}
