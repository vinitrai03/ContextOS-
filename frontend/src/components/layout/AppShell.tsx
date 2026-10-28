import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from '../ui/CommandPalette';

export const AppShell: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <TopBar />
        
        {/* Dynamic Page Router Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-mesh">
          <Outlet />
        </main>
      </div>

      {/* Global Cmd+K Command Palette Modal */}
      <CommandPalette />
    </div>
  );
};
