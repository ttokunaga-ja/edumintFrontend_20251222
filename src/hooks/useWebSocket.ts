import { useEffect, useRef } from 'react';
import { useJobStore } from '../stores/jobStore';

export const useWebSocket = (jobId: string | null) => {
  const ws = useRef<WebSocket | null>(null);
  const { updatePhase, setError } = useJobStore();

  useEffect(() => {
    if (!jobId) return;

    // edumintGateway の WebSocket エンドポイント（例: ws://gateway.edu/jobs/{jobId}）
    const token = localStorage.getItem('jwt');
    const wsUrl = token ? `ws://gateway.edu/jobs/${jobId}?token=${token}` : `ws://gateway.edu/jobs/${jobId}`;

    try {
      ws.current = new WebSocket(wsUrl);
    } catch (e) {
      // In some environments (or when connection is refused), WebSocket constructor may throw.
      // Fail gracefully and set an error to allow fallback polling logic elsewhere.
      console.warn('WebSocket constructor failed', e);
      setError('WebSocket connection failed');
      return;
    }

    ws.current.onmessage = (event) => {
      try {
        const { status, message, progress, data, error } = JSON.parse(event.data);
        if (error) setError(error);
        else updatePhase(status as any, data);
      } catch (err) {
        console.warn('Failed to parse WebSocket message', err);
      }
    };

    ws.current.onerror = () => setError('WebSocket error');

    return () => ws.current?.close();
  }, [jobId]);

  return ws.current;
};