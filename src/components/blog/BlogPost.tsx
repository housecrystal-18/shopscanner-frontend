import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Tag,
  User,
  BookOpen
} from 'lucide-react';
import { BlogPost as BlogPostType } from '../../types/blog';

interface BlogPostProps {
  post: BlogPostType;
}

export function BlogPost({ post }: BlogPostProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back to Blog Link */}
      <div className="mb-8">
        <Link
          to="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        {/* Category */}
        <div className="flex items-center mb-4">
          <Tag className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-blue-600 text-sm font-medium">{post.category}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span>By {post.author}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>{post.readingTime} min read</span>
          </div>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            <span>Educational Content</span>
          </div>
        </div>

        {/* Share Button */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={handleShare}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>

        {/* Last Updated */}
        {post.updatedAt && post.updatedAt !== post.publishedAt && (
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {new Date(post.updatedAt).toLocaleDateString()}
          </div>
        )}
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-8">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-lg max-w-none mb-12">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            // Custom styling for markdown elements
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 leading-relaxed mb-4">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-6">
                {children}
              </blockquote>
            ),
            code: ({ children, className }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm">
                    {children}
                  </code>
                );
              }
              return (
                <code className={className}>
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6">
                {children}
              </pre>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-600 hover:text-blue-800 underline"
                target={href?.startsWith('http') ? '_blank' : '_self'}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Affiliate Disclosure */}
      {post.affiliateDisclosure && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Affiliate Disclosure
          </h3>
          <p className="text-yellow-800">
            This post may contain affiliate links. When you click on these links and make a purchase, 
            we may earn a commission at no extra cost to you. This helps support our educational 
            content and allows us to continue providing valuable insights about e-commerce and online shopping safety.
          </p>
        </div>
      )}

      {/* Educational Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Educational Purpose
        </h3>
        <p className="text-blue-800">
          This content is provided for educational purposes to help consumers make informed decisions 
          when shopping online. The information presented is based on common patterns and indicators, 
          and individual results may vary. Always use your best judgment when making purchasing decisions.
        </p>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Want to analyze products yourself?
        </h3>
        <p className="text-gray-700 mb-6">
          Use our free tools to analyze any product or store for authenticity and quality indicators.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/scan"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Try Product Scanner
          </Link>
          <Link
            to="/analyze"
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
          >
            Analyze Store URL
          </Link>
        </div>
      </div>
    </article>
  );
}