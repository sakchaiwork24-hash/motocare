import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

/** Wraps vite-plugin-pwa's `registerSW` (registerType: 'prompt') so a new build shows an
 * in-app "update available" prompt instead of silently swapping content underneath the user. */
export function useSWUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    updateSWRef.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });
  }, []);

  const applyUpdate = () => {
    updateSWRef.current?.(true);
  };

  return { needRefresh, applyUpdate };
}
