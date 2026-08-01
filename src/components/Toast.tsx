import { Check } from 'lucide-react';
import { useToast } from '../state/ToastContext';

/** Single-slot toast, bottom 78px, per README: enters with `mcIn`, auto-dismiss 3s (ToastContext). */
export function Toast() {
  const { message } = useToast();
  if (!message) return null;

  return (
    <div className="absolute left-0 right-0 flex justify-center px-4 pointer-events-none" style={{ bottom: 78 }}>
      <div
        role="status"
        aria-live="polite"
        className="animate-mcIn shadow-toast pointer-events-auto flex items-center gap-2 rounded-14 border border-good bg-sunken px-4 py-3 max-w-full"
      >
        <Check size={16} className="text-good shrink-0" />
        <span className="font-sans text-[13px] text-ink-100">{message}</span>
      </div>
    </div>
  );
}
