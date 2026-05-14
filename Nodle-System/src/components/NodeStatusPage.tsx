import React, { useState } from 'react';
import type { Node } from '@xyflow/react';
import type { CustomNodeData } from '../types';
import { LogViewer } from './LogViewer';

import { SubFlowView } from './SubFlowView';

interface NodeStatusPageProps {
    node: Node;
    onBack: () => void;
}

const NodeStatusPage: React.FC<NodeStatusPageProps> = ({ node, onBack }) => {
    const data = node.data as unknown as CustomNodeData;
    const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'files' | 'config' | 'inside_noodles'>('overview');

    // Status simulation - fixed seed or effect
    const [isOnline] = useState(() => Math.random() > 0.1);
    const uptime = "24h 13m 42s";

    return (
        <div style={{
            position: 'fixed',
            top: '60px', // Below header
            right: 0,
            bottom: 0,
            width: '600px', // Fixed width side panel
            maxWidth: '90vw',
            zIndex: 100,
            background: 'rgba(10, 13, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(74, 158, 255, 0.3)',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <header style={{
                padding: '24px 40px',
                borderBottom: '1px solid rgba(74, 158, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(10, 13, 20, 0.95)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(74, 158, 255, 0.3)',
                            color: '#4a9eff',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(74, 158, 255, 0.1)';
                            e.currentTarget.style.borderColor = '#4a9eff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(74, 158, 255, 0.3)';
                        }}
                    >
                        ← Back to Main
                    </button>

                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                            {data.label || 'Unknown Agent'}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isOnline ? '#42d392' : '#ff4757',
                                boxShadow: isOnline ? '0 0 8px #42d392' : '0 0 8px #ff4757'
                            }} />
                            <span style={{ fontSize: '0.85rem', color: isOnline ? '#42d392' : '#ff4757', fontWeight: 500 }}>
                                {isOnline ? 'OPERATIONAL' : 'OFFLINE'}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 8px' }}>•</span>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ID: {node.id}</span>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 8px' }}>•</span>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Port: {data.nodeType === 'vector_db' || data.nodeType === 'rag' ? '82xx' : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Actions placeholder */}
                    <button style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                        Restart Service
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div style={{
                padding: '0 40px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.01)'
            }}>
                <div style={{ display: 'flex', gap: '32px' }}>
                    {['overview', 'inside_noodles', 'logs', 'files', 'config'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                padding: '16px 0',
                                color: activeTab === tab ? '#4a9eff' : '#94a3b8',
                                borderBottom: activeTab === tab ? '2px solid #4a9eff' : '2px solid transparent',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: activeTab === tab ? 600 : 400,
                                textTransform: 'capitalize',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab === 'inside_noodles' ? 'Inside Noodles 🍜' : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '40px', overflow: 'auto', background: 'radial-gradient(circle at top right, rgba(74, 158, 255, 0.05) 0%, transparent 40%)' }}>

                {activeTab === 'overview' && (
                    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' }}>Performance Metrics</h3>
                            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #333', borderRadius: '8px', color: '#666' }}>
                                [Mock Chart: CPU & Memory Usage]
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Details</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 24px', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#64748b' }}>Type:</span>
                                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>{data.nodeType}</span>

                                    <span style={{ color: '#64748b' }}>Uptime:</span>
                                    <span>{uptime}</span>

                                    <span style={{ color: '#64748b' }}>Location:</span>
                                    <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>/agents/python/{node.id.replace('node_', '').split('_')[1] || 'generic'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inside_noodles' && (
                    <div style={{ height: '100%', minHeight: '500px' }}>
                        <SubFlowView parentNodeLabel={data.label} parentNodeType={data.nodeType} />
                    </div>
                )}

                {activeTab === 'logs' && (
                    <LogViewer node={node} />
                )}

                {activeTab === 'files' && (
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h3 style={{ marginTop: 0 }}>Attached Files ({data.files?.length || 0})</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {data.files?.map((file: any, i: number) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4a9eff'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                                >
                                    <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        📄 {file.name}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'monospace' }}>
                                        {file.language || 'text'} • {file.content?.length || 0} bytes
                                    </div>
                                </div>
                            ))}

                            {(!data.files || data.files.length === 0) && (
                                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#666', border: '1px dashed #333', borderRadius: '8px' }}>
                                    No files attached to this node.
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>

            <style>
                {`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
            </style>
        </div>
    );
};

export default NodeStatusPage;
