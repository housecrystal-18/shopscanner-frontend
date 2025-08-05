import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BlogPost } from '../../components/blog/BlogPost';
import { blogService } from '../../services/blogService';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  
  // Get the post data
  const post = slug ? blogService.getPostBySlug(slug) : null;

  useEffect(() => {
    // Track page view for analytics
    if (post && typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: `${post.title} | Shop Scan Pro Blog`,
        page_location: window.location.href,
      });
    }
  }, [post]);

  // Handle 404 case
  if (!slug || !post) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{post.seoTitle || `${post.title} | Shop Scan Pro Blog`}</title>
        <meta 
          name="description" 
          content={post.seoDescription || post.excerpt} 
        />
        <meta 
          name="keywords" 
          content={post.tags.join(', ')} 
        />
        <meta name="author" content={post.author} />
        <meta name="article:published_time" content={post.publishedAt} />
        {post.updatedAt && <meta name="article:modified_time" content={post.updatedAt} />}
        <meta name="article:section" content={post.category} />
        {post.tags.map(tag => (
          <meta key={tag} name="article:tag" content={tag} />
        ))}
        
        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        {post.coverImage && <meta property="og:image" content={post.coverImage} />}
        <meta property="og:site_name" content="Shop Scan Pro" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        {post.coverImage && <meta name="twitter:image" content={post.coverImage} />}
        
        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />
        
        {/* Structured Data for Article */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.coverImage || `${window.location.origin}/og-image.png`,
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "Shop Scan Pro",
              "url": "https://shop-scan-pro.vercel.app",
              "logo": {
                "@type": "ImageObject",
                "url": `${window.location.origin}/logo.png`
              }
            },
            "datePublished": post.publishedAt,
            "dateModified": post.updatedAt || post.publishedAt,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": window.location.href
            },
            "keywords": post.tags.join(', '),
            "articleSection": post.category,
            "timeRequired": `PT${post.readingTime}M`,
            "url": window.location.href,
            "isPartOf": {
              "@type": "Blog",
              "name": "Shop Scan Pro Blog",
              "url": `${window.location.origin}/blog`
            }
          })}
        </script>
        
        {/* FAQ Structured Data if applicable */}
        {post.slug === 'how-to-spot-dropshipped-products' && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is dropshipping?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Dropshipping is a business model where the seller doesn't keep products in stock. Instead, when a customer makes a purchase, the seller forwards the order to a third-party supplier who ships the product directly to the customer."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How can I identify dropshipped products?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Look for indicators like generic product photos, extremely low prices, long shipping times from overseas, vague product descriptions, and sellers with limited contact information."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are dropshipped products always bad quality?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Not necessarily. While some dropshipped products may be lower quality, the main concerns are usually longer shipping times, potential quality variations, and limited customer service from the actual seller."
                  }
                }
              ]
            })}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BlogPost post={post} />
        </div>
      </div>
    </>
  );
}