import { useEffect, useRef } from 'react';

/**
 * Makes the browser/Android back button close an open sheet or overlay instead of
 * navigating away from the app. Pushes a history entry while open and closes on
 * `popstate`; if the overlay is closed some other way (X button, backdrop click),
 * the pushed entry is popped on cleanup so back-stack doesn't accumulate.
 */
export function useBackButtonClose(open: boolean, onClose: () => void) {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    window.history.pushState({ motocareOverlay: true }, '');
    pushedRef.current = true;

    const handlePopState = () => {
      pushedRef.current = false;
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
  }, [open]);
}
