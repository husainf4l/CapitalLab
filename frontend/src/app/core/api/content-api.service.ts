import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';
import {
  ContentCategory, ContentCategoryDetail, ContentAuthor, ContentAuthorDetail, ContentTag,
  ContentPostSummary, ContentPostDetail,
  ContentEventSummary, ContentEventDetail,
  ContentSearchResult, ContentFaqItem, NewsletterSubscriber, ContentAnalytics,
  CreateContentPostRequest, UpdateContentPostRequest,
  CreateContentCategoryRequest, CreateContentAuthorRequest,
  CreateContentEventRequest, CreateFaqItemRequest, UpdateFaqItemRequest,
  SubscribeNewsletterRequest,
  ContentPostType,
} from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class ContentApiService {
  private http = inject(HttpClient);
  private publicUrl = `${environment.apiUrl}/content`;
  private adminUrl = `${environment.apiUrl}/content/admin`;

  // ── Public API ──────────────────────────────────────────────────────────────

  getPosts(params: {
    page?: number; pageSize?: number; search?: string;
    type?: ContentPostType; categoryId?: string; featured?: boolean;
  } = {}): Observable<ApiResponse<PaginatedResponse<ContentPostSummary>>> {
    let p = new HttpParams();
    if (params.page)       p = p.set('page', params.page);
    if (params.pageSize)   p = p.set('pageSize', params.pageSize);
    if (params.search)     p = p.set('search', params.search);
    if (params.type)       p = p.set('type', params.type);
    if (params.categoryId) p = p.set('categoryId', params.categoryId);
    if (params.featured != null) p = p.set('featured', params.featured);
    return this.http.get<ApiResponse<PaginatedResponse<ContentPostSummary>>>(`${this.publicUrl}/posts`, { params: p });
  }

  getPostBySlug(slug: string): Observable<ApiResponse<ContentPostDetail>> {
    return this.http.get<ApiResponse<ContentPostDetail>>(`${this.publicUrl}/posts/${slug}`);
  }

  getEvents(params: { page?: number; pageSize?: number; upcoming?: boolean } = {}): Observable<ApiResponse<PaginatedResponse<ContentEventSummary>>> {
    let p = new HttpParams();
    if (params.page)     p = p.set('page', params.page);
    if (params.pageSize) p = p.set('pageSize', params.pageSize);
    if (params.upcoming != null) p = p.set('upcoming', params.upcoming);
    return this.http.get<ApiResponse<PaginatedResponse<ContentEventSummary>>>(`${this.publicUrl}/events`, { params: p });
  }

  getEventBySlug(slug: string): Observable<ApiResponse<ContentEventDetail>> {
    return this.http.get<ApiResponse<ContentEventDetail>>(`${this.publicUrl}/events/${slug}`);
  }

  getCategories(): Observable<ApiResponse<ContentCategory[]>> {
    return this.http.get<ApiResponse<ContentCategory[]>>(`${this.publicUrl}/categories`);
  }

  getTags(): Observable<ApiResponse<ContentTag[]>> {
    return this.http.get<ApiResponse<ContentTag[]>>(`${this.publicUrl}/tags`);
  }

  getAuthorBySlug(slug: string): Observable<ApiResponse<ContentAuthorDetail>> {
    return this.http.get<ApiResponse<ContentAuthorDetail>>(`${this.publicUrl}/authors/${slug}`);
  }

  getCategoryBySlug(slug: string): Observable<ApiResponse<ContentCategoryDetail>> {
    return this.http.get<ApiResponse<ContentCategoryDetail>>(`${this.publicUrl}/categories/${slug}`);
  }

  getPopularPosts(limit = 5, type?: ContentPostType): Observable<ApiResponse<ContentPostSummary[]>> {
    let p = new HttpParams().set('limit', limit);
    if (type) p = p.set('type', type);
    return this.http.get<ApiResponse<ContentPostSummary[]>>(`${this.publicUrl}/posts/popular`, { params: p });
  }

  getFaq(category?: string): Observable<ApiResponse<ContentFaqItem[]>> {
    let p = new HttpParams();
    if (category) p = p.set('category', category);
    return this.http.get<ApiResponse<ContentFaqItem[]>>(`${this.publicUrl}/faq`, { params: p });
  }

  subscribe(req: SubscribeNewsletterRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.publicUrl}/newsletter/subscribe`, req);
  }

  search(q: string, limit = 10): Observable<ApiResponse<ContentSearchResult[]>> {
    const params = new HttpParams().set('q', q).set('limit', limit);
    return this.http.get<ApiResponse<ContentSearchResult[]>>(`${this.publicUrl}/search`, { params });
  }

  // ── Admin: Posts ─────────────────────────────────────────────────────────────

  adminGetPosts(params: {
    page?: number; pageSize?: number; type?: ContentPostType;
    categoryId?: string; published?: boolean; featured?: boolean;
  } = {}): Observable<ApiResponse<PaginatedResponse<ContentPostSummary>>> {
    let p = new HttpParams();
    if (params.page)       p = p.set('page', params.page);
    if (params.pageSize)   p = p.set('pageSize', params.pageSize);
    if (params.type)       p = p.set('type', params.type);
    if (params.categoryId) p = p.set('categoryId', params.categoryId);
    if (params.published != null) p = p.set('published', params.published);
    if (params.featured != null)  p = p.set('featured', params.featured);
    return this.http.get<ApiResponse<PaginatedResponse<ContentPostSummary>>>(`${this.adminUrl}/posts`, { params: p });
  }

  adminGetPostBySlug(slug: string): Observable<ApiResponse<ContentPostDetail>> {
    return this.http.get<ApiResponse<ContentPostDetail>>(`${this.adminUrl}/posts/${slug}`);
  }

  createPost(req: CreateContentPostRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.adminUrl}/posts`, req);
  }

  updatePost(id: string, req: UpdateContentPostRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.adminUrl}/posts/${id}`, req);
  }

  deletePost(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.adminUrl}/posts/${id}`);
  }

  publishPost(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.adminUrl}/posts/${id}/publish`, {});
  }

  unpublishPost(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.adminUrl}/posts/${id}/unpublish`, {});
  }

  featurePost(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.adminUrl}/posts/${id}/feature`, {});
  }

  unfeaturePost(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.adminUrl}/posts/${id}/unfeature`, {});
  }

  // ── Admin: Categories ────────────────────────────────────────────────────────

  adminGetCategories(): Observable<ApiResponse<ContentCategory[]>> {
    return this.http.get<ApiResponse<ContentCategory[]>>(`${this.adminUrl}/categories`);
  }

  createCategory(req: CreateContentCategoryRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.adminUrl}/categories`, req);
  }

  updateCategory(id: string, req: CreateContentCategoryRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.adminUrl}/categories/${id}`, req);
  }

  deleteCategory(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.adminUrl}/categories/${id}`);
  }

  // ── Admin: Authors ────────────────────────────────────────────────────────────

  adminGetAuthors(): Observable<ApiResponse<ContentAuthor[]>> {
    return this.http.get<ApiResponse<ContentAuthor[]>>(`${this.adminUrl}/authors`);
  }

  createAuthor(req: CreateContentAuthorRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.adminUrl}/authors`, req);
  }

  updateAuthor(id: string, req: CreateContentAuthorRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.adminUrl}/authors/${id}`, req);
  }

  deleteAuthor(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.adminUrl}/authors/${id}`);
  }

  // ── Admin: Tags ───────────────────────────────────────────────────────────────

  adminGetTags(): Observable<ApiResponse<ContentTag[]>> {
    return this.http.get<ApiResponse<ContentTag[]>>(`${this.adminUrl}/tags`);
  }

  createTag(req: { name: string; slug: string }): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.adminUrl}/tags`, req);
  }

  deleteTag(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.adminUrl}/tags/${id}`);
  }

  // ── Admin: Analytics ─────────────────────────────────────────────────────────

  getAnalytics(): Observable<ApiResponse<ContentAnalytics>> {
    return this.http.get<ApiResponse<ContentAnalytics>>(`${this.adminUrl}/analytics`);
  }

  // ── Admin: Newsletter ─────────────────────────────────────────────────────────

  adminGetSubscribers(params: { page?: number; pageSize?: number; unsubscribed?: boolean } = {}): Observable<ApiResponse<PaginatedResponse<NewsletterSubscriber>>> {
    let p = new HttpParams();
    if (params.page)     p = p.set('page', params.page);
    if (params.pageSize) p = p.set('pageSize', params.pageSize);
    if (params.unsubscribed != null) p = p.set('unsubscribed', params.unsubscribed);
    return this.http.get<ApiResponse<PaginatedResponse<NewsletterSubscriber>>>(`${this.adminUrl}/newsletter`, { params: p });
  }

  exportSubscribersCsv(): Observable<Blob> {
    return this.http.get(`${this.adminUrl}/newsletter/export`, { responseType: 'blob' });
  }

  deleteSubscriber(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.adminUrl}/newsletter/${id}`);
  }

  // ── Admin: FAQ ────────────────────────────────────────────────────────────────

  adminGetFaq(): Observable<ApiResponse<ContentFaqItem[]>> {
    return this.http.get<ApiResponse<ContentFaqItem[]>>(`${this.adminUrl}/faq`);
  }

  createFaqItem(req: CreateFaqItemRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.adminUrl}/faq`, req);
  }

  updateFaqItem(id: string, req: UpdateFaqItemRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.adminUrl}/faq/${id}`, req);
  }

  deleteFaqItem(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.adminUrl}/faq/${id}`);
  }

  toggleFaqItem(id: string, active: boolean): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.adminUrl}/faq/${id}/toggle?active=${active}`, {});
  }

  // ── Admin: Events ─────────────────────────────────────────────────────────────

  adminGetEvents(params: { page?: number; pageSize?: number; upcoming?: boolean } = {}): Observable<ApiResponse<PaginatedResponse<ContentEventSummary>>> {
    let p = new HttpParams();
    if (params.page)     p = p.set('page', params.page);
    if (params.pageSize) p = p.set('pageSize', params.pageSize);
    if (params.upcoming != null) p = p.set('upcoming', params.upcoming);
    return this.http.get<ApiResponse<PaginatedResponse<ContentEventSummary>>>(`${this.adminUrl}/events`, { params: p });
  }

  createEvent(req: CreateContentEventRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.adminUrl}/events`, req);
  }

  updateEvent(id: string, req: CreateContentEventRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.adminUrl}/events/${id}`, req);
  }

  deleteEvent(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.adminUrl}/events/${id}`);
  }

  publishEvent(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.adminUrl}/events/${id}/publish`, {});
  }

  unpublishEvent(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.adminUrl}/events/${id}/unpublish`, {});
  }
}
