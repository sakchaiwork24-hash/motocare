import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../state/installPrompt';

/** Real PWA installability — only renders when the browser has actually fired `beforeinstallprompt`. */
export function InstallBanner() {
  const { installable, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!installable || dismissed) return null;

  return (
    <div className="absolute left-0 right-0 z-40 flex justify-center px-3" style={{ bottom: 78 }}>
      <div className="w-full flex items-center gap-2.5 bg-surface border border-accent/40 rounded-14 shadow-toast px-3 py-2.5">
        <div className="w-8 h-8 rounded-10 bg-[rgba(255,107,0,.13)] flex items-center justify-center shrink-0">
          <Download size={15} className="text-accent-light" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-[11px] text-ink-100">Install MotoCare</div>
          <div className="font-sans text-[9.5px] text-ink-400">Add to home screen for offline access</div>
        </div>
        <button
          onClick={promptInstall}
          className="min-h-[36px] px-3 rounded-10 bg-accent font-display font-bold text-[10.5px] tracking-[.04em] text-[#000000] uppercase shrink-0"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="w-9 h-9 flex items-center justify-center text-ink-500 shrink-0"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
