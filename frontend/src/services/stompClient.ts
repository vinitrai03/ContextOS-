/// <reference types="vite/client" />
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class StompService {
  private client: Client | null = null;
  private connected = false;
  private messageListeners: Map<string, Set<(message: any) => void>> = new Map();

  connect(onConnect?: () => void, onError?: (err: any) => void) {
    if (this.connected && this.client) {
      if (onConnect) onConnect();
      return;
    }

    const token = useAuthStore.getState().token;
    if (!token) return;

    this.client = new Client({
      brokerURL: `${BASE_URL.replace('http', 'ws')}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      webSocketFactory: () => {
        // Fallback to SockJS if native WebSocket fails or isn't supported
        return new SockJS(`${BASE_URL}/ws`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to WebSocket STOMP');
        this.connected = true;
        if (onConnect) onConnect();
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        this.connected = false;
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      console.log('Disconnected STOMP client');
    }
  }

  subscribe(destination: string, callback: (message: any) => void) {
    if (!this.client || !this.connected) return null;

    if (!this.messageListeners.has(destination)) {
      this.messageListeners.set(destination, new Set());
    }
    this.messageListeners.get(destination)!.add(callback);

    const subscription = this.client.subscribe(destination, (message) => {
      let body = message.body;
      try {
        body = JSON.parse(message.body);
      } catch (e) {
        // Not JSON
      }
      const listeners = this.messageListeners.get(destination);
      if (listeners) {
        listeners.forEach(cb => cb(body));
      }
    });

    return () => {
      subscription.unsubscribe();
      const listeners = this.messageListeners.get(destination);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  send(destination: string, body: any) {
    if (this.client && this.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      });
    } else {
      console.warn('Cannot send message: STOMP client not connected');
    }
  }
}

export const stompClient = new StompService();
