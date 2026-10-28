import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useWebRTC } from '../../services/webrtc';
import { stompClient } from '../../services/stompClient';
import { speechService } from '../../services/speechRecognition';
import { Mic, MicOff, Video, VideoOff, MonitorUp, Hand, MessageSquare, Users, FileText, PhoneOff, Maximize, Settings } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface LocationState {
    joinData: {
        token: string;
        meetingId: string;
        sessionId: string;
        role: string;
        iceServers: RTCIceServer[];
    };
    micEnabled: boolean;
    cameraEnabled: boolean;
}

export default function VideoRoom() {
    const { code } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);

    const state = location.state as LocationState;
    if (!state || !state.joinData) {
        // Direct link or refresh without state -> redirect to lobby
        navigate(`/meet/${code}`);
        return null;
    }

    const { joinData, micEnabled: initialMic, cameraEnabled: initialCam } = state;
    
    const [micEnabled, setMicEnabled] = useState(initialMic);
    const [cameraEnabled, setCameraEnabled] = useState(initialCam);
    const [screenShareEnabled, setScreenShareEnabled] = useState(false);
    
    const [activePanel, setActivePanel] = useState<'chat' | 'participants' | 'transcript' | null>(null);
    const [transcriptActive, setTranscriptActive] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const { peers, setLocalStream, disconnectAll } = useWebRTC(joinData.meetingId, user!.id, joinData.iceServers);

    useEffect(() => {
        // 1. Connect STOMP
        stompClient.connect(() => {
            // After connection, start WebRTC logic internally
        });

        // 2. Setup Local Stream
        const initLocalStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true, // We request both, but disable tracks based on initial states
                    audio: true
                });
                
                stream.getAudioTracks().forEach(t => t.enabled = initialMic);
                stream.getVideoTracks().forEach(t => t.enabled = initialCam);
                
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Failed to init local stream in room', err);
            }
        };

        initLocalStream();

        return () => {
            disconnectAll();
            stompClient.disconnect();
            speechService.stop();
        };
    }, []);

    const toggleMic = () => {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getAudioTracks().forEach(t => t.enabled = !micEnabled);
        }
        setMicEnabled(!micEnabled);
        // Announce to others (TODO: via STOMP)
    };

    const toggleCamera = () => {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(t => t.enabled = !cameraEnabled);
        }
        setCameraEnabled(!cameraEnabled);
    };

    const toggleTranscript = () => {
        if (!transcriptActive) {
            const started = speechService.start((segment, isFinal) => {
                // Send segment via STOMP
                stompClient.send(`/app/meetings/${joinData.meetingId}/transcript`, {
                    sessionId: joinData.sessionId,
                    content: segment,
                    startOffsetMs: 0, // Mocked for now, need actual offset calculation
                    endOffsetMs: segment.length * 100 // Mocked
                });
            });
            if (started) {
                setTranscriptActive(true);
                setActivePanel('transcript');
            }
        } else {
            speechService.stop();
            setTranscriptActive(false);
        }
    };

    const leaveMeeting = () => {
        navigate('/dashboard');
    };

    const endMeetingForAll = async () => {
        try {
            await apiClient.post(`/meetings/${joinData.meetingId}/end`);
            navigate('/dashboard');
        } catch (err) {
            console.error("Failed to end meeting", err);
        }
    };

    return (
        <div className="h-screen w-full bg-background flex flex-col overflow-hidden relative text-white">
            
            {/* Top Bar */}
            <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-border bg-surface z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-semibold text-text-primary text-lg">Meeting {code}</h1>
                    <div className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-bold tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        LIVE
                    </div>
                </div>
                <div className="flex items-center gap-4 text-text-secondary">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">{peers.size + 1}</span>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Grid */}
                <div className="flex-1 p-4 grid gap-4 auto-rows-fr" style={{
                    gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(peers.size + 1))}, minmax(0, 1fr))`
                }}>
                    
                    {/* Local Video */}
                    <div className="relative bg-surface rounded-2xl overflow-hidden border border-border flex items-center justify-center group">
                        <video 
                            ref={localVideoRef} 
                            autoPlay 
                            muted 
                            playsInline
                            className={`w-full h-full object-cover transform ${screenShareEnabled ? '' : '-scale-x-100'} ${cameraEnabled ? 'opacity-100' : 'opacity-0'}`} 
                        />
                        {!cameraEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full bg-surface-hover flex items-center justify-center text-3xl font-bold text-text-primary">
                                    {user?.name.charAt(0)}
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <span className="text-sm font-medium">{user?.name} (You)</span>
                            {!micEnabled && <MicOff className="w-3.5 h-3.5 text-red-400" />}
                        </div>
                    </div>

                    {/* Remote Videos */}
                    {Array.from(peers.values()).map(peer => (
                        <div key={peer.id} className="relative bg-surface rounded-2xl overflow-hidden border border-border flex items-center justify-center group">
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
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <span className="text-sm font-medium">{peer.name || peer.id.substring(0,6)}</span>
                                {peer.isMuted && <MicOff className="w-3.5 h-3.5 text-red-400" />}
                            </div>
                        </div>
                    ))}

                </div>

                {/* Side Panels */}
                {activePanel && (
                    <div className="w-80 border-l border-border bg-surface flex flex-col z-10">
                        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                            <h2 className="font-semibold text-text-primary capitalize">{activePanel}</h2>
                            <button onClick={() => setActivePanel(null)} className="text-text-muted hover:text-text-primary">
                                &times;
                            </button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            {/* Stubs for now */}
                            {activePanel === 'chat' && <div className="text-sm text-text-secondary">Chat integration here...</div>}
                            {activePanel === 'participants' && <div className="text-sm text-text-secondary">Participant list here...</div>}
                            {activePanel === 'transcript' && <div className="text-sm text-text-secondary">Live transcript will appear here.</div>}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Control Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-surface/80 backdrop-blur-xl border border-border rounded-2xl px-6 py-3 shadow-2xl z-20">
                <button onClick={toggleMic} className={`p-3 rounded-xl transition-all ${micEnabled ? 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                    {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button onClick={toggleCamera} className={`p-3 rounded-xl transition-all ${cameraEnabled ? 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                    {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                
                <div className="w-px h-8 bg-border mx-1"></div>
                
                <button className="p-3 rounded-xl transition-all bg-surface-hover hover:bg-surface-hover/80 text-text-primary tooltip-trigger">
                    <MonitorUp className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-xl transition-all bg-surface-hover hover:bg-surface-hover/80 text-text-primary">
                    <Hand className="w-5 h-5" />
                </button>
                <button onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')} className={`p-3 rounded-xl transition-all ${activePanel === 'chat' ? 'bg-brand-DEFAULT text-white' : 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary'}`}>
                    <MessageSquare className="w-5 h-5" />
                </button>
                <button onClick={() => setActivePanel(activePanel === 'participants' ? null : 'participants')} className={`p-3 rounded-xl transition-all ${activePanel === 'participants' ? 'bg-brand-DEFAULT text-white' : 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary'}`}>
                    <Users className="w-5 h-5" />
                </button>
                <button onClick={toggleTranscript} className={`p-3 rounded-xl transition-all ${transcriptActive ? 'bg-brand-DEFAULT text-white' : 'bg-surface-hover hover:bg-surface-hover/80 text-text-primary'}`}>
                    <FileText className="w-5 h-5" />
                </button>
                
                <div className="w-px h-8 bg-border mx-1"></div>

                {joinData.role === 'HOST' && (
                    <button onClick={endMeetingForAll} className="px-4 py-2 bg-red-500/10 text-red-500 font-semibold rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                        End for all
                    </button>
                )}

                <button onClick={leaveMeeting} className="p-3 rounded-xl transition-all bg-red-500 hover:bg-red-600 text-white ml-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    <PhoneOff className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
