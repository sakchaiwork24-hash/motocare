import React from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-app flex flex-col overflow-hidden relative">
      {children}
    </div>
  );
}
