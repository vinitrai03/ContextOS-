import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Video, Mail, CheckSquare, Sparkles, Command, ArrowRight, UserCheck, Calendar, FileText } from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { useNavigate } from 'react-router-dom';

export const CommandPalette: React.FC = () => {
  const { isOpen, closeCommandPalette, searchQuery, setSearchQuery } = useCommandStore();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useCommandStore.getState().toggleCommandPalette();
      }
      if (e.key === 'Escape' && isOpen) {
        closeCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCommandPalette]);

  const actions = [
    {
      id: 'new-meeting',
      title: 'Schedule New Meeting',
      category: 'Actions',
      icon: <Video className="w-4 h-4 text-brand-DEFAULT" />,
      action: () => { navigate('/meetings/new'); closeCommandPalette(); }
    },
    {
      id: 'ask-ai',
      title: 'Ask ContextOS AI Assistant',
      category: 'AI Knowledge Search',
      icon: <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />,
      action: () => { navigate('/ai-search'); closeCommandPalette(); }
    },
    {
      id: 'go-tasks',
      title: 'Open Kanban Task Board',
      category: 'Navigation',
      icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
      action: () => { navigate('/tasks'); closeCommandPalette(); }
    },
    {
      id: 'go-inbox',
      title: 'Open Email Inbox',
      category: 'Navigation',
      icon: <Mail className="w-4 h-4 text-amber-400" />,
      action: () => { navigate('/email'); closeCommandPalette(); }
    },
    {
      id: 'go-graph',
      title: 'View Organizational Context Graph',
      category: 'Context Explorer',
      icon: <FileText className="w-4 h-4 text-purple-400" />,
      action: () => { navigate('/graph'); closeCommandPalette(); }
    },
    {
      id: 'go-calendar',
      title: 'View Meeting Calendar',
      category: 'Navigation',
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
      action: () => { navigate('/calendar'); closeCommandPalette(); }
    },
  ];

  const filteredActions = actions.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommandPalette}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl glass-panel rounded-3xl shadow-2xl border border-border overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-5 py-4 border-b border-border bg-surface/50">
              <Search className="w-5 h-5 text-brand-DEFAULT mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search context..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-text-primary text-base placeholder:text-text-muted focus:outline-none"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface border border-border text-xs text-text-muted font-mono">
                <Command className="w-3 h-3" /> K
              </div>
            </div>

            {/* Command List */}
            <div className="p-2 max-h-80 overflow-y-auto divide-y divide-border/20">
              {filteredActions.length === 0 ? (
                <div className="px-6 py-8 text-center text-text-muted text-sm">
                  No matching commands or context found. Try searching for "PostgreSQL", "Authentication API", or "Rahul".
                </div>
              ) : (
                filteredActions.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-colors ${
                      selectedIndex === idx ? 'bg-brand-DEFAULT/10 border border-brand-DEFAULT/30 text-text-primary' : 'text-text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-surface border border-border">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{item.title}</div>
                        <div className="text-xs text-text-muted">{item.category}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface/30 text-xs text-text-muted">
              <span>Use <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border">↓</kbd> to navigate</span>
              <span>ContextOS v1.0 Capstone</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
