import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Meta, Title } from '@angular/platform-browser';
import { ContentApiService } from '../../../core/api/content-api.service';
import { ContentFaqItem } from '../../../core/models/content.models';
import { JsonLdService } from '../../../core/services/json-ld.service';
import { NewsletterSubscribeComponent } from '../../../shared/components/newsletter-subscribe/newsletter-subscribe.component';

interface FaqGroup {
  category: string | null;
  items: (ContentFaqItem & { open: boolean })[];
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, MatIconModule, NewsletterSubscribeComponent],
  template: `
    <div class="faq-page">

      <!-- Hero section -->
      <div class="page-hero">
        <div class="container">
          <span class="page-tag">Help Center</span>
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about our lab testing services</p>
        </div>
      </div>

      <div class="page-body container">

        @if (loading()) {
          <!-- Loading skeleton -->
          <div class="faq-skeleton">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="sk-item"></div>
            }
          </div>

        } @else if (groups().length === 0) {
          <!-- Empty state -->
          <div class="empty-state">
            <div class="empty-icon">❓</div>
            <h3>No FAQ items available</h3>
            <p>Check back soon — we're adding content.</p>
          </div>

        } @else {
          <!-- FAQ groups -->
          @for (group of groups(); track (group.category ?? '__all__')) {
            @if (group.category) {
              <h2 class="group-heading">{{ group.category }}</h2>
            }
            <div class="faq-group">
              @for (item of group.items; track item.id; let i = $index) {
                <div class="faq-item" [class.open]="item.open">
                  <button class="faq-question" (click)="toggle(group, i)">
                    <span>{{ item.questionEn }}</span>
                    <mat-icon>{{ item.open ? 'expand_less' : 'expand_more' }}</mat-icon>
                  </button>
                  @if (item.open) {
                    <div class="faq-answer">{{ item.answerEn }}</div>
                  }
                </div>
              }
            </div>
          }

          <!-- Newsletter banner -->
          <div class="newsletter-wrap">
            <app-newsletter-subscribe />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .faq-page { min-height: 100vh; background: var(--bg-surface); }

    /* Hero */
    .page-hero { background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%); color: white; padding: 80px 0 64px; text-align: center; }
    .page-hero .container { padding: 0 24px; }
    .page-tag { display: inline-block; padding: 4px 14px; background: rgba(255,255,255,.15); border-radius: 20px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px; color: rgba(255,255,255,.9); }
    .page-hero h1 { font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; color: white; margin: 0 0 14px; line-height: 1.2; }
    .page-hero p { color: rgba(255,255,255,.8); font-size: 1.1rem; max-width: 560px; margin: 0 auto; line-height: 1.6; }

    /* Body */
    .page-body { padding: 56px 24px 80px; max-width: 820px; margin: 0 auto; }

    /* Group heading */
    .group-heading { font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #7b1fa2; margin: 36px 0 14px; padding-bottom: 8px; border-bottom: 2px solid #f3e5f5; }
    .group-heading:first-of-type { margin-top: 0; }
    .faq-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }

    /* FAQ items */
    .faq-item { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; transition: border-color .2s, box-shadow .2s; background: var(--bg-card); }
    .faq-item.open { border-color: #9c27b0; box-shadow: 0 4px 16px rgba(123,31,162,.1); }
    .faq-question { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 22px; background: none; border: none; cursor: pointer; font-size: 1rem; font-weight: 500; text-align: left; color: var(--text-primary); font-family: inherit; transition: background .15s; }
    .faq-question:hover { background: var(--bg-surface); }
    .faq-item.open .faq-question { background: #fdf4ff; color: #6b21a8; }
    .faq-question mat-icon { flex-shrink: 0; color: #9c27b0; transition: transform .2s; }
    .faq-answer { padding: 0 22px 20px 22px; color: var(--text-secondary); line-height: 1.75; font-size: 0.95rem; }

    /* Skeleton */
    .faq-skeleton { display: flex; flex-direction: column; gap: 10px; }
    .sk-item { height: 64px; border-radius: 10px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Empty */
    .empty-state { text-align: center; padding: 80px 20px; color: var(--text-muted); }
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.4rem; color: var(--text-primary); margin-bottom: 8px; }
    .empty-state p { color: var(--text-muted); font-size: 15px; }

    /* Newsletter */
    .newsletter-wrap { margin-top: 56px; }
  `]
})
export class FaqComponent implements OnInit, OnDestroy {
  private api = inject(ContentApiService);
  private jsonLd = inject(JsonLdService);
  private meta = inject(Meta);
  private titleService = inject(Title);

  private rawItems = signal<(ContentFaqItem & { open: boolean })[]>([]);
  loading = signal(true);

  groups = computed<FaqGroup[]>(() => {
    const all = this.rawItems();
    if (all.length === 0) return [];

    // Check if any item has a category
    const hasCats = all.some(i => !!i.category);
    if (!hasCats) {
      return [{ category: null, items: all }];
    }

    const map = new Map<string, (ContentFaqItem & { open: boolean })[]>();
    for (const item of all) {
      const key = item.category ?? 'General';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  });

  toggle(group: FaqGroup, index: number): void {
    group.items[index].open = !group.items[index].open;
    // Trigger signal update by setting a fresh copy
    this.rawItems.update(all => [...all]);
  }

  ngOnInit(): void {
    this.titleService.setTitle('FAQ | Capital Lab');
    this.meta.updateTag({ name: 'description', content: 'Find answers to common questions about our lab testing services' });
    this.meta.updateTag({ property: 'og:title', content: 'FAQ | Capital Lab' });
    this.meta.updateTag({ property: 'og:description', content: 'Find answers to common questions about our lab testing services' });

    this.api.getFaq().subscribe({
      next: r => {
        const items = (r.data ?? []).map(f => ({ ...f, open: false }));
        this.rawItems.set(items);
        if (items.length > 0) {
          this.jsonLd.setSchema(
            this.jsonLd.faqSchema(items.map(f => ({ question: f.questionEn, answer: f.answerEn })))
          );
        }
      },
      complete: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    this.jsonLd.removeSchema();
  }
}
