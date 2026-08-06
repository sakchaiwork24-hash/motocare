import React, { useEffect, useRef } from 'react';
import { useBackButtonClose } from '../hooks/useBackButtonClose';

type SheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Sheet({ open, onClose, children }: SheetProps) {
  useBackButtonClose(open, onClose);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    contentRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !contentRef.current) return;
    const focusable = contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 bg-[rgba(2,6,15,.74)] animate-mcFade flex flex-col justify-end"
      onClick={onClose}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="w-full bg-surface rounded-t-[26px] animate-mcUp flex flex-col overflow-hidden outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
