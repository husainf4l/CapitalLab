import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { SampleApiService } from '../../../core/api/sample-api.service';
import { Sample } from '../../../core/models/sample.models';

@Component({
  selector: 'app-lab-barcode',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Barcode & Labels</h2>
      </div>

      <div class="layout">
        <!-- Search Panel -->
        <div class="search-panel">
          <div class="card">
            <h4>Find Sample</h4>
            <div class="search-row">
              <mat-form-field appearance="outline" class="flex-input">
                <mat-label>Sample number or barcode</mat-label>
                <mat-icon matPrefix>qr_code_scanner</mat-icon>
                <input matInput [(ngModel)]="searchInput" (keydown.enter)="search()" placeholder="Scan or type..." />
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="search()" [disabled]="isSearching()">
                <mat-icon>search</mat-icon>
              </button>
            </div>

            @if (searchError()) {
              <div class="error-msg"><mat-icon>error</mat-icon> {{ searchError() }}</div>
            }

            @if (foundSample()) {
              <div class="found-card">
                <div class="found-header">
                  <mat-icon>science</mat-icon>
                  <div>
                    <strong>{{ foundSample()!.sampleNumber || foundSample()!.id.slice(0, 12) }}</strong>
                    <span>{{ foundSample()!.patientName || '—' }}</span>
                  </div>
                </div>
                <div class="found-meta">
                  <span>Type: {{ foundSample()!.sampleType }}</span>
                  <span>Test: {{ foundSample()!.testName || '—' }}</span>
                </div>
                <button mat-raised-button color="primary" class="full-btn" [disabled]="isGenerating()" (click)="generateBarcode()">
                  @if (isGenerating()) { <mat-icon class="spin">refresh</mat-icon> Generating... }
                  @else { <mat-icon>qr_code_2</mat-icon> Generate Barcode }
                </button>
              </div>
            }
          </div>

          <!-- Manual generate by ID -->
          <div class="card">
            <h4>Generate by Sample ID</h4>
            <mat-form-field appearance="outline" class="flex-input">
              <mat-label>Sample ID</mat-label>
              <input matInput [(ngModel)]="manualId" placeholder="Paste sample ID..." />
            </mat-form-field>
            <button mat-stroked-button class="full-btn" [disabled]="!manualId || isGenerating()" (click)="generateManual()">
              <mat-icon>label</mat-icon> Generate Label
            </button>
          </div>
        </div>

        <!-- Label Preview Panel -->
        <div class="preview-panel">
          @if (!labelData()) {
            <div class="no-label">
              <mat-icon>label_off</mat-icon>
              <p>No label generated yet</p>
              <span>Search for a sample and click "Generate Barcode"</span>
            </div>
          } @else {
            <div class="label-card" id="printArea">
              <div class="label-header-row">
                <div class="lab-brand">🔬 Capital Lab</div>
                <div class="label-date">{{ labelData()!.generatedAt | date:'dd/MM/yyyy HH:mm' }}</div>
              </div>

              <div class="label-patient">{{ labelData()!.patientName || '—' }}</div>
              <div class="label-test">{{ labelData()!.testName || '—' }}</div>

              <!-- CSS barcode simulation -->
              <div class="barcode-visual">
                <div class="barcode-bars">
                  @for (bar of barcodePattern; track $index) {
                    <div class="bar" [style.width.px]="bar.w" [style.background]="bar.c"></div>
                  }
                </div>
                <div class="barcode-text">{{ labelData()!.barcode }}</div>
              </div>

              <!-- QR code placeholder -->
              <div class="qr-row">
                <div class="qr-placeholder">
                  <mat-icon>qr_code</mat-icon>
                  <span>QR</span>
                </div>
                <div class="label-details">
                  <div class="ld-row"><span>Sample:</span><strong>{{ labelData()!.sampleNumber }}</strong></div>
                  <div class="ld-row"><span>Type:</span><strong>{{ labelData()!.sampleType }}</strong></div>
                  <div class="ld-row"><span>Branch:</span><strong>{{ labelData()!.branchName || '—' }}</strong></div>
                </div>
              </div>

              <div class="urgent-band" [class.urgent]="labelData()!.urgent">
                {{ labelData()!.urgent ? '⚡ URGENT' : 'ROUTINE' }}
              </div>
            </div>

            <div class="label-actions">
              <button mat-raised-button color="primary" (click)="print()">
                <mat-icon>print</mat-icon> Print Label
              </button>
              <button mat-stroked-button (click)="labelData.set(null)">
                <mat-icon>clear</mat-icon> Clear
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { margin: 0; } }

    .layout { display: grid; grid-template-columns: 360px 1fr; gap: 24px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .card { background: white; border-radius: $border-radius; border: 1px solid $border-color; padding: 20px; margin-bottom: 16px; box-shadow: $shadow-sm;
      h4 { margin: 0 0 14px; font-size: 0.9rem; }
    }
    .search-row { display: flex; gap: 8px; align-items: flex-start;
      .flex-input { flex: 1; }
    }
    .flex-input { width: 100%; }
    .full-btn { width: 100%; margin-top: 8px; }

    .error-msg { display: flex; align-items: center; gap: 6px; color: $danger; font-size: 0.85rem; margin-top: 8px; }

    .found-card { background: $gray-50; border: 1px solid $border-color; border-radius: $border-radius; padding: 14px; margin-top: 12px; }
    .found-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
      mat-icon { color: $primary; }
      strong { display: block; font-size: 0.875rem; }
      span { font-size: 0.78rem; color: $text-secondary; }
    }
    .found-meta { display: flex; gap: 16px; font-size: 0.78rem; color: $text-secondary; margin-bottom: 12px; }

    .preview-panel { }
    .no-label { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; background: white; border: 2px dashed $border-color; border-radius: $border-radius; color: $text-secondary;
      mat-icon { font-size: 48px; opacity: 0.3; margin-bottom: 8px; }
      p { margin: 0 0 4px; font-weight: 500; }
      span { font-size: 0.85rem; opacity: 0.7; }
    }

    .label-card {
      background: white; border: 2px solid #222; border-radius: 8px; padding: 20px; max-width: 380px;
      font-family: 'Courier New', monospace;
    }
    .label-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .lab-brand { font-weight: 700; font-size: 0.9rem; }
    .label-date { font-size: 0.72rem; color: $text-secondary; }
    .label-patient { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
    .label-test { font-size: 0.8rem; color: $text-secondary; margin-bottom: 16px; }

    .barcode-visual { margin-bottom: 16px; }
    .barcode-bars { display: flex; height: 56px; gap: 1px; margin-bottom: 4px; }
    .bar { height: 100%; flex-shrink: 0; }
    .barcode-text { font-family: 'Courier New', monospace; font-size: 0.72rem; text-align: center; letter-spacing: 0.1em; }

    .qr-row { display: flex; gap: 14px; margin-bottom: 12px; }
    .qr-placeholder { width: 64px; height: 64px; border: 2px solid #222; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 28px; }
      span { font-size: 0.6rem; }
    }
    .label-details { flex: 1; }
    .ld-row { display: flex; justify-content: space-between; font-size: 0.78rem; padding: 2px 0;
      span { color: $text-secondary; }
    }

    .urgent-band { margin-top: 12px; padding: 6px; text-align: center; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; background: $gray-100; border-radius: 4px; color: $text-secondary;
      &.urgent { background: #fef3c7; color: #92400e; }
    }

    .label-actions { display: flex; gap: 10px; margin-top: 16px; }
    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media print {
      .page-header, .search-panel, .label-actions { display: none; }
      .label-card { border: 2px solid #000; }
    }
  `]
})
export class LabBarcodeComponent {
  private sampleApi = inject(SampleApiService);

  searchInput = '';
  manualId = '';
  foundSample = signal<Sample | null>(null);
  labelData = signal<any>(null);
  isSearching = signal(false);
  isGenerating = signal(false);
  searchError = signal('');

  barcodePattern: { w: number; c: string }[] = this.generatePattern();

  search(): void {
    if (!this.searchInput.trim()) return;
    this.isSearching.set(true);
    this.searchError.set('');
    this.sampleApi.getByBarcode(this.searchInput.trim()).subscribe({
      next: res => {
        this.foundSample.set(res.data ?? null);
        if (!res.data) this.searchError.set('Sample not found');
        this.isSearching.set(false);
      },
      error: () => { this.searchError.set('Not found'); this.isSearching.set(false); },
    });
  }

  generateBarcode(): void {
    const sample = this.foundSample();
    if (!sample) return;
    this.isGenerating.set(true);
    this.sampleApi.generateBarcode(sample.id).subscribe({
      next: res => {
        this.labelData.set({
          ...res.data,
          patientName: sample.patientName,
          testName: sample.testName,
          sampleType: sample.sampleType,
          sampleNumber: sample.sampleNumber,
          branchName: sample.branchName,
          urgent: false,
          generatedAt: new Date(),
        });
        this.barcodePattern = this.generatePattern();
        this.isGenerating.set(false);
      },
      error: () => this.isGenerating.set(false),
    });
  }

  generateManual(): void {
    if (!this.manualId.trim()) return;
    this.isGenerating.set(true);
    this.sampleApi.generateBarcode(this.manualId.trim()).subscribe({
      next: res => {
        this.labelData.set({ ...res.data, generatedAt: new Date() });
        this.barcodePattern = this.generatePattern();
        this.isGenerating.set(false);
      },
      error: () => this.isGenerating.set(false),
    });
  }

  print(): void { window.print(); }

  private generatePattern(): { w: number; c: string }[] {
    const bars: { w: number; c: string }[] = [];
    for (let i = 0; i < 45; i++) {
      bars.push({ w: Math.random() < 0.5 ? 2 : 1, c: i % 2 === 0 ? '#000' : '#fff' });
    }
    return bars;
  }
}
