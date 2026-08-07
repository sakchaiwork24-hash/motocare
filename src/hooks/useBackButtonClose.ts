import { useEffect, useRef } from 'react';

type Entry = { id: number; onClose: () => void };

// Shared across every hook instance (module-level, not per-component) so that when
// multiple overlays are open at once, a single back-press closes only the topmost one
// instead of every open overlay reacting to the same popstate event.
const stack: Entry[] = [];
let listenerAttached = false;
let nextId = 0;
let suppressNextPopstate = false;

function handleGlobalPopState() {
  // The cleanup path below triggers a synthetic popstate (via history.back()) to pop
  // its own pushed entry when an overlay is closed some other way (X button, backdrop
  // click) — this flag tells the real handler to ignore that one, so it isn't mistaken
  // for a genuine back-press and doesn't close the next overlay down the stack.
  if (suppressNextPopstate) {
    suppressNextPopstate = false;
    return;
  }
  stack.pop()?.onClose();
}

function ensureListener() {
  if (listenerAttached) return;
  listenerAttached = true;
  window.addEventListener('popstate', handleGlobalPopState);
}

/**
 * Makes the browser/Android back button close the topmost open sheet/overlay instead
 * of navigating away from the app. Overlays are tracked in a shared LIFO stack so one
 * back-press closes exactly one overlay even if more than one happens to be open.
 * Pushes a history entry while open; if the overlay is closed some other way (X button,
 * backdrop click), the pushed entry is popped on cleanup so the back-stack doesn't
 * accumulate.
 */
export function useBackButtonClose(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    ensureListener();

    const id = nextId++;
    const entry: Entry = { id, onClose: () => onCloseRef.current() };
    stack.push(entry);
    window.history.pushState({ motocareOverlay: true, id }, '');

    return () => {
      const idx = stack.indexOf(entry);
      if (idx === -1) return; // already removed by a real back-press
      stack.splice(idx, 1);
      // `history.back()` is async, so under React StrictMode's dev-only double-invoke
      // (mount -> cleanup -> mount, all synchronous) a second mount's pushState can land
      // on top of this cleanup's back() before that back() has actually resolved. Only
      // issue the synthetic back() if we're still literally sitting on the state we
      // pushed — if something else has already moved history on without us, skip it
      // instead of over-popping past whatever's underneath (e.g. the app's own root page).
      if ((window.history.state as { id?: number } | null)?.id === id) {
        suppressNextPopstate = true;
        window.history.back();
      }
    };
  }, [open]);
}
