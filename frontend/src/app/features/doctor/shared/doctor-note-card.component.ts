import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DoctorNote, NOTE_TYPE_LABELS } from '../../../core/models/doctor-note.models';

const TYPE_COLORS: Record<string, string> = {
  observation: '#6366f1', recommendation: '#0d9488', follow_up: '#f59e0b',
  retest: '#ef4444', general: '#64748b',
};

@Component({
  selector: 'doctor-note-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="note-card" [style.border-left-color]="typeColor()">
      <div class="note-header">
        <span class="note-type" [style.background]="typeColor() + '20'" [style.color]="typeColor()">
          {{ typeLabel() }}
        </span>
        <span class="note-date">{{ note().createdAt | date:'dd MMM yyyy' }}</span>
        <div class="note-actions">
          <button mat-icon-button class="small-btn" (click)="edit.emit(note())"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button class="small-btn danger" (click)="delete.emit(note().id)"><mat-icon>delete</mat-icon></button>
        </div>
      </div>
      <p class="note-content">{{ note().content }}</p>
      @if (note().patientName) {
        <div class="note-patient"><mat-icon>person</mat-icon>{{ note().patientName }}</div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .note-card { background: white; border: 1px solid $border-color; border-left: 4px solid; border-radius: $border-radius; padding: 14px 16px; box-shadow: $shadow-sm; }
    .note-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .note-type { padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
    .note-date { font-size: 0.78rem; color: $text-secondary; flex: 1; text-align: right; }
    .note-actions { display: flex; gap: 2px; }
    .small-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; mat-icon { font-size: 16px; } }
    .danger mat-icon { color: $danger; }
    .note-content { margin: 0 0 8px; font-size: 0.875rem; color: $text-primary; line-height: 1.5; }
    .note-patient { display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: $text-secondary; mat-icon { font-size: 14px; } }
  `]
})
export class DoctorNoteCardComponent {
  note = input.required<DoctorNote>();
  edit = output<DoctorNote>();
  delete = output<string>();

  typeColor(): string { return TYPE_COLORS[this.note().type] ?? '#64748b'; }
  typeLabel(): string { return NOTE_TYPE_LABELS[this.note().type] ?? this.note().type; }
}
