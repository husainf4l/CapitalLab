import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ContentApiService } from '../../../core/api/content-api.service';
import { ContentEventDetail } from '../../../core/models/content.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, DatePipe],
  template: `
    <div class="event-detail-page">
      @if (loading()) {
        <div class="container event-skeleton">
          <div class="sk-hero"></div>
          <div class="sk-title"></div>
          <div class="sk-body"></div>
        </div>
      } @else if (!event()) {
        <div class="container not-found">
          <div class="nf-icon">📅</div>
          <h2>Event not found</h2>
          <p>This event may have been removed or is no longer available.</p>
          <a routerLink="/events" class="btn-back">← Back to Events</a>
        </div>
      } @else {
        <div class="event-hero" [style.background-image]="event()!.coverImageUrl ? 'url(' + event()!.coverImageUrl + ')' : ''">
          <div class="hero-overlay">
            <div class="container hero-content">
              <nav class="breadcrumb">
                <a routerLink="/">Home</a>
                <span>/</span>
                <a routerLink="/events">Events</a>
                <span>/</span>
                <span>{{ event()!.titleEn }}</span>
              </nav>
              @if (event()!.isUpcoming) {
                <span class="badge-upcoming">Upcoming Event</span>
              } @else {
                <span class="badge-past">Past Event</span>
              }
              <h1>{{ event()!.titleEn }}</h1>
            </div>
          </div>
        </div>

        <div class="container event-layout">
          <main class="event-main">
            <div class="event-info-grid">
              <div class="info-card">
                <span class="info-icon">📅</span>
                <div>
                  <p class="info-label">Date</p>
                  <p class="info-value">{{ event()!.eventDate | date:'fullDate' }}</p>
                  @if (event()!.endDate) {
                    <p class="info-sub">Ends: {{ event()!.endDate | date:'fullDate' }}</p>
                  }
                </div>
              </div>
              <div class="info-card">
                <span class="info-icon">🕐</span>
                <div>
                  <p class="info-label">Time</p>
                  <p class="info-value">{{ event()!.eventDate | date:'shortTime' }}</p>
                  @if (event()!.endDate) {
                    <p class="info-sub">Until {{ event()!.endDate | date:'shortTime' }}</p>
                  }
                </div>
              </div>
              @if (event()!.location) {
                <div class="info-card">
                  <span class="info-icon">📍</span>
                  <div>
                    <p class="info-label">Location</p>
                    <p class="info-value">{{ event()!.location }}</p>
                  </div>
                </div>
              }
            </div>

            @if (event()!.descriptionEn) {
              <div class="event-description">
                <h2>About This Event</h2>
                <p>{{ event()!.descriptionEn }}</p>
              </div>
            }

            @if (event()!.registrationUrl && event()!.isUpcoming) {
              <div class="register-cta">
                <h3>Ready to attend?</h3>
                <p>Secure your spot today. Registration is free.</p>
                <a [href]="event()!.registrationUrl" target="_blank" rel="noopener" class="btn-register">
                  Register for This Event →
                </a>
              </div>
            }
          </main>

          <aside class="event-sidebar">
            <div class="sidebar-card quick-info">
              <h4>Event Details</h4>
              <ul>
                <li><strong>Date:</strong> {{ event()!.eventDate | date:'mediumDate' }}</li>
                <li><strong>Time:</strong> {{ event()!.eventDate | date:'shortTime' }}</li>
                @if (event()!.location) { <li><strong>Location:</strong> {{ event()!.location }}</li> }
                <li><strong>Status:</strong> {{ event()!.isUpcoming ? 'Upcoming' : 'Completed' }}</li>
              </ul>
              @if (event()!.registrationUrl && event()!.isUpcoming) {
                <a [href]="event()!.registrationUrl" target="_blank" rel="noopener" class="btn-register-sm">
                  Register Now
                </a>
              }
            </div>
            <a routerLink="/events" class="btn-back-events">← All Events</a>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .event-detail-page { min-height: 100vh; background: var(--bg-surface); }
    .event-hero { min-height: 400px; background: linear-gradient(135deg, #312e81 0%, #4338ca 100%); background-size: cover; background-position: center; }
    .hero-overlay { min-height: 400px; background: linear-gradient(to bottom, rgba(0,0,0,.3) 0%, rgba(0,0,0,.6) 100%); padding: 60px 0; display: flex; align-items: flex-end; }
    .hero-content { color: #fff; }
    .breadcrumb { display: flex; gap: 8px; font-size: 13px; color: rgba(255,255,255,.7); margin-bottom: 20px; flex-wrap: wrap; }
    .breadcrumb a { color: rgba(255,255,255,.85); text-decoration: none; }
    .breadcrumb a:hover { color: #fff; }
    .badge-upcoming { display: inline-block; padding: 4px 12px; background: #22c55e; color: #fff; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
    .badge-past { display: inline-block; padding: 4px 12px; background: rgba(255,255,255,.2); color: #fff; border-radius: 20px; font-size: 12px; margin-bottom: 12px; }
    .hero-content h1 { font-size: clamp(1.8rem, 5vw, 2.8rem); font-weight: 700; margin: 0; line-height: 1.2; }
    .event-layout { display: grid; grid-template-columns: 1fr 280px; gap: 48px; padding: 48px 24px; }
    .event-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 36px; }
    .info-card { display: flex; gap: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 16px; align-items: flex-start; }
    .info-icon { font-size: 24px; }
    .info-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); margin: 0 0 4px; }
    .info-value { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }
    .info-sub { font-size: 12px; color: var(--text-muted); margin: 2px 0 0; }
    .event-description { margin-bottom: 36px; }
    .event-description h2 { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }
    .event-description p { font-size: 16px; line-height: 1.8; color: var(--text-secondary); white-space: pre-line; }
    .register-cta { background: linear-gradient(135deg, #312e81 0%, #4338ca 100%); border-radius: 16px; padding: 36px; color: #fff; }
    .register-cta h3 { font-size: 1.4rem; margin: 0 0 8px; }
    .register-cta p { color: rgba(255,255,255,.8); margin: 0 0 20px; }
    .btn-register { display: inline-block; padding: 12px 28px; background: #fff; color: #4338ca; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 15px; transition: transform .2s; }
    .btn-register:hover { transform: translateY(-2px); }
    .event-sidebar { display: flex; flex-direction: column; gap: 16px; }
    .sidebar-card { background: var(--bg-card); border-radius: 12px; padding: 20px; border: 1px solid var(--border); }
    .sidebar-card h4 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }
    .quick-info ul { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-direction: column; gap: 10px; }
    .quick-info li { font-size: 14px; color: var(--text-secondary); }
    .quick-info strong { color: var(--text-primary); }
    .btn-register-sm { display: block; text-align: center; padding: 10px; background: #4338ca; color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
    .btn-back-events { display: block; text-align: center; padding: 10px; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); border-radius: 8px; text-decoration: none; font-size: 14px; }
    .btn-back-events:hover { color: var(--text-primary); }
    .not-found { text-align: center; padding: 120px 20px; }
    .nf-icon { font-size: 64px; margin-bottom: 16px; }
    .not-found h2 { font-size: 1.8rem; color: var(--text-primary); margin-bottom: 8px; }
    .not-found p { color: var(--text-muted); margin-bottom: 24px; }
    .btn-back { display: inline-block; padding: 10px 24px; background: var(--accent); color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .event-skeleton { padding: 48px 24px; }
    .sk-hero { height: 400px; border-radius: 12px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 32px; }
    .sk-title { height: 40px; width: 60%; border-radius: 8px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 24px; }
    .sk-body { height: 300px; border-radius: 8px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @media (max-width: 1024px) { .event-layout { grid-template-columns: 1fr; } .event-sidebar { display: none; } }
  `]
})
export class EventDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ContentApiService);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private destroy$ = new Subject<void>();

  event = signal<ContentEventDetail | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const slug = params.get('slug')!;
      this.loading.set(true);
      this.api.getEventBySlug(slug).subscribe({
        next: r => {
          this.event.set(r.data ?? null);
          if (r.data) this.applyMeta(r.data);
        },
        complete: () => this.loading.set(false)
      });
    });
  }

  private applyMeta(e: ContentEventDetail): void {
    const title = e.metaTitle ?? e.titleEn;
    const desc = e.metaDescription ?? e.descriptionEn ?? '';
    const image = e.coverImageUrl ?? '';
    const url = `${window.location.origin}/event/${e.slug}`;

    this.titleService.setTitle(`${title} | Capital Lab Events`);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'event' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
