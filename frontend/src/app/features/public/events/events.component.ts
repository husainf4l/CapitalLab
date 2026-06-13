import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ContentApiService } from '../../../core/api/content-api.service';
import { ContentEventSummary } from '../../../core/models/content.models';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [RouterLink, CommonModule, DatePipe],
  template: `
    <div class="events-page">
      <section class="page-hero">
        <div class="container">
          <span class="page-tag">Community & Events</span>
          <h1>Upcoming Events</h1>
          <p>Health fairs, workshops, and community health initiatives</p>
        </div>
      </section>

      <section class="content-section container">
        <div class="tab-bar">
          <button [class.active]="tab() === 'upcoming'" (click)="setTab('upcoming')">Upcoming Events</button>
          <button [class.active]="tab() === 'past'" (click)="setTab('past')">Past Events</button>
        </div>

        @if (loading()) {
          <div class="loading-grid">
            @for (i of [1,2,3]; track i) { <div class="skeleton-card"></div> }
          </div>
        } @else if (events().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📅</div>
            <h3>{{ tab() === 'upcoming' ? 'No upcoming events' : 'No past events' }}</h3>
            <p>{{ tab() === 'upcoming' ? 'Stay tuned for future events!' : 'Events history will appear here.' }}</p>
          </div>
        } @else {
          <div class="events-list">
            @for (event of events(); track event.id) {
              <article class="event-card" [routerLink]="['/event', event.slug]">
                <div class="event-date-badge">
                  <span class="date-day">{{ event.eventDate | date:'d' }}</span>
                  <span class="date-month">{{ event.eventDate | date:'MMM' }}</span>
                  <span class="date-year">{{ event.eventDate | date:'y' }}</span>
                </div>
                <div class="event-cover">
                  @if (event.coverImageUrl) {
                    <img [src]="event.coverImageUrl" [alt]="event.titleEn" loading="lazy" />
                  } @else {
                    <div class="image-placeholder"><span>📅</span></div>
                  }
                </div>
                <div class="event-body">
                  <div class="event-header">
                    <h3>{{ event.titleEn }}</h3>
                    @if (event.isUpcoming) {
                      <span class="badge-upcoming">Upcoming</span>
                    } @else {
                      <span class="badge-past">Completed</span>
                    }
                  </div>
                  @if (event.descriptionEn) { <p>{{ event.descriptionEn }}</p> }
                  <div class="event-meta">
                    @if (event.location) {
                      <span class="meta-item"><span class="meta-icon">📍</span> {{ event.location }}</span>
                    }
                    <span class="meta-item">
                      <span class="meta-icon">🕐</span>
                      {{ event.eventDate | date:'shortTime' }}
                      @if (event.endDate) { — {{ event.endDate | date:'shortTime' }} }
                    </span>
                  </div>
                  @if (event.registrationUrl && event.isUpcoming) {
                    <a [href]="event.registrationUrl" target="_blank" rel="noopener" class="btn-register"
                       (click)="$event.stopPropagation()">Register Now</a>
                  }
                </div>
              </article>
            }
          </div>

          @if (hasMore()) {
            <div class="load-more">
              <button class="btn-load" (click)="loadMore()" [disabled]="loadingMore()">
                {{ loadingMore() ? 'Loading...' : 'Load More' }}
              </button>
            </div>
          }
        }
      </section>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .events-page { min-height: 100vh; background: var(--bg-surface); }
    .page-hero { background: linear-gradient(135deg, #312e81 0%, #4338ca 100%); padding: 80px 0 60px; color: #fff; text-align: center; }
    .page-tag { display: inline-block; padding: 4px 14px; background: rgba(255,255,255,.15); border-radius: 20px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px; }
    .page-hero h1 { font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; margin: 0 0 12px; }
    .page-hero p { color: rgba(255,255,255,.75); font-size: 1.1rem; }
    .content-section { padding: 48px 24px; }
    .tab-bar { display: flex; gap: 4px; background: var(--bg-card); border-radius: 10px; padding: 4px; width: fit-content; margin-bottom: 36px; border: 1px solid var(--border); }
    .tab-bar button { padding: 8px 24px; border-radius: 7px; border: none; background: none; cursor: pointer; color: var(--text-secondary); font-size: 14px; transition: all .2s; }
    .tab-bar button.active { background: #4338ca; color: #fff; }
    .events-list { display: flex; flex-direction: column; gap: 20px; }
    .event-card { display: grid; grid-template-columns: 80px 200px 1fr; gap: 0; background: var(--bg-card); border-radius: 12px; overflow: hidden; cursor: pointer; transition: box-shadow .2s; border: 1px solid var(--border); }
    .event-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.1); }
    .event-date-badge { display: flex; flex-direction: column; align-items: center; justify-content: center; background: #4338ca; color: #fff; padding: 16px 8px; }
    .date-day { font-size: 28px; font-weight: 700; line-height: 1; }
    .date-month { font-size: 13px; text-transform: uppercase; letter-spacing: .05em; }
    .date-year { font-size: 11px; opacity: .8; margin-top: 2px; }
    .event-cover { height: 160px; overflow: hidden; }
    .event-cover img { width: 100%; height: 100%; object-fit: cover; }
    .image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; background: linear-gradient(135deg, #ede9fe, #ddd6fe); }
    .event-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 8px; }
    .event-header { display: flex; align-items: flex-start; gap: 12px; }
    .event-body h3 { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); flex: 1; margin: 0; }
    .badge-upcoming { padding: 3px 10px; background: #dcfce7; color: #166534; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .badge-past { padding: 3px 10px; background: var(--bg-surface); color: var(--text-muted); border-radius: 12px; font-size: 11px; white-space: nowrap; }
    .event-body p { color: var(--text-secondary); font-size: 14px; line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .event-meta { display: flex; gap: 16px; flex-wrap: wrap; }
    .meta-item { font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
    .meta-icon { font-size: 14px; }
    .btn-register { display: inline-block; padding: 8px 20px; background: #4338ca; color: #fff; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; transition: background .2s; width: fit-content; margin-top: 4px; }
    .btn-register:hover { background: #3730a3; }
    .loading-grid { display: flex; flex-direction: column; gap: 20px; }
    .skeleton-card { height: 160px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty-state { text-align: center; padding: 80px 20px; color: var(--text-muted); }
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.4rem; color: var(--text-primary); margin-bottom: 8px; }
    .load-more { text-align: center; margin-top: 48px; }
    .btn-load { padding: 12px 36px; border: 2px solid #4338ca; border-radius: 8px; background: none; color: #4338ca; font-size: 15px; cursor: pointer; transition: all .2s; }
    .btn-load:hover:not(:disabled) { background: #4338ca; color: #fff; }
    .btn-load:disabled { opacity: .5; cursor: not-allowed; }
    @media (max-width: 768px) { .event-card { grid-template-columns: 70px 1fr; } .event-cover { display: none; } }
  `]
})
export class EventsComponent implements OnInit {
  private api = inject(ContentApiService);

  events = signal<ContentEventSummary[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  tab = signal<'upcoming' | 'past'>('upcoming');
  private page = 1;
  hasMore = signal(false);

  ngOnInit() { this.loadEvents(true); }

  setTab(t: 'upcoming' | 'past') {
    this.tab.set(t);
    this.loadEvents(true);
  }

  loadMore() {
    this.page++;
    this.loadEvents(false);
  }

  private loadEvents(reset: boolean) {
    if (reset) { this.page = 1; this.loading.set(true); }
    else this.loadingMore.set(true);

    this.api.getEvents({ page: this.page, pageSize: 10, upcoming: this.tab() === 'upcoming' }).subscribe({
      next: r => {
        const items = r.data?.items ?? [];
        this.events.set(reset ? items : [...this.events(), ...items]);
        this.hasMore.set((r.data?.totalCount ?? 0) > this.events().length);
      },
      complete: () => { this.loading.set(false); this.loadingMore.set(false); }
    });
  }
}
