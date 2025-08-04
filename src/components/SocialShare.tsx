import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy, Check } from 'lucide-react';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function SocialShare({ 
  url = 'https://shopscanpro.com',
  title = 'Shop Scan Pro - Shop Smarter: Analyze Product Authenticity First',
  description = 'Explore product details and identifiers to assess originality. AI-powered educational analysis for informed shopping decisions.',
  className = ''
}: SocialShareProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    url,
    title,
    description
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.title + ' - ' + shareData.description)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      shareUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}&hashtags=ShopScanPro,AntiCounterfeit,OnlineShopping`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.description)}`
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      shareUrl: `https://wa.me/?text=${encodeURIComponent(shareData.title + '\n\n' + shareData.description + '\n\n' + shareData.url)}`
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url,
        });
      } catch (error) {
        console.log('Native sharing failed, showing custom menu');
        setShowShareMenu(true);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link');
    }
  };

  const handleSocialShare = (platform: typeof socialPlatforms[0]) => {
    window.open(platform.shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    setShowShareMenu(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleNativeShare}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span>Share App</span>
      </button>

      {showShareMenu && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Share Shop Scan Pro</h3>
            
            {/* Social Media Platforms */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {socialPlatforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <button
                    key={platform.name}
                    onClick={() => handleSocialShare(platform)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-white transition-colors ${platform.color}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm">{platform.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Copy Link */}
            <div className="border-t pt-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareData.url}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowShareMenu(false)}
              className="w-full mt-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function SocialShareCompact({ url, title, description, className = '' }: SocialShareProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title || 'Shop Scan Pro - Shop Smarter: Analyze Product Authenticity First',
      text: description || 'Protect yourself from counterfeits with AI-powered authenticity verification.',
      url: url || 'https://shopscanpro.com',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to copying link
        await navigator.clipboard.writeText(shareData.url);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      }
    } else {
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      } catch (error) {
        console.error('Failed to copy link');
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleShare}
        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Share Shop Scan Pro"
      >
        <Share2 className="w-5 h-5" />
      </button>
      
      {showTooltip && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
          Link copied!
        </div>
      )}
    </div>
  );
}