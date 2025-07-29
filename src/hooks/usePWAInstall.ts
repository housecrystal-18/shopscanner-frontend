import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  canPrompt: boolean;
  isPrompting: boolean;
}

export function usePWAInstall() {
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isIos: false,
    canPrompt: false,
    isPrompting: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      return isStandalone || isIOSStandalone;
    };

    // Check if running on iOS
    const checkIfIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent);
    };

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
      
      setState(prev => ({
        ...prev,
        isInstallable: true,
        canPrompt: true
      }));
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        canPrompt: false
      }));
      
      setDeferredPrompt(null);
    };

    // Initialize state
    setState(prev => ({
      ...prev,
      isInstalled: checkIfInstalled(),
      isIos: checkIfIOS()
    }));

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt || state.isPrompting) {
      return false;
    }

    setState(prev => ({ ...prev, isPrompting: true }));

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User ${outcome} the install prompt`);
      
      // Clean up
      setDeferredPrompt(null);
      setState(prev => ({
        ...prev,
        isPrompting: false,
        canPrompt: false
      }));

      return outcome === 'accepted';
    } catch (error) {
      console.error('Error showing install prompt:', error);
      
      setState(prev => ({ ...prev, isPrompting: false }));
      return false;
    }
  };

  const getInstallInstructions = () => {
    if (state.isIos) {
      return {
        title: 'Install Shop Scanner',
        steps: [
          'Tap the Share button at the bottom of the screen',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" in the top right corner'
        ],
        icon: '📱'
      };
    }

    // Android Chrome or other browsers
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) {
      return {
        title: 'Install Shop Scanner',
        steps: [
          'Tap the menu button (⋮) in the top right',
          'Select "Add to Home screen" or "Install app"',
          'Tap "Install" to confirm'
        ],
        icon: '📱'
      };
    }

    return {
      title: 'Install Shop Scanner',
      steps: [
        'Look for an install or "Add to Home Screen" option in your browser menu',
        'Follow your browser\'s installation instructions'
      ],
      icon: '📱'
    };
  };

  return {
    ...state,
    promptInstall,
    getInstallInstructions,
    canShowPrompt: state.canPrompt && !state.isInstalled && !state.isPrompting
  };
}