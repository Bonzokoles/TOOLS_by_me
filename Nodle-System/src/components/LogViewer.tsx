import React, { useEffect, useState, useRef } from 'react';
import type { Node } from '@xyflow/react';
import { wsClient } from '../api/websocket';

interface LogEntry {
    source: string;
    level: string;
    message: string;
    timestamp?: string;
}

export const LogViewer: React.FC<{ node: Node }> = ({ node }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Mock initial logs or just start empty

        const handleLog = (data: any) => {
            // Filter logs relevant to this node if possible, or show all for now
            // For Indexer Agent, we trigger on any file change
            setLogs(prev => [...prev, data]);
        };

        wsClient.on('LOG', handleLog);

        return () => {
            wsClient.off('LOG', handleLog);
        };
    }, [node.id]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            height: '600px',
            background: '#0d0d0d',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '20px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            overflow: 'auto',
            color: '#aaddff'
        }}>
            <div style={{ color: '#888', marginBottom: '10px' }}>// Real-time log stream</div>
            {logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '4px', display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#666' }}>[{new Date().toLocaleTimeString()}]</span>
                    <span style={{
                        color: log.level === 'ERROR' ? '#ff4757' :
                            log.level === 'WARN' ? '#ffa502' :
                                '#42d392'
                    }}>[{log.level}]</span>
                    <span style={{ color: '#888' }}>[{log.source}]</span>
                    <span>{log.message}</span>
                </div>
            ))}
            <div ref={endRef} />
        </div>
    );
};
