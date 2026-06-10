import { Injectable, signal, effect } from '@angular/core';

export type Direction = 'ltr' | 'rtl';

@Injectable({ providedIn: 'root' })
export class DirectionService {
  readonly direction = signal<Direction>('ltr');

  constructor() {
    const saved = localStorage.getItem('cl_direction') as Direction | null;
    if (saved) this.direction.set(saved);
    effect(() => {
      const dir = this.direction();
      document.documentElement.setAttribute('dir', dir);
      localStorage.setItem('cl_direction', dir);
    });
  }

  setDirection(dir: Direction): void {
    this.direction.set(dir);
  }

  toggle(): void {
    this.direction.set(this.direction() === 'ltr' ? 'rtl' : 'ltr');
  }

  isRtl(): boolean {
    return this.direction() === 'rtl';
  }
}
