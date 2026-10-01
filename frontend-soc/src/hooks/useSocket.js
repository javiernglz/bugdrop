import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import useAlertSound from './useAlertSound';

export default function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const playAlert = useAlertSound();

  useEffect(() => {
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('http-log', (log) => {
      setLogs(prev => [log, ...prev].slice(0, 500));

      if (log.hasThreat && log.maxSeverity === 'critical') {
        playAlert('critical');
      } else if (log.hasThreat) {
        playAlert('high');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [playAlert]);

  const clearLogs = useCallback(() => setLogs([]), []);

  const stats = useMemo(() => ({
    total: logs.length,
    threats: logs.filter(l => l.hasThreat).length,
    flags: logs.filter(l => l.responseFlag).length,
  }), [logs]);

  return { connected, logs, clearLogs, stats };
}
