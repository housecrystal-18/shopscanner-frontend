import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import { BlogPost } from '../../types/blog';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const CardComponent = featured ? 'div' : 'div';
  
  return (
    <CardComponent className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
      featured ? 'md:col-span-2 lg:col-span-3' : ''
    }`}>
      {post.coverImage && (
        <div className={`relative ${featured ? 'h-64 md:h-80' : 'h-48'}`}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          {featured && (
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className={`p-6 ${featured ? 'md:p-8' : ''}`}>
        {/* Category */}
        <div className="flex items-center mb-3">
          <Tag className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-blue-600 text-sm font-medium">{post.category}</span>
        </div>
        
        {/* Title */}
        <h3 className={`font-bold text-gray-900 mb-3 line-clamp-2 ${
          featured ? 'text-2xl md:text-3xl' : 'text-xl'
        }`}>
          <Link 
            to={`/blog/${post.slug}`}
            className="hover:text-blue-600 transition-colors duration-200"
          >
            {post.title}
          </Link>
        </h3>
        
        {/* Excerpt */}
        <p className={`text-gray-600 mb-4 line-clamp-3 ${
          featured ? 'text-lg' : 'text-base'
        }`}>
          {post.excerpt}
        </p>
        
        {/* Meta information */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>
          <span className="text-gray-600">By {post.author}</span>
        </div>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-gray-500 text-xs">+{post.tags.length - 3} more</span>
            )}
          </div>
        )}
        
        {/* Read more link */}
        <Link
          to={`/blog/${post.slug}`}
          className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200"
        >
          Read more
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      {/* Affiliate disclosure */}
      {post.affiliateDisclosure && (
        <div className="px-6 pb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Disclosure:</strong> This post may contain affiliate links. We earn a commission if you make a purchase through these links, at no extra cost to you.
            </p>
          </div>
        </div>
      )}
    </CardComponent>
  );
}