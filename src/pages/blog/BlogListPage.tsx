import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { BookOpen, TrendingUp, Users } from 'lucide-react';
import { BlogList } from '../../components/blog/BlogList';
import { blogService } from '../../services/blogService';

export function BlogListPage() {
  const posts = blogService.getAllPosts();
  const categories = blogService.getCategories();

  useEffect(() => {
    // Track page view for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: 'Blog - Shop Scan Pro',
        page_location: window.location.href,
      });
    }
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>E-commerce Education Blog | Shop Scan Pro</title>
        <meta 
          name="description" 
          content="Learn how to identify authentic products, avoid dropshipped items, and shop safely online. Educational resources for smart e-commerce consumers." 
        />
        <meta 
          name="keywords" 
          content="dropshipping detection, product authenticity, online shopping safety, e-commerce education, counterfeit products, handmade vs mass produced" 
        />
        <meta property="og:title" content="E-commerce Education Blog | Shop Scan Pro" />
        <meta 
          property="og:description" 
          content="Learn how to identify authentic products, avoid dropshipped items, and shop safely online." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
        
        {/* Structured Data for Blog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Shop Scan Pro Blog",
            "description": "Educational resources for smart e-commerce consumers",
            "url": window.location.href,
            "publisher": {
              "@type": "Organization",
              "name": "Shop Scan Pro",
              "url": "https://shop-scan-pro.vercel.app"
            },
            "blogPost": posts.slice(0, 5).map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "datePublished": post.publishedAt,
              "dateModified": post.updatedAt || post.publishedAt,
              "author": {
                "@type": "Person",
                "name": post.author
              },
              "url": `${window.location.origin}/blog/${post.slug}`
            }))
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white/10 p-4 rounded-full">
                  <BookOpen className="h-12 w-12" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                E-commerce Education Hub
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
                Learn how to identify authentic products, avoid dropshipped items, 
                and make informed purchasing decisions in the digital marketplace.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="h-6 w-6 mr-2" />
                    <span className="text-2xl font-bold">{posts.length}</span>
                  </div>
                  <p className="text-blue-100">Educational Articles</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-6 w-6 mr-2" />
                    <span className="text-2xl font-bold">{categories.length}</span>
                  </div>
                  <p className="text-blue-100">Categories</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 mr-2" />
                    <span className="text-2xl font-bold">Free</span>
                  </div>
                  <p className="text-blue-100">Always Free</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Mission Statement */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Educational Mission
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                We believe that informed consumers make better purchasing decisions. Our blog provides 
                educational content to help you understand e-commerce patterns, identify product authenticity 
                indicators, and navigate the online marketplace with confidence. All content is provided 
                for educational purposes to promote consumer awareness and smart shopping practices.
              </p>
            </div>
          </div>

          {/* Blog Content */}
          <BlogList posts={posts} categories={categories} />

          {/* Call to Action */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Put Your Knowledge to Practice?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Use our free tools to analyze products and stores based on the principles you've learned.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/scan"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Try Product Scanner
              </a>
              <a
                href="/analyze"
                className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
              >
                Analyze Store URL
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}