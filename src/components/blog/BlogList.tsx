import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, TrendingUp } from 'lucide-react';
import { BlogCard } from './BlogCard';
import { BlogPost, BlogCategory } from '../../types/blog';

interface BlogListProps {
  posts: BlogPost[];
  categories: BlogCategory[];
}

export function BlogList({ posts, categories }: BlogListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Sort posts
    filtered.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      } else {
        // For 'popular', we'll use reading time as a proxy (shorter = more accessible = potentially more popular)
        return a.readingTime - b.readingTime;
      }
    });

    return filtered;
  }, [posts, searchTerm, selectedCategory, sortBy]);

  // Separate featured posts
  const featuredPosts = filteredAndSortedPosts.filter(post => post.featured).slice(0, 1);
  const regularPosts = filteredAndSortedPosts.filter(post => !post.featured);

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[160px]"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.slug} value={category.name}>
                  {category.name} ({category.postCount})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSortBy('latest')}
              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'latest'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Latest
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'popular'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Popular
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredAndSortedPosts.length === 0 ? (
            'No posts found matching your criteria.'
          ) : (
            `Showing ${filteredAndSortedPosts.length} ${filteredAndSortedPosts.length === 1 ? 'post' : 'posts'}`
          )}
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
          <div className="grid grid-cols-1 gap-8">
            {featuredPosts.map(post => (
              <BlogCard key={post.slug} post={post} featured={true} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Posts */}
      {regularPosts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {featuredPosts.length > 0 ? 'Latest Posts' : 'All Posts'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map(post => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or category filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}