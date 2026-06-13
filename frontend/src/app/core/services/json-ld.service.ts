import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class JsonLdService {
  private doc = inject(DOCUMENT);

  setSchema(schema: Record<string, unknown> | Record<string, unknown>[]): void {
    this.removeSchema();
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'app-json-ld';
    script.textContent = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  removeSchema(): void {
    const existing = this.doc.getElementById('app-json-ld');
    if (existing) existing.remove();
  }

  articleSchema(data: {
    title: string; description?: string; imageUrl?: string;
    author?: string; publishedAt?: string; updatedAt?: string;
    url: string; keywords?: string;
  }): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title,
      description: data.description,
      image: data.imageUrl,
      author: data.author ? { '@type': 'Person', name: data.author } : undefined,
      datePublished: data.publishedAt,
      dateModified: data.updatedAt,
      url: data.url,
      keywords: data.keywords,
      publisher: this.organizationSchema(),
    };
  }

  blogPostingSchema(data: {
    title: string; description?: string; imageUrl?: string;
    author?: string; publishedAt?: string; url: string;
  }): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: data.title,
      description: data.description,
      image: data.imageUrl,
      author: data.author ? { '@type': 'Person', name: data.author } : undefined,
      datePublished: data.publishedAt,
      url: data.url,
      publisher: this.organizationSchema(),
    };
  }

  eventSchema(data: {
    name: string; description?: string; startDate: string;
    endDate?: string; location?: string; imageUrl?: string;
    url: string; registrationUrl?: string;
  }): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location ? { '@type': 'Place', name: data.location } : undefined,
      image: data.imageUrl,
      url: data.url,
      offers: data.registrationUrl ? {
        '@type': 'Offer', url: data.registrationUrl, availability: 'https://schema.org/InStock'
      } : undefined,
      organizer: this.organizationSchema(),
    };
  }

  breadcrumbSchema(items: { name: string; url: string }[]): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  faqSchema(items: { question: string; answer: string }[]): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    };
  }

  organizationSchema(): Record<string, unknown> {
    return {
      '@type': 'MedicalOrganization',
      name: 'Capital Lab',
      '@id': 'https://capitallab.com/#organization',
    };
  }
}
