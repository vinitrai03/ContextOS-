import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, DEFAULT_DEMO_USER } from '../../store/useAuthStore';
import { useWebRTC } from '../../services/webrtc';
import { stompClient } from '../../services/stompClient';
import { speechService } from '../../services/speechRecognition';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  Hand,
  MessageSquare,
  Users,
  FileText,
  PhoneOff,
  Maximize2,
  Minimize2,
  Send,
  Sparkles,
  CheckCircle,
  Copy,
  Download,
} from 'lucide-react';
import apiClient from '../../services/apiClient';

interface LocationState {
  joinData?: {
    token: string;
    meetingId: string;
    sessionId: string;
    role: string;
    iceServers: RTCIceServer[];
  };
  micEnabled?: boolean;
  cameraEnabled?: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

interface TranscriptItem {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  isAI?: boolean;
}

export default function VideoRoom() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);

  // Safe fallback user if not logged in
  const user = authUser || DEFAULT_DEMO_USER || {
    id: 'usr_guest_demo',
    name: 'You (Participant)',
    email: 'participant@contextos.local',
    role: 'PARTICIPANT' as const,
    title: 'Meeting Participant',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  };

  const state = (location.state as LocationState) || {};
  const joinData = state.joinData || {
    token: 'token-' + Date.now(),
    meetingId: code || 'mock-code',
    sessionId: 'session-' + Date.now(),
    role: 'HOST',
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  const initialMic = state.micEnabled ?? true;
  const initialCam = state.cameraEnabled ?? true;

  const [micEnabled, setMicEnabled] = useState(initialMic);
  const [cameraEnabled, setCameraEnabled] = useState(initialCam);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [activePanel, setActivePanel] = useState<'chat' | 'participants' | 'transcript' | null>(null);
  const [transcriptActive, setTranscriptActive] = useState(false);

  // In-Meeting Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'AI Note Taker',
      text: 'ContextOS AI note-taker is active and listening for key decisions and commitments.',
      timestamp: '11:20 AM',
      isSelf: false,
    },
    {
      id: 'm2',
      sender: 'Sarah Jenkins',
      text: 'Good morning! Ready when everyone joins.',
      timestamp: '11:21 AM',
      isSelf: false,
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Live Transcript State
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: 't1',
      speaker: 'Sarah Jenkins',
      text: 'Welcome to our sprint retrospective. Let us start by reviewing the ContextOS deployment milestones.',
      timestamp: '11:20:15',
    },
    {
      id: 't2',
      speaker: 'AI Assistant',
      text: '[Action Item Detected] Abhed Tyagi to finalize the real-time STOMP and WebRTC signaling bridge.',
      timestamp: '11:21:04',
      isAI: true,
    },
  ]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // WebRTC hook call with safe user.id
  const { peers, setLocalStream, disconnectAll } = useWebRTC(
    joinData.meetingId,
    user.id,
    joinData.iceServers
  );

  useEffect(() => {
    // 1. Connect STOMP
    try {
      stompClient.connect(() => {
        // Connected to signaling server
      });
    } catch (e) {
      console.warn('STOMP connection notice', e);
    }

    // 2. Setup Local Camera & Mic Stream
    const initLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        cameraStreamRef.current = stream;
        stream.getAudioTracks().forEach((t) => (t.enabled = initialMic));
        stream.getVideoTracks().forEach((t) => (t.enabled = initialCam));

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Local media device access notice', err);
      }
    };

    initLocalStream();

    return () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      disconnectAll();
      try {
        stompClient.disconnect();
      } catch (e) {}
      speechService.stop();
    };
  }, []);

  // Mic Toggle
  const toggleMic = () => {
    const nextMic = !micEnabled;
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = nextMic));
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = nextMic));
    }
    setMicEnabled(nextMic);
  };

  // Camera Toggle
  const toggleCamera = () => {
    const nextCam = !cameraEnabled;
    if (cameraStreamRef.current && !screenShareEnabled) {
      cameraStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = nextCam));
    }
    setCameraEnabled(nextCam);
  };

  // Screen Share Toggle
  const toggleScreenShare = async () => {
    if (screenShareEnabled) {
      stopScreenShare();
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenStreamRef.current = displayStream;
      const screenTrack = displayStream.getVideoTracks()[0];

      // Native browser floating "Stop Sharing" button support
      screenTrack.onended = () => {
        stopScreenShare();
      };

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = displayStream;
      }

      setLocalStream(displayStream);
      setScreenShareEnabled(true);
    } catch (err: any) {
      console.warn('Screen share cancelled or unsupported', err);
      setScreenShareEnabled(false);
    }
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = cameraEnabled));
        cameraStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = micEnabled));
        setLocalStream(cameraStreamRef.current);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStreamRef.current;
        }
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: cameraEnabled,
          audio: micEnabled,
        });
        cameraStreamRef.current = stream;
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Failed to restore camera stream', err);
    }

    setScreenShareEnabled(false);
  };

  // Hand Raise Toggle
  const toggleHandRaise = () => {
    setHandRaised((prev) => !prev);
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Transcript Toggle
  const toggleTranscript = () => {
    if (!transcriptActive) {
      const started = speechService.start((segment) => {
        const item: TranscriptItem = {
          id: 'ts-' + Date.now(),
          speaker: user.name,
          text: segment,
          timestamp: new Date().toLocaleTimeString(),
        };
        setTranscripts((prev) => [...prev, item]);

        try {
          stompClient.send(`/app/meetings/${joinData.meetingId}/transcript`, {
            sessionId: joinData.sessionId,
            content: segment,
            startOffsetMs: 0,
            endOffsetMs: segment.length * 100,
          });
        } catch (e) {}
      });

      setTranscriptActive(true);
      setActivePanel('transcript');
    } else {
      speechService.stop();
      setTranscriptActive(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      sender: user.name,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  const leaveMeeting = () => {
    navigate('/dashboard');
  };

  const endMeetingForAll = async () => {
    try {
      await apiClient.post(`/meetings/${joinData.meetingId}/end`);
    } catch (err) {
      console.warn('End meeting api notice', err);
    }
    navigate('/dashboard');
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden relative text-white">
      {/* Top Bar */}
      <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-border bg-surface z-10">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-text-primary text-lg">
            Meeting <span className="font-mono text-brand-DEFAULT">{code}</span>
          </h1>
          <div className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 text-xs font-bold tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </div>
          {screenShareEnabled && (
            <div className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1.5 border border-indigo-500/30">
              <MonitorUp className="w-3.5 h-3.5" />
              You are sharing your screen
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-text-secondary">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-DEFAULT" />
            <span className="text-sm font-medium">{peers.size + 1} In Call</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div
          className="flex-1 p-4 grid gap-4 auto-rows-fr"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, Math.ceil(Math.sqrt(peers.size + 1)))}, minmax(0, 1fr))`,
          }}
        >
          {/* Local Video Tile */}
          <div className="relative bg-surface rounded-2xl overflow-hidden border border-border flex items-center justify-center group shadow-xl">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover transform ${
                screenShareEnabled ? '' : '-scale-x-100'
              } ${cameraEnabled || screenShareEnabled ? 'opacity-100' : 'opacity-0'}`}
            />

            {!cameraEnabled && !screenShareEnabled && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-DEFAULT to-brand-cyan flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <p className="mt-3 text-text-secondary font-medium">{user.name}</p>
              </div>
            )}

            {/* Hand Raised Floating Badge */}
            {handRaised && (
              <div className="absolute top-4 left-4 bg-amber-500/90 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold shadow-lg animate-bounce">
                <span>✋</span> Hand Raised
              </div>
            )}

            {/* Bottom info banner */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-white/10">
              <span className="text-sm font-medium text-white">{user.name} (You)</span>
              {!micEnabled && <MicOff className="w-3.5 h-3.5 text-red-400" />}
              {screenShareEnabled && <MonitorUp className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
          </div>

          {/* Remote Video Tiles */}
          {Array.from(peers.values()).map((peer) => (
            <div
              key={peer.id}
              className="relative bg-surface rounded-2xl overflow-hidden border border-border flex items-center justify-center group shadow-xl"
            >
              {peer.stream ? (
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(el) => {
                    if (el && el.srcObject !== peer.stream) {
                      el.srcObject = peer.stream;
                    }
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-surface-hover flex items-center justify-center text-3xl font-bold text-text-primary">
                  {peer.name ? peer.name.charAt(0) : '?'}
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-white/10">
                <span className="text-sm font-medium text-white">{peer.name || peer.id.substring(0, 6)}</span>
                {peer.isMuted && <MicOff className="w-3.5 h-3.5 text-red-400" />}
              </div>
            </div>
          ))}
        </div>

        {/* Side Panels */}
        {activePanel && (
          <div className="w-88 border-l border-border bg-surface flex flex-col z-10 shadow-2xl transition-all duration-300">
            <div className="h-14 flex items-center justify-between px-5 border-b border-border">
              <div className="flex items-center gap-2">
                {activePanel === 'chat' && <MessageSquare className="w-4 h-4 text-brand-DEFAULT" />}
                {activePanel === 'participants' && <Users className="w-4 h-4 text-brand-DEFAULT" />}
                {activePanel === 'transcript' && <FileText className="w-4 h-4 text-brand-DEFAULT" />}
                <h2 className="font-semibold text-text-primary capitalize">{activePanel}</h2>
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="text-text-muted hover:text-text-primary text-xl leading-none px-2 py-1 rounded"
              >
                &times;
              </button>
            </div>

            {/* Chat Panel */}
            {activePanel === 'chat' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-semibold text-text-secondary">{m.sender}</span>
                        <span className="text-[10px] text-text-muted">{m.timestamp}</span>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                          m.isSelf
                            ? 'bg-brand-DEFAULT text-white rounded-br-none'
                            : 'bg-surface-hover text-text-primary border border-border rounded-bl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-surface-hover border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-DEFAULT"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-brand-DEFAULT hover:bg-brand-DEFAULT/90 text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Participants Panel */}
            {activePanel === 'participants' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-hover border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-DEFAULT text-white flex items-center justify-center font-bold text-xs">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{user.name} (You)</p>
                      <p className="text-xs text-text-muted">{joinData.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {handRaised && <span title="Hand Raised">✋</span>}
                    {micEnabled ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                    {cameraEnabled ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-red-400" />}
                  </div>
                </div>

                {/* AI Assistant */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-DEFAULT to-brand-cyan text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary flex items-center gap-1">
                        ContextOS AI Assistant
                      </p>
                      <p className="text-xs text-indigo-400">Live Notetaker & Graph Builder</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                    BOT
                  </span>
                </div>

                {/* Mock Colleagues */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-hover/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Sarah Jenkins</p>
                      <p className="text-xs text-text-muted">Senior Architect</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <Video className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Live Transcript Panel */}
            {activePanel === 'transcript' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-3 bg-brand-DEFAULT/10 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-semibold text-text-primary">Speech to Text Active</span>
                  </div>
                  <button
                    onClick={() => {
                      const fullText = transcripts.map((t) => `${t.speaker} (${t.timestamp}): ${t.text}`).join('\n');
                      navigator.clipboard.writeText(fullText);
                      alert('Transcript copied to clipboard!');
                    }}
                    className="p-1.5 rounded hover:bg-surface-hover text-text-secondary"
                    title="Copy Transcript"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {transcripts.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border text-sm ${
                        t.isAI
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                          : 'bg-surface-hover border-border text-text-primary'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-text-secondary">{t.speaker}</span>
                        <span className="text-[10px] text-text-muted">{t.timestamp}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-surface/85 backdrop-blur-2xl border border-border rounded-2xl px-6 py-3 shadow-2xl z-20">
        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          className={`p-3 rounded-xl transition-all ${
            micEnabled
              ? 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
          }`}
        >
          {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          className={`p-3 rounded-xl transition-all ${
            cameraEnabled
              ? 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
          }`}
        >
          {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Screen Share Toggle */}
        <button
          onClick={toggleScreenShare}
          title={screenShareEnabled ? 'Stop Screen Share' : 'Share Screen'}
          className={`p-3 rounded-xl transition-all ${
            screenShareEnabled
              ? 'bg-brand-DEFAULT text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] ring-2 ring-brand-DEFAULT'
              : 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary'
          }`}
        >
          {screenShareEnabled ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
        </button>

        {/* Hand Raise Toggle */}
        <button
          onClick={toggleHandRaise}
          title={handRaised ? 'Lower Hand' : 'Raise Hand'}
          className={`p-3 rounded-xl transition-all ${
            handRaised
              ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]'
              : 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary'
          }`}
        >
          <Hand className="w-5 h-5" />
        </button>

        {/* Chat Toggle */}
        <button
          onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
          title="In-meeting Chat"
          className={`p-3 rounded-xl transition-all ${
            activePanel === 'chat'
              ? 'bg-brand-DEFAULT text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]'
              : 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Participants Toggle */}
        <button
          onClick={() => setActivePanel(activePanel === 'participants' ? null : 'participants')}
          title="Participants List"
          className={`p-3 rounded-xl transition-all ${
            activePanel === 'participants'
              ? 'bg-brand-DEFAULT text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]'
              : 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary'
          }`}
        >
          <Users className="w-5 h-5" />
        </button>

        {/* Live Transcript Toggle */}
        <button
          onClick={toggleTranscript}
          title={transcriptActive ? 'Stop Live Transcription' : 'Start Live Transcription'}
          className={`p-3 rounded-xl transition-all ${
            transcriptActive
              ? 'bg-brand-DEFAULT text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] ring-2 ring-brand-DEFAULT'
              : 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary'
          }`}
        >
          <FileText className="w-5 h-5" />
        </button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* End for all / Leave meeting */}
        {joinData.role === 'HOST' && (
          <button
            onClick={endMeetingForAll}
            className="px-4 py-2 bg-red-500/10 text-red-500 font-semibold rounded-xl hover:bg-red-500 hover:text-white transition-colors text-sm"
          >
            End for all
          </button>
        )}

        <button
          onClick={leaveMeeting}
          title="Leave Meeting"
          className="p-3 rounded-xl transition-all bg-red-500 hover:bg-red-600 text-white ml-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
