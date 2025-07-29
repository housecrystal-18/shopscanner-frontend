import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Ticket,
  Book,
  Search,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { ContactForm } from '../components/support/ContactForm';
import { SupportTickets } from '../components/support/SupportTickets';

const HELP_CATEGORIES = [
  {
    title: 'Getting Started',
    icon: Book,
    articles: [
      { title: 'How to scan your first product', url: '/help/first-scan' },
      { title: 'Understanding authenticity scores', url: '/help/authenticity' },
      { title: 'Setting up price alerts', url: '/help/price-alerts' },
      { title: 'Managing your wishlist', url: '/help/wishlist' }
    ]
  },
  {
    title: 'Account & Billing',
    icon: Ticket,
    articles: [
      { title: 'Subscription plans and pricing', url: '/help/pricing' },
      { title: 'Managing your subscription', url: '/help/subscription' },
      { title: 'Payment methods and billing', url: '/help/billing' },
      { title: 'Account settings and privacy', url: '/help/account' }
    ]
  },
  {
    title: 'Troubleshooting',
    icon: HelpCircle,
    articles: [
      { title: 'Camera not working for scanning', url: '/help/camera-issues' },
      { title: 'Barcode not detected', url: '/help/barcode-issues' },
      { title: 'App performance issues', url: '/help/performance' },
      { title: 'Offline mode not working', url: '/help/offline' }
    ]
  }
];

const POPULAR_ARTICLES = [
  { title: 'How to scan a product barcode', views: '15.2k', url: '/help/scanning' },
  { title: 'Understanding authenticity scores', views: '12.8k', url: '/help/authenticity' },
  { title: 'Setting up price drop alerts', views: '9.4k', url: '/help/alerts' },
  { title: 'Using the app offline', views: '7.1k', url: '/help/offline' },
  { title: 'Managing your subscription', views: '5.9k', url: '/help/subscription' }
];

export function SupportPage() {
  const [activeTab, setActiveTab] = useState<'help' | 'contact' | 'tickets'>('help');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = HELP_CATEGORIES.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions, contact our support team, or track your existing tickets.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setActiveTab('help')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'help'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Help Center
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'contact'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Contact Us
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'tickets'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Tickets
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'help' && (
            <div className="space-y-8">
              {/* Search */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                  />
                </div>
              </div>

              {/* Popular Articles */}
              {!searchQuery && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Articles</h2>
                  <div className="space-y-3">
                    {POPULAR_ARTICLES.map((article, index) => (
                      <a
                        key={index}
                        href={article.url}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 group-hover:text-primary-600">
                            {article.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>{article.views} views</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchQuery ? filteredArticles : HELP_CATEGORIES).map((category, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <category.icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.title}
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <a
                          key={articleIndex}
                          href={article.url}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <span className="text-gray-700 group-hover:text-primary-600">
                            {article.title}
                          </span>
                          <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-primary-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {searchQuery && filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any help articles matching "{searchQuery}".
                  </p>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Contact Support</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && <ContactForm />}

          {activeTab === 'tickets' && <SupportTickets />}
        </div>
      </div>
    </div>
  );
}