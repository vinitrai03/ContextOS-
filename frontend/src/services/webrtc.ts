import { useState, useEffect, useRef, useCallback } from 'react';
import { stompClient } from './stompClient';

export interface Peer {
  id: string; // The user ID of the peer
  stream: MediaStream | null;
  name?: string;
  isHost?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
}

export const useWebRTC = (meetingId: string, currentUserId: string, iceServers: RTCIceServer[]) => {
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStream = useRef<MediaStream | null>(null);

  const setLocalStream = useCallback((stream: MediaStream) => {
    localStream.current = stream;
    // Add tracks to existing connections
    peerConnections.current.forEach(pc => {
      stream.getTracks().forEach(track => {
        const sender = pc.getSenders().find(s => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        } else {
          pc.addTrack(track, stream);
        }
      });
    });
  }, []);

  const createPeerConnection = useCallback((targetUserId: string, polite: boolean) => {
    const pc = new RTCPeerConnection({ iceServers });

    // Handle incoming ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        stompClient.send(`/app/meetings/${meetingId}/signal`, {
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    // Handle incoming media streams
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setPeers(prev => {
        const next = new Map(prev);
        const existingPeer = next.get(targetUserId);
        if (existingPeer) {
          next.set(targetUserId, { ...existingPeer, stream: remoteStream });
        } else {
          next.set(targetUserId, { id: targetUserId, stream: remoteStream });
        }
        return next;
      });
    };

    // Add local stream tracks to PC
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current!);
      });
    }

    let makingOffer = false;

    // Perfect negotiation pattern
    pc.onnegotiationneeded = async () => {
      try {
        makingOffer = true;
        await pc.setLocalDescription();
        stompClient.send(`/app/meetings/${meetingId}/signal`, {
          targetUserId,
          description: pc.localDescription,
        });
      } catch (err) {
        console.error('Error during negotiation:', err);
      } finally {
        makingOffer = false;
      }
    };

    peerConnections.current.set(targetUserId, pc);
    return { pc, polite };
  }, [iceServers, meetingId]);

  // Handle incoming signaling messages
  useEffect(() => {
    let unsubscribeQueue: (() => void) | null = null;
    let unsubscribeEvents: (() => void) | null = null;

    const handleSignal = async (message: any) => {
      const { fromUserId, description, candidate } = message;
      if (!fromUserId || fromUserId === currentUserId) return;

      let pcConfig = peerConnections.current.get(fromUserId);
      let pc: RTCPeerConnection;
      let polite: boolean;

      if (!pcConfig) {
        // We act as polite if our ID is lexicographically greater
        polite = currentUserId > fromUserId;
        const config = createPeerConnection(fromUserId, polite);
        pc = config.pc;
        polite = config.polite;
      } else {
        pc = pcConfig;
        // determine polite status here too ideally, but it's bound at creation
        polite = currentUserId > fromUserId; 
      }

      try {
        if (description) {
          // An offer may come in while we are busy making one.
          // If we are impolite, we ignore the offer.
          const offerCollision = (description.type === 'offer') &&
            (makingOffer || pc.signalingState !== 'stable');

          makingOffer = false; // reset in case

          if (offerCollision && !polite) return;

          await pc.setRemoteDescription(new RTCSessionDescription(description));
          if (description.type === 'offer') {
            await pc.setLocalDescription();
            stompClient.send(`/app/meetings/${meetingId}/signal`, {
              targetUserId: fromUserId,
              description: pc.localDescription,
            });
          }
        } else if (candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error('Error adding ICE candidate', err);
          }
        }
      } catch (err) {
        console.error('Signal handling error:', err);
      }
    };

    let makingOffer = false;

    unsubscribeQueue = stompClient.subscribe(`/user/queue/signal`, handleSignal);

    // Also subscribe to meeting events for peers joining/leaving
    unsubscribeEvents = stompClient.subscribe(`/topic/meetings/${meetingId}/events`, (msg: any) => {
      if (msg.type === 'PARTICIPANT_JOINED' && msg.userId !== currentUserId) {
        // Create connection proactively if polite=false?
        if (currentUserId < msg.userId) {
          createPeerConnection(msg.userId, false);
        }
        setPeers(prev => {
          if (!prev.has(msg.userId)) {
            const next = new Map(prev);
            next.set(msg.userId, { id: msg.userId, stream: null, name: msg.name, isHost: msg.role === 'HOST' });
            return next;
          }
          return prev;
        });
      } else if (msg.type === 'PARTICIPANT_LEFT' || msg.type === 'PARTICIPANT_REMOVED') {
        const pc = peerConnections.current.get(msg.userId);
        if (pc) {
          pc.close();
          peerConnections.current.delete(msg.userId);
        }
        setPeers(prev => {
          const next = new Map(prev);
          next.delete(msg.userId);
          return next;
        });
      } else if (msg.type === 'PARTICIPANT_MUTED') {
         setPeers(prev => {
             const peer = prev.get(msg.userId);
             if (peer) {
                 const next = new Map(prev);
                 next.set(msg.userId, { ...peer, isMuted: true });
                 return next;
             }
             return prev;
         });
      } else if (msg.type === 'SYNC_PARTICIPANTS') {
          // When we join, server might send a sync of existing participants
          const next = new Map(peers);
          msg.participants.forEach((p: any) => {
             if (p.id !== currentUserId && !next.has(p.id)) {
                 next.set(p.id, { id: p.id, stream: null, name: p.name, isHost: p.role === 'HOST', isMuted: false, isCameraOff: false });
                 if (currentUserId < p.id) {
                     createPeerConnection(p.id, false);
                 }
             }
          });
          setPeers(next);
      }
    });

    return () => {
      if (unsubscribeQueue) unsubscribeQueue();
      if (unsubscribeEvents) unsubscribeEvents();
    };
  }, [currentUserId, meetingId, createPeerConnection]);

  const disconnectAll = useCallback(() => {
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    setPeers(new Map());
  }, []);

  return { peers, setLocalStream, disconnectAll };
};
