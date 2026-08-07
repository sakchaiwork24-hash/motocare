import { useEffect, useRef, useState } from 'react';

// Not yet part of TypeScript's standard DOM lib — declare just the slice this hook uses.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Real `beforeinstallprompt` capture — browsers only fire this event once, so it must be stored. */
export function useInstallPrompt() {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setInstallable(true);
    };
    const onInstalled = () => {
      deferredRef.current = null;
      setInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = async () => {
    const deferred = deferredRef.current;
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    deferredRef.current = null;
    setInstallable(false);
  };

  return { installable, promptInstall };
}

/**
 * iOS Safari never fires `beforeinstallprompt` — there is no programmatic install API there,
 * only the manual Share -> "Add to Home Screen" flow. `navigator.standalone` (iOS-only, not in
 * TS's DOM lib) is true once the app is already installed/launched from the home screen.
 */
export function isIosInstallable(): boolean {
  if (typeof navigator === 'undefined') return false;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return isIos && !isStandalone;
}
