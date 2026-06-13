import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Setting { id: string; key: string; value: string; category: string; description: string | null; isPublic: boolean; }

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>System Settings</h2><p class="sub">Configure platform-wide settings</p></div>
        <button mat-raised-button color="primary" (click)="showAdd = !showAdd">
          <mat-icon>add</mat-icon> Add Setting
        </button>
      </div>

      @if (showAdd) {
        <div class="card mb-4">
          <h3>New Setting</h3>
          <div class="form-grid">
            <div class="field"><label>Category</label><input [(ngModel)]="addForm.category" placeholder="e.g. General, Email, SMS" /></div>
            <div class="field"><label>Key</label><input [(ngModel)]="addForm.key" placeholder="setting.key.name" /></div>
            <div class="field full-span"><label>Value</label><input [(ngModel)]="addForm.value" placeholder="Setting value" /></div>
            <div class="field full-span"><label>Description</label><input [(ngModel)]="addForm.description" placeholder="Optional description" /></div>
          </div>
          <div class="form-actions">
            <button mat-flat-button color="primary" (click)="saveSetting()">Save</button>
            <button mat-stroked-button (click)="showAdd = false">Cancel</button>
          </div>
        </div>
      }

      @for (cat of categories(); track cat) {
        <div class="category-section">
          <h3 class="cat-title"><mat-icon>{{ iconForCategory(cat) }}</mat-icon> {{ cat }}</h3>
          <div class="settings-list">
            @for (s of settingsByCategory(cat); track s.id) {
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-key">{{ s.key }}</div>
                  @if (s.description) { <div class="setting-desc">{{ s.description }}</div> }
                </div>
                @if (editingId() === s.id) {
                  <div class="edit-inline">
                    <input [(ngModel)]="editValue" (keyup.enter)="saveEdit(s)" (keyup.escape)="editingId.set(null)" />
                    <button mat-icon-button (click)="saveEdit(s)" aria-label="Save setting"><mat-icon>check</mat-icon></button>
                    <button mat-icon-button (click)="editingId.set(null)" aria-label="Cancel edit"><mat-icon>close</mat-icon></button>
                  </div>
                } @else {
                  <div class="setting-value-row">
                    <span class="setting-val">{{ s.value }}</span>
                    <button mat-icon-button class="edit-btn" (click)="startEdit(s)" aria-label="Edit setting"><mat-icon>edit</mat-icon></button>
                  </div>
                }
                @if (s.isPublic) { <span class="public-badge">Public</span> }
              </div>
            }
          </div>
        </div>
      }

      @if (categories().length === 0 && !loading()) {
        <div class="empty"><mat-icon>settings</mat-icon><p>No settings configured yet</p></div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { padding: 24px; max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .sub { color: #64748b; font-size: .875rem; }
    .card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .mb-4 { margin-bottom: 24px; }
    .card h3 { font-size: 1rem; font-weight: 700; margin: 0 0 16px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field.full-span { grid-column: 1/-1; }
    .field label { font-size: .875rem; font-weight: 600; color: #374151; }
    .field input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: .875rem; }
    .form-actions { display: flex; gap: 12px; margin-top: 16px; }
    .category-section { margin-bottom: 28px; }
    .cat-title { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
    .settings-list { background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.08); overflow: hidden; }
    .setting-row { display: flex; align-items: center; padding: 14px 20px; border-bottom: 1px solid #f1f5f9; gap: 16px; }
    .setting-row:last-child { border-bottom: none; }
    .setting-info { flex: 1; }
    .setting-key { font-weight: 600; color: #1e293b; font-size: .9rem; font-family: monospace; }
    .setting-desc { font-size: .8rem; color: #64748b; margin-top: 2px; }
    .setting-value-row { display: flex; align-items: center; gap: 8px; }
    .setting-val { font-size: .875rem; color: #374151; background: #f8fafc; padding: 4px 10px; border-radius: 6px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .edit-inline { display: flex; align-items: center; gap: 4px; }
    .edit-inline input { padding: 6px 10px; border: 1px solid #3b82f6; border-radius: 6px; font-size: .875rem; min-width: 200px; }
    .edit-btn { opacity: 0; }
    .setting-row:hover .edit-btn { opacity: 1; }
    .public-badge { font-size: .7rem; background: #eff6ff; color: #2563eb; padding: 3px 7px; border-radius: 20px; font-weight: 600; }
    .empty { display: flex; flex-direction: column; align-items: center; padding: 80px; color: #94a3b8; gap: 12px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private http = inject(HttpClient);
  allSettings = signal<Setting[]>([]);
  loading = signal(false);
  editingId = signal<string | null>(null);
  editValue = '';
  showAdd = false;
  addForm = { key: '', value: '', category: '', description: '' };

  categories = () => [...new Set(this.allSettings().map(s => s.category))].sort();
  settingsByCategory = (cat: string) => this.allSettings().filter(s => s.category === cat);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/settings`).subscribe({
      next: r => { this.allSettings.set(r.data ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  startEdit(s: Setting) { this.editingId.set(s.id); this.editValue = s.value; }

  saveEdit(s: Setting) {
    this.http.put(`${environment.apiUrl}/settings`, { key: s.key, value: this.editValue, category: s.category, description: s.description }).subscribe({
      next: () => { this.editingId.set(null); this.load(); },
      error: () => {}
    });
  }

  saveSetting() {
    if (!this.addForm.key || !this.addForm.value || !this.addForm.category) return;
    this.http.put(`${environment.apiUrl}/settings`, this.addForm).subscribe({
      next: () => { this.showAdd = false; this.addForm = { key: '', value: '', category: '', description: '' }; this.load(); },
      error: () => {}
    });
  }

  iconForCategory(cat: string): string {
    const m: Record<string, string> = {
      General: 'settings', Email: 'email', SMS: 'sms', WhatsApp: 'message',
      Notifications: 'notifications', PDF: 'picture_as_pdf', Insurance: 'health_and_safety',
      Branding: 'palette', Branches: 'business'
    };
    return m[cat] ?? 'tune';
  }
}
