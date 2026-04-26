import React from 'react';
import { Sidebar } from './Sidebar';
import { QuickLogFAB } from './QuickLogFAB';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div className="flex min-h-screen bg-surface-bg">
    <Sidebar />
    <main className="flex-1 min-w-0 px-5 py-8 md:px-10 md:py-10 pb-28 md:pb-10 max-w-5xl mx-auto w-full">
      {children}
    </main>
    <QuickLogFAB />
  </div>
);
