import React from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell-height w-full max-w-md mx-auto bg-app flex flex-col overflow-hidden relative">
      {children}
    </div>
  );
}
