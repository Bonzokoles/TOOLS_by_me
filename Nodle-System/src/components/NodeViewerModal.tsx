import { useEffect, useState } from 'react';
import './NodeModal.css'; // Reuse modal styles for now or create NodeViewerModal.css

interface NodeViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    node: any;
}

export default function NodeViewerModal({ isOpen, onClose, node }: NodeViewerModalProps) {
    const [stats, setStats] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && node) {
            fetchNodeData();
        }
    }, [isOpen, node]);

    const fetchNodeData = async () => {
        setLoading(true);
        // Mock data fetching logic based on node type
        try {
            // In a real scenario, we would call the agent's API
            // const res = await fetch(`http://localhost:${node.data.port}/stats`);
            // const data = await res.json();

            // For demo purposes, simulate data
            await new Promise(r => setTimeout(r, 500));

            if (node.data.label.includes('Reader')) {
                setStats({
                    status: 'Active',
                    files_scanned: 1420,
                    last_scan: '2 mins ago',
                    root_dir: '/workspace'
                });
                setLogs([
                    '[INFO] Scanning /workspace/src...',
                    '[INFO] Found 15 python files',
                    '[INFO] Reading main.py...',
                    '[SUCCESS] File content cached'
                ]);
            } else if (node.data.label.includes('Processor')) {
                setStats({
                    status: 'Idle',
                    processed: 850,
                    errors: 2,
                    queue: 0
                });
                setLogs([
                    '[INFO] Indexing job started',
                    '[INFO] Connecting to Vector DB...',
                    '[INFO] Batch 1/50 processed'
                ]);
            } else {
                setStats(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !node) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content viewer-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{node.data.nodeType === 'api' ? '🟣' : node.data.nodeType === 'rag' ? '🟢' : '🔵'}</span>
                        <h2>{node.data.label} <span style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 'normal' }}>Dashboard</span></h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body" style={{ padding: '20px' }}>
                    <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                        {/* Status Card */}
                        <div className="card" style={{ background: '#1a1d24', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#4a9eff' }}>System Status</h3>
                            {loading ? (
                                <div>Loading status...</div>
                            ) : stats ? (
                                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {Object.entries(stats).map(([key, value]: [string, any]) => (
                                        <div key={key}>
                                            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{value}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ opacity: 0.6 }}>No live stats available for this node type.</div>
                            )}
                        </div>

                        {/* Actions Card */}
                        <div className="card" style={{ background: '#1a1d24', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#ab47bc' }}>Control Panel</h3>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.9rem' }} onClick={() => alert('Triggering scan...')}>▶ Run Scan</button>
                                <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.9rem' }} onClick={() => alert('Clearing cache...')}>🗑️ Clear Cache</button>
                                <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.9rem' }} onClick={() => fetchNodeData()}>↻ Refresh</button>
                            </div>
                        </div>

                        {/* Logs / Console */}
                        <div className="card" style={{ gridColumn: '1 / -1', background: '#0f1115', padding: '15px', borderRadius: '8px', border: '1px solid #333', fontFamily: 'monospace' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#ffa726', fontSize: '1rem' }}>Live Logs</h3>
                            <div className="logs-window" style={{ height: '150px', overflowY: 'auto', fontSize: '0.9rem', color: '#ccc' }}>
                                {loading ? 'Fetching logs...' : logs.length > 0 ? (
                                    logs.map((log, i) => <div key={i} style={{ marginBottom: '4px' }}>{log}</div>)
                                ) : (
                                    <div style={{ opacity: 0.5 }}>No recent logs.</div>
                                )}
                            </div>
                        </div>

                        {/* File Preview (if Applicable) */}
                        <div className="card" style={{ gridColumn: '1 / -1', background: '#1a1d24', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#42d392' }}>Attached Files</h3>
                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                                {node.data.files && node.data.files.length > 0 ? (
                                    node.data.files.map((f: any, i: number) => (
                                        <div key={i} style={{ background: '#2a2d35', padding: '8px', borderRadius: '4px', minWidth: '150px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>📄 {f.name}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{f.language}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ opacity: 0.6 }}>No files attached to this node.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
