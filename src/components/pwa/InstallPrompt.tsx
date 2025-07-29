import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, Plus, Share } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const { 
    isInstallable, 
    isInstalled, 
    isIos, 
    canShowPrompt, 
    isPrompting,
    promptInstall, 
    getInstallInstructions 
  } = usePWAInstall();

  useEffect(() => {
    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    // Show prompt if:
    // 1. App is installable
    // 2. Not already installed
    // 3. Not dismissed, or dismissed more than 7 days ago
    // 4. User has been on the site for at least 30 seconds
    const shouldShow = (isInstallable || isIos) && 
                      !isInstalled && 
                      (!dismissed || daysSinceDismissal > 7);

    if (shouldShow && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 30000); // Show after 30 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isIos, isDismissed]);

  const handleInstall = async () => {
    if (canShowPrompt) {
      const installed = await promptInstall();
      if (installed) {
        setIsVisible(false);
      }
    }
  };

  const handleDismiss = (temporary = false) => {
    setIsVisible(false);
    setIsDismissed(true);
    
    if (!temporary) {
      // Remember dismissal for 7 days
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  const instructions = getInstallInstructions();

  return (
    <>
      {/* Mobile Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="bg-white border-t border-gray-200 shadow-xl">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-xl">
                  <Smartphone className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Install Shop Scanner</h3>
                  <p className="text-sm text-gray-600">Get the full app experience</p>
                </div>
              </div>
              
              <button
                onClick={() => handleDismiss(true)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex space-x-3">
              {canShowPrompt ? (
                <button
                  onClick={handleInstall}
                  disabled={isPrompting}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isPrompting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>{isPrompting ? 'Installing...' : 'Install'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsVisible(false)}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span className="text-2xl mr-2">{instructions.icon}</span>
                  <span>How to Install</span>
                </button>
              )}
              
              <button
                onClick={() => handleDismiss(false)}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Banner */}
      <div className="fixed top-20 right-4 z-50 hidden md:block">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Smartphone className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Install Shop Scanner</h3>
                <p className="text-sm text-gray-600">Access offline & get notifications</p>
              </div>
            </div>
            
            <button
              onClick={() => handleDismiss(true)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Works offline</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Push notifications</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Native app experience</span>
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            {canShowPrompt ? (
              <button
                onClick={handleInstall}
                disabled={isPrompting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isPrompting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{isPrompting ? 'Installing...' : 'Install'}</span>
              </button>
            ) : (
              <div className="flex-1 text-center">
                <p className="text-sm text-gray-600 mb-2">Install from browser menu:</p>
                <p className="text-xs text-gray-500">⋮ → Install app</p>
              </div>
            )}
            
            <button
              onClick={() => handleDismiss(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>

      {/* iOS Installation Instructions Modal */}
      {isIos && !canShowPrompt && isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {instructions.title}
              </h3>
              <button
                onClick={() => handleDismiss(true)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-4 text-2xl mb-4">
              <Share className="h-6 w-6 text-gray-400" />
              <span>→</span>
              <Plus className="h-6 w-6 text-gray-400" />
              <span>→</span>
              <Smartphone className="h-6 w-6 text-primary-600" />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleDismiss(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={() => handleDismiss(true)}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}