import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { User as UserIcon, Mail, Shield, Save, Key } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [title, setTitle] = useState(user?.title || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    // In Phase 2, we just simulate the save.
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Profile & Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your personal information and security preferences.</p>
      </div>

      <GlassCard className="p-6 md:p-8 space-y-8">
        {/* Profile Header */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <img 
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
              alt={user?.name} 
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-surface-hover shadow-xl"
            />
            <button className="absolute bottom-[-10px] right-[-10px] bg-brand-DEFAULT text-white p-1.5 rounded-full shadow-glow-indigo hover:scale-105 transition-transform">
              <UserIcon className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{user?.name}</h2>
            <p className="text-sm text-brand-cyan font-medium">{user?.role}</p>
            <p className="text-xs text-text-muted mt-1">Joined ContextOS in 2026</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-border">
          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm">
              Settings updated successfully.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<UserIcon className="w-4 h-4 text-text-muted" />}
            />
            <Input
              label="Job Title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              icon={<Shield className="w-4 h-4 text-text-muted" />}
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-text-muted" />}
            />
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Role (Read Only)
              </label>
              <div className="w-full bg-surface-hover/30 border border-border/50 rounded-xl p-3 text-sm text-text-muted flex items-center gap-2 cursor-not-allowed">
                <Shield className="w-4 h-4" />
                {user?.role}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Email Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Send Mode
                </label>
                <select className="w-full bg-surface-hover/50 border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-DEFAULT/50">
                  <option value="AUTO">Auto-Send</option>
                  <option value="APPROVAL">Require Approval</option>
                </select>
                <p className="text-xs text-text-muted mt-1">If Auto-Send is disabled, AI emails go to the Approval Queue.</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  From Name
                </label>
                <Input
                  name="fromName"
                  value={name}
                  onChange={() => {}}
                  placeholder="e.g. John Doe"
                  icon={<UserIcon className="w-4 h-4 text-text-muted" />}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Reminder Timing
                </label>
                <select className="w-full bg-surface-hover/50 border border-border rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-DEFAULT/50">
                  <option value="15">15 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">24 hours before</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Security
            </h3>
            <Button type="button" variant="outline" icon={<Key className="w-4 h-4" />}>
              Change Password
            </Button>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost">Cancel</Button>
            <Button type="submit" variant="glow" disabled={loading} icon={loading ? undefined : <Save className="w-4 h-4" />}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
