/**
 * Design color tokens — single source of truth for colors used in TypeScript
 * (chart configs, KPI card arrays, inline style bindings).
 * SCSS/CSS equivalents live in styles/_variables.scss and styles.scss :root.
 */

export const ColorTokens = {
  // Brand
  primary:     '#1e9df1',
  googleBlue:  '#1a73e8',
  teal:        '#0d9488',
  purple:      '#8b5cf6',
  indigo:      '#4f46e5',
  pink:        '#ec4899',
  emerald:     '#10b981',
  cyan:        '#06b6d4',
  amber:       '#f59e0b',
  slate:       '#64748b',
  green600:    '#16a34a',
  green500:    '#22c55e',
  orange:      '#f97316',
  red600:      '#dc2626',

  // Core semantic
  danger:      '#f4212e',
  success:     '#00b87a',
  warning:     '#f7b928',

  // Chart palette (chart-1 … chart-5 from :root)
  chart1:      '#1e9df1',
  chart2:      '#00b87a',
  chart3:      '#f7b928',
  chart4:      '#17bf63',
  chart5:      '#e0245e',
} as const;

export type ColorToken = keyof typeof ColorTokens;
