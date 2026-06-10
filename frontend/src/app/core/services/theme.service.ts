import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>('light');

  constructor() {
    const saved = localStorage.getItem('cl_theme') as Theme | null;
    if (saved) this.theme.set(saved);
    effect(() => {
      const t = this.theme();
      document.documentElement.setAttribute('data-theme', t);
      if (t === 'dark') {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
      localStorage.setItem('cl_theme', t);
    });
  }

  toggle(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }
}
