export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  category: string;
  readingTime: number;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string;
  affiliateDisclosure?: boolean;
}

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  postCount: number;
}

export interface BlogMeta {
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  category: string;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string;
  affiliateDisclosure?: boolean;
}