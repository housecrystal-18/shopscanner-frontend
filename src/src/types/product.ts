// src/types/product.ts

export interface StoreOffer {
  name: string;
  price?: number | null;
  url?: string | null;
  lastChecked?: string | null;
}

export interface ProductImage {
  url: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface Product {
  id: string;
  title: string;

  // Optional fields used by UI
  imageUrl?: string | null;            // single primary image
  images?: ProductImage[] | null;      // gallery
  stores?: StoreOffer[] | null;        // offers across stores

  // Common metadata
  brand?: string | null;
  description?: string | null;
  upc?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  // Allow extra backend fields without breaking the build
  [key: string]: unknown;
}

/** Helper to safely get a primary image */
export function getPrimaryImage(p: Product, fallback = '/icons/icon-192x192.png'): string {
  return (
    (p.imageUrl ?? undefined) ||
    (Array.isArray(p.images) && p.images.length > 0 ? p.images[0]?.url : undefined) ||
    fallback
  );
}
