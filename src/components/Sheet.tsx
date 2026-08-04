import React from 'react';
import { useBackButtonClose } from '../hooks/useBackButtonClose';

type SheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Sheet({ open, onClose, children }: SheetProps) {
  useBackButtonClose(open, onClose);
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 bg-[rgba(2,6,15,.74)] animate-mcFade flex flex-col justify-end"
      onClick={onClose}
    >
      <div
        className="w-full bg-surface rounded-t-[26px] animate-mcUp flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
