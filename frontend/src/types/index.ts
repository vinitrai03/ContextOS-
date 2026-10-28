export type Role = 'ADMIN' | 'PARTICIPANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  title?: string;
}

export interface Meeting {
  id: string;
  code: string; // e.g. CTX-7F82K91P
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  joinUrl: string;
  participantEmails: string[];
  recurring: boolean;
  transcript?: TranscriptUtterance[];
}

export interface TranscriptUtterance {
  id: string;
  speaker: string;
  timestamp: string;
  text: string;
}

export interface Decision {
  id: string;
  decision: string;
  reason: string;
  meetingId: string;
  meetingTitle: string;
  date: string;
}

export interface Commitment {
  id: string;
  person: string;
  commitment: string;
  deadline: string;
  sourceMeetingId: string;
  sourceMeetingTitle: string;
  status: 'PENDING' | 'FULFILLED' | 'OVERDUE';
}

export interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  sourceMeetingId: string;
  sourceMeetingTitle: string;
}

export interface EmailMessage {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  body: string;
  timestamp: string;
  folder: 'INBOX' | 'SENT' | 'DRAFTS' | 'TRASH';
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED';
  isRead: boolean;
  isStarred: boolean;
  linkedMeetingId?: string;
  linkedTaskId?: string;
  linkedDecisionId?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'MEETING' | 'TASK' | 'EMAIL' | 'DECISION' | 'SYSTEM';
  isRead: boolean;
  linkUrl?: string;
}
