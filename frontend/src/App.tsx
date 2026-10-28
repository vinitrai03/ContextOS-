import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { MeetingSchedulePage } from './pages/MeetingSchedulePage';
import { MeetingDetailsPage } from './pages/MeetingDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { MailboxPage } from './pages/mail/MailboxPage';
import { ApprovalQueuePage } from './pages/mail/ApprovalQueuePage';
import PreJoinLobby from './pages/meet/PreJoinLobby';
import VideoRoom from './pages/meet/VideoRoom';
import { TasksPage } from './pages/TasksPage';
import { DecisionsPage } from './pages/DecisionsPage';
import { CommitmentsPage } from './pages/CommitmentsPage';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Authenticated Workspace App Shell */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/meetings/new" element={<MeetingSchedulePage />} />
            <Route path="/meetings/:id" element={<MeetingDetailsPage />} />
            <Route path="/meetings" element={<CalendarPage />} />
            <Route path="/email" element={<MailboxPage />} />
            <Route path="/mail/approvals" element={<ApprovalQueuePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/decisions" element={<DecisionsPage />} />
            <Route path="/commitments" element={<CommitmentsPage />} />
            <Route path="/graph" element={<DashboardPage />} />
            <Route path="/ai-search" element={<DashboardPage />} />
            <Route path="/documents" element={<DashboardPage />} />
            <Route path="/analytics" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/audit-logs" element={<DashboardPage />} />
          </Route>

          {/* Fallback */}
          <Route path="/meet/:code" element={<PreJoinLobby />} />
          <Route path="/meet/:code/room" element={<VideoRoom />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
