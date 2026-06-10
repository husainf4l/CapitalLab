import { Injectable, signal, inject } from '@angular/core';
import { DirectionService } from './direction.service';

export type Language = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private directionService = inject(DirectionService);
  readonly currentLang = signal<Language>('en');

  constructor() {
    const saved = localStorage.getItem('cl_lang') as Language | null;
    if (saved) this.setLanguage(saved);
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
    localStorage.setItem('cl_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    this.directionService.setDirection(lang === 'ar' ? 'rtl' : 'ltr');
  }

  toggle(): void {
    this.setLanguage(this.currentLang() === 'en' ? 'ar' : 'en');
  }

  isArabic(): boolean {
    return this.currentLang() === 'ar';
  }
}
