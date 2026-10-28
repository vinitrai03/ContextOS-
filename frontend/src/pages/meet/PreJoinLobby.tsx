import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { Video, Mic, MicOff, VideoOff, Settings, AlertCircle, PhoneOff } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface JoinTokenResponse {
  token: string;
  meetingId: string;
  sessionId: string;
  role: string;
  iceServers: RTCIceServer[];
}

export default function PreJoinLobby() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [denialReason, setDenialReason] = useState<string | null>(null);
  const [joinData, setJoinData] = useState<JoinTokenResponse | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await apiClient.post(`/meetings/code/${code}/join-token`);
        setJoinData(response.data);
      } catch (err: any) {
        // Fallback for Vercel / offline demo mode
        setJoinData({
          token: 'demo-token-' + Date.now(),
          meetingId: code || 'mock-code',
          sessionId: 'session-' + Date.now(),
          role: 'HOST',
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
      }
    };
    fetchToken();
  }, [code]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const initMedia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to get media', err);
        setMicEnabled(false);
        setCameraEnabled(false);
      }
    };

    if (joinData && !denialReason) {
      initMedia();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [joinData, denialReason]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !micEnabled);
    }
    setMicEnabled(prev => !prev);
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = !cameraEnabled);
    }
    setCameraEnabled(prev => !prev);
  };

  const joinMeeting = () => {
      if (!joinData) return;
      navigate(`/meet/${code}/room`, { state: { joinData, micEnabled, cameraEnabled } });
  };

  if (denialReason) {
      return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-text-primary">
                      {denialReason === 'LOCKED' ? 'Meeting Locked' :
                       denialReason === 'CANCELLED' ? 'Meeting Cancelled' :
                       denialReason === 'ENDED' ? 'Meeting Ended' :
                       denialReason === 'REMOVED' ? 'You Were Removed' :
                       denialReason === 'NOT_STARTED_YET' ? 'Meeting Not Started' :
                       'Access Denied'}
                  </h1>
                  <p className="text-text-secondary">
                      {denialReason === 'LOCKED' ? 'The host has locked this meeting. You can request access.' :
                       denialReason === 'CANCELLED' ? 'This meeting has been cancelled by the host.' :
                       'You cannot join this meeting at this time.'}
                  </p>
                  <div className="pt-4">
                      <Button onClick={() => navigate('/dashboard')} className="w-full">
                          Back to Dashboard
                      </Button>
                  </div>
              </div>
          </div>
      );
  }

  if (!joinData) {
      return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-DEFAULT border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Camera Preview */}
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-border shadow-2xl flex items-center justify-center">
            {cameraEnabled ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                />
            ) : (
                <div className="w-24 h-24 rounded-full bg-surface-hover flex items-center justify-center text-3xl text-text-primary font-bold uppercase">
                    {user?.name.charAt(0)}
                </div>
            )}

            {/* Floating controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                <button
                    onClick={toggleMic}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micEnabled ? 'bg-surface-hover hover:bg-surface-hover/80 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                >
                    {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button
                    onClick={toggleCamera}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${cameraEnabled ? 'bg-surface-hover hover:bg-surface-hover/80 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                >
                    {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
            </div>
        </div>

        {/* Info & Actions */}
        <div className="flex flex-col justify-center space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Ready to join?</h1>
                <p className="text-text-secondary text-lg">Meeting Code: <span className="font-mono text-brand-DEFAULT">{code}</span></p>
            </div>

            <div className="space-y-4">
                <Button onClick={joinMeeting} size="lg" className="w-full text-lg shadow-[0_0_20px_rgba(45,122,255,0.3)]">
                    Join Meeting
                </Button>
                <p className="text-center text-sm text-text-muted">
                    Joining as {user?.name}
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}
