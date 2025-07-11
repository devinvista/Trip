import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';

export interface CollaborativeParticipant {
  userId: number;
  username: string;
  cursor?: { line: number; col: number };
}

export interface CollaborativeState {
  participants: CollaborativeParticipant[];
  isConnected: boolean;
  tripState: any;
  editingField: string | null;
  lastUpdate: string | null;
}

export interface CollaborativeMessage {
  type: 'auth' | 'join_trip' | 'trip_edit' | 'cursor_move' | 'field_focus' | 'field_blur';
  [key: string]: any;
}

export function useCollaborativeEditing(tripId: string) {
  const { user } = useAuth();
  const [state, setState] = useState<CollaborativeState>({
    participants: [],
    isConnected: false,
    tripState: {},
    editingField: null,
    lastUpdate: null
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!user || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔗 WebSocket conectado para edição colaborativa');
        setState(prev => ({ ...prev, isConnected: true }));
        setReconnectAttempts(0);
        
        // Authenticate
        ws.send(JSON.stringify({
          type: 'auth',
          userId: user.id,
          username: user.username
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        setState(prev => ({ ...prev, isConnected: false }));
        wsRef.current = null;
        
        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, timeout);
        }
      };

      ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
    }
  }, [user, reconnectAttempts]);

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'auth_success':
        // Join trip editing session
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'join_trip',
            tripId: tripId
          }));
        }
        break;

      case 'trip_state':
        setState(prev => ({
          ...prev,
          tripState: message.state
        }));
        break;

      case 'user_joined':
        setState(prev => ({
          ...prev,
          participants: message.participants
        }));
        break;

      case 'user_left':
        setState(prev => ({
          ...prev,
          participants: message.participants
        }));
        break;

      case 'trip_updated':
        setState(prev => ({
          ...prev,
          tripState: { ...prev.tripState, ...message.changes },
          lastUpdate: message.timestamp
        }));
        break;

      case 'cursor_updated':
        setState(prev => ({
          ...prev,
          participants: prev.participants.map(p => 
            p.userId === message.userId 
              ? { ...p, cursor: message.cursor }
              : p
          )
        }));
        break;

      case 'field_focused':
        setState(prev => ({
          ...prev,
          editingField: message.fieldName
        }));
        break;

      case 'field_blurred':
        setState(prev => ({
          ...prev,
          editingField: null
        }));
        break;

      case 'trip_saved':
        setState(prev => ({
          ...prev,
          tripState: {},
          lastUpdate: message.timestamp
        }));
        break;

      case 'error':
        console.error('Erro colaborativo:', message.message);
        break;
    }
  }, [tripId]);

  const sendEdit = useCallback((changes: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'trip_edit',
        changes
      }));
    }
  }, []);

  const sendCursorMove = useCallback((cursor: { line: number; col: number }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor_move',
        cursor
      }));
    }
  }, []);

  const sendFieldFocus = useCallback((fieldName: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'field_focus',
        fieldName
      }));
    }
  }, []);

  const sendFieldBlur = useCallback((fieldName: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'field_blur',
        fieldName
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(prev => ({ ...prev, isConnected: false, participants: [] }));
  }, []);

  useEffect(() => {
    if (user && tripId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, tripId, connect, disconnect]);

  return {
    ...state,
    sendEdit,
    sendCursorMove,
    sendFieldFocus,
    sendFieldBlur,
    connect,
    disconnect
  };
}