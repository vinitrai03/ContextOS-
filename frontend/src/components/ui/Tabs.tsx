import React from 'react';

export interface TabOption {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex border-b border-border gap-6 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`py-3 text-sm font-semibold transition-colors relative ${
            activeTab === tab.id
              ? 'text-brand-cyan'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-cyan rounded-t-full shadow-glow-indigo" />
          )}
        </button>
      ))}
    </div>
  );
};
