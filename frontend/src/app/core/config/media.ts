/**
 * CAPITAL LAB — MEDIA REGISTRY
 *
 * All images and videos used across the app live here.
 *
 * HOW TO ADD A FILE
 * ─────────────────
 * 1. Drop the file into the matching folder under /frontend/public/
 *
 *    public/
 *    ├── images/
 *    │   ├── hero/          ← homepage hero section
 *    │   ├── about/         ← about page & about section
 *    │   ├── team/          ← staff / doctor photos
 *    │   ├── branches/      ← branch photos
 *    │   ├── services/      ← service illustrations
 *    │   └── packages/      ← package thumbnails
 *    └── videos/            ← promo / background videos
 *
 * 2. Add the path string below (starts with /).
 *
 * HOW TO USE IN A COMPONENT
 * ─────────────────────────
 *    import { MEDIA } from '../../../core/config/media';
 *
 *    // in template:
 *    <img [src]="MEDIA.hero.labPhoto" alt="Lab" />
 *    <video [src]="MEDIA.videos.heroBg" autoplay muted loop></video>
 */

export const MEDIA = {

  // ── Hero section ───────────────────────────────────────────────────────────
  hero: {
    labPhotoWebp:     '/images/hero/hero.webp',   // 283 KB — served to modern browsers
    labPhoto:         '/images/hero/hero.jpg',    // 1.2 MB  — fallback for older browsers

    // Optional: full-screen background video behind hero (MP4 / WebM)
    bgVideo:          '/videos/hero-bg.mp4',
    bgVideoWebm:      '/videos/hero-bg.webm',
  },

  // ── About section ──────────────────────────────────────────────────────────
  about: {
    // Main about image — ideal: 800 × 800 px
    mainPhoto:        '/images/about/main.jpg',

    // Interior lab shots
    lab1:             '/images/about/lab-interior-1.jpg',
    lab2:             '/images/about/lab-interior-2.jpg',
  },

  // ── Team / Doctors ─────────────────────────────────────────────────────────
  team: {
    // Add one entry per staff member: { photo: '/images/team/name.jpg' }
    placeholder:      '/images/team/placeholder.jpg',
  },

  // ── Branch photos ──────────────────────────────────────────────────────────
  branches: {
    // One photo per branch — name it after the branch slug
    riyadhMain:       '/images/branches/riyadh-main.jpg',
    jeddah:           '/images/branches/jeddah.jpg',
    dammam:           '/images/branches/dammam.jpg',
  },

  // ── Service illustrations ──────────────────────────────────────────────────
  services: {
    bloodTests:       '/images/services/blood-tests.jpg',
    hormones:         '/images/services/hormones.jpg',
    diabetes:         '/images/services/diabetes.jpg',
    vitamins:         '/images/services/vitamins.jpg',
    cardiac:          '/images/services/cardiac.jpg',
    wellness:         '/images/services/wellness.jpg',
  },

  // ── Package thumbnails ─────────────────────────────────────────────────────
  packages: {
    // Optional: override the gradient header with a real photo
    thumbnail:        '/images/packages/thumbnail.jpg',
  },

  // ── Videos ─────────────────────────────────────────────────────────────────
  videos: {
    // Promo video shown on home / about page (MP4 + WebM for cross-browser)
    promo:            '/videos/capital-lab-promo.mp4',
    promoWebm:        '/videos/capital-lab-promo.webm',

    // Silent looping background video for hero (optional)
    heroBg:           '/videos/hero-bg.mp4',
    heroBgWebm:       '/videos/hero-bg.webm',
  },

  // ── Logo variants ──────────────────────────────────────────────────────────
  logo: {
    main:             '/images/logo.svg',
    white:            '/images/logo-white.svg',
    favicon:          '/favicon.ico',
  },

} as const;

// Type helper — lets you autocomplete MEDIA keys in templates
export type MediaKey = typeof MEDIA;
