export type ContentPostType = 'News' | 'Blog' | 'Promotion' | 'Announcement';

export interface ContentCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  postCount: number;
}

export interface ContentAuthor {
  id: string;
  fullName: string;
  slug: string;
  jobTitle?: string;
  credentials?: string;
  bio?: string;
  imageUrl?: string;
  isActive: boolean;
  postCount: number;
}

export interface ContentAuthorDetail extends ContentAuthor {
  recentPosts: ContentPostSummary[];
}

export interface ContentTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface ContentPostSummary {
  id: string;
  type: ContentPostType;
  titleEn: string;
  titleAr: string;
  summaryEn?: string;
  summaryAr?: string;
  slug: string;
  thumbnailUrl?: string;
  featuredImageUrl?: string;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  readingTimeMinutes: number;
  categoryNameEn?: string;
  categoryNameAr?: string;
  categorySlug?: string;
  authorName?: string;
  authorImageUrl?: string;
  tags: string[];
}

export interface ContentCategoryDetail extends ContentCategory {
  featuredPosts: ContentPostSummary[];
  recentPosts: ContentPostSummary[];
}

export interface ContentPostDetail {
  id: string;
  type: ContentPostType;
  titleEn: string;
  titleAr: string;
  summaryEn?: string;
  summaryAr?: string;
  contentEn: string;
  contentAr: string;
  slug: string;
  featuredImageUrl?: string;
  thumbnailUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt?: string;
  expiryDate?: string;
  viewCount: number;
  readingTimeMinutes: number;
  categoryId?: string;
  categoryNameEn?: string;
  categoryNameAr?: string;
  categorySlug?: string;
  authorId?: string;
  authorName?: string;
  authorJobTitle?: string;
  authorBio?: string;
  authorImageUrl?: string;
  tags: ContentTag[];
  relatedPosts: ContentPostSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentPostSummaryWithSchedule extends ContentPostSummary {
  publishAt?: string;
}

export interface ContentEventSummary {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  slug: string;
  eventDate: string;
  endDate?: string;
  location?: string;
  coverImageUrl?: string;
  registrationUrl?: string;
  isPublished: boolean;
  isUpcoming: boolean;
  viewCount: number;
}

export interface ContentEventDetail {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  slug: string;
  eventDate: string;
  endDate?: string;
  location?: string;
  coverImageUrl?: string;
  registrationUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  isUpcoming: boolean;
  viewCount: number;
  createdAt: string;
}

export interface ContentSearchResult {
  type: string;
  id: string;
  titleEn: string;
  titleAr: string;
  summaryEn?: string;
  slug: string;
  thumbnailUrl?: string;
  publishedAt?: string;
}

export interface ContentFaqItem {
  id: string;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  category?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  language: string;
  isConfirmed: boolean;
  isUnsubscribed: boolean;
  createdAt: string;
}

export interface ContentAnalytics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalEvents: number;
  upcomingEvents: number;
  totalViews: number;
  totalSubscribers: number;
  activeSubscribers: number;
  topPosts: ContentPostSummary[];
  topCategories: ContentCategory[];
}

// Admin request types
export interface CreateContentPostRequest {
  type: ContentPostType;
  categoryId?: string;
  authorId?: string;
  titleEn: string;
  titleAr: string;
  summaryEn?: string;
  summaryAr?: string;
  contentEn: string;
  contentAr: string;
  slug: string;
  featuredImageUrl?: string;
  thumbnailUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  expiryDate?: string;
  tagIds?: string[];
}

export type UpdateContentPostRequest = CreateContentPostRequest;

export interface CreateContentCategoryRequest {
  nameEn: string;
  nameAr: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface CreateContentAuthorRequest {
  fullName: string;
  slug: string;
  jobTitle?: string;
  credentials?: string;
  bio?: string;
  imageUrl?: string;
}

export interface CreateFaqItemRequest {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  category?: string;
  sortOrder: number;
}

export type UpdateFaqItemRequest = CreateFaqItemRequest;

export interface SubscribeNewsletterRequest {
  email: string;
  language?: string;
}

export interface CreateContentEventRequest {
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  slug: string;
  eventDate: string;
  endDate?: string;
  location?: string;
  coverImageUrl?: string;
  registrationUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}
