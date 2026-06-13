import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-social-share',
  standalone: true,
  template: `
    <div class="social-share">
      <span class="share-label">Share:</span>
      <div class="share-buttons">
        <a [href]="facebookUrl" target="_blank" rel="noopener" class="share-btn facebook" title="Share on Facebook">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a [href]="linkedinUrl" target="_blank" rel="noopener" class="share-btn linkedin" title="Share on LinkedIn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a [href]="xUrl" target="_blank" rel="noopener" class="share-btn x-twitter" title="Share on X">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a [href]="whatsappUrl" target="_blank" rel="noopener" class="share-btn whatsapp" title="Share on WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .social-share { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .share-label { font-size: 0.875rem; font-weight: 500; color: var(--text-secondary, #64748b); white-space: nowrap; }
    .share-buttons { display: flex; gap: 8px; }
    .share-btn {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 50%;
      color: white; text-decoration: none; transition: transform 0.2s, opacity 0.2s;
      &:hover { transform: scale(1.1); opacity: 0.9; }
    }
    .facebook  { background: #1877f2; }
    .linkedin  { background: #0a66c2; }
    .x-twitter { background: #000; }
    .whatsapp  { background: #25d366; }
  `]
})
export class SocialShareComponent {
  @Input() url = '';
  @Input() title = '';

  get encodedUrl() { return encodeURIComponent(this.url || window.location.href); }
  get encodedTitle() { return encodeURIComponent(this.title); }

  get facebookUrl() { return `https://www.facebook.com/sharer/sharer.php?u=${this.encodedUrl}`; }
  get linkedinUrl() { return `https://www.linkedin.com/sharing/share-offsite/?url=${this.encodedUrl}`; }
  get xUrl() { return `https://twitter.com/intent/tweet?url=${this.encodedUrl}&text=${this.encodedTitle}`; }
  get whatsappUrl() { return `https://wa.me/?text=${this.encodedTitle}%20${this.encodedUrl}`; }
}
