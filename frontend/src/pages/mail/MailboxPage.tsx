import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/Badge';
import { Mail, Send, Inbox, Star, Trash2, Edit3, MoreVertical, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import apiClient from '../../services/apiClient';

export const MailboxPage: React.FC = () => {
  const { user } = useAuthStore();
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('INBOX');
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  useEffect(() => {
    fetchEmails();
  }, [selectedFolder]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/emails?folder=${selectedFolder}`);
      setEmails(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch emails', error);
      // Fallback data for demo
      setEmails([
        {
          id: '1',
          email: {
            subject: 'Project Architecture Meeting - Update',
            senderEmail: 'admin@contextos.local',
            bodyHtml: '<p>The meeting time has been updated to 4:00 PM.</p>',
            sentAt: new Date().toISOString(),
          },
          isRead: false,
          isStarred: true,
        },
      ]);
    }
    setLoading(false);
  };

  const folders = [
    { id: 'INBOX', label: 'Inbox', icon: <Inbox className="w-4 h-4" /> },
    { id: 'SENT', label: 'Sent', icon: <Send className="w-4 h-4" /> },
    { id: 'DRAFTS', label: 'Drafts', icon: <Edit3 className="w-4 h-4" /> },
    { id: 'TRASH', label: 'Trash', icon: <Trash2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Left Pane - Folders */}
      <div className="w-64 border-r border-border p-4 flex flex-col gap-4">
        <Button variant="glow" className="w-full flex justify-center gap-2" size="lg">
          <Edit3 className="w-4 h-4" /> Compose
        </Button>
        <div className="flex flex-col gap-1 mt-4">
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => { setSelectedFolder(folder.id); setSelectedEmail(null); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-medium ${
                selectedFolder === folder.id 
                  ? 'bg-brand-DEFAULT/20 text-brand-cyan' 
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              {folder.icon}
              {folder.label}
            </button>
          ))}
        </div>
        
        {user?.role === 'ADMIN' && (
          <div className="mt-8">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-3">Admin</h3>
            <button
              onClick={() => { setSelectedFolder('APPROVALS'); setSelectedEmail(null); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-medium ${
                selectedFolder === 'APPROVALS' 
                  ? 'bg-rose-500/20 text-rose-400' 
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Approval Queue
            </button>
          </div>
        )}
      </div>

      {/* Middle Pane - Thread List */}
      <div className="w-1/3 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search emails..." 
              className="w-full bg-surface/50 border border-border/50 rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-DEFAULT/50"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-text-muted text-sm">Loading...</div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm">No emails in {selectedFolder}</div>
          ) : (
            emails.map(item => (
              <div 
                key={item.id} 
                onClick={() => setSelectedEmail(item)}
                className={`p-4 border-b border-border/50 cursor-pointer transition-colors hover:bg-surface-hover ${selectedEmail?.id === item.id ? 'bg-surface-hover border-l-2 border-l-brand-cyan' : ''} ${!item.isRead ? 'bg-surface/30' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm ${!item.isRead ? 'font-bold text-text-primary' : 'text-text-secondary'}`}>
                    {item.email.senderEmail}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(item.email.sentAt || new Date()).toLocaleDateString()}
                  </span>
                </div>
                <div className={`text-sm mb-1 ${!item.isRead ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                  {item.email.subject}
                </div>
                <div className="text-xs text-text-muted line-clamp-1">
                  {item.email.bodyText || item.email.bodyHtml.replace(/<[^>]*>?/gm, '')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane - Reading View */}
      <div className="flex-1 bg-surface/10 flex flex-col">
        {selectedEmail ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-border flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-2">{selectedEmail.email.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-DEFAULT/20 flex items-center justify-center text-brand-cyan font-bold">
                    {selectedEmail.email.senderEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{selectedEmail.email.senderEmail}</div>
                    <div className="text-xs text-text-muted">to me</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={<Star className={`w-4 h-4 ${selectedEmail.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />} />
                <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} />
                <Button variant="ghost" size="sm" icon={<MoreVertical className="w-4 h-4" />} />
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div 
                className="prose prose-invert max-w-none prose-p:text-sm prose-p:text-text-secondary"
                dangerouslySetInnerHTML={{ __html: selectedEmail.email.bodyHtml }}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <Mail className="w-12 h-12 mb-4 opacity-20" />
            <p>Select an email to read</p>
          </div>
        )}
      </div>
    </div>
  );
};
