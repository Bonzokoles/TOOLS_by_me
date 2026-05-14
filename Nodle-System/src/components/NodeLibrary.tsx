
import React from 'react';

interface PresetNode {
    type: string;
    label: string;
    description: string;
    metadata: Record<string, any>;
    icon: string;
}

const PRESETS: Record<string, PresetNode[]> = {
    "AI Models": [
        {
            type: 'llm_processor',
            label: 'Llama 3 Instruct',
            description: 'Large Language Model optimized for chat.',
            metadata: { "Model": "Llama-3-70b", "VRAM": "24GB", "Status": "Idle" },
            icon: '🧠'
        },
        {
            type: 'llm_processor',
            label: 'DeepSeek R1',
            description: 'Reasoning model for complex queries.',
            metadata: { "Model": "DeepSeek-R1-Distill", "Context": "128k", "Provider": "Local" },
            icon: '🐋'
        },
        {
            type: 'rag',
            label: 'Stable Diffusion',
            description: 'Image generation pipeline.',
            metadata: { "Model": "SDXL Turbo", "Steps": "4", "Resolution": "1024x1024" },
            icon: '🎨'
        }
    ],
    "Data Storage": [
        {
            type: 'vector_db',
            label: 'ChromaDB Main',
            description: 'Vector store for document embeddings.',
            metadata: { "Collection": "main", "Records": "15,200", "Metric": "cosine" },
            icon: '🗄️'
        },
        {
            type: 'kg',
            label: 'Knowledge Graph',
            description: 'Entity-relationship memory storage.',
            metadata: { "Nodes": "4,500", "Edges": "12,000", "Format": "NetworkX" },
            icon: '🕸️'
        },
        {
            type: 'vector_db',
            label: 'Redis Cache',
            description: 'High-speed session storage.',
            metadata: { "Port": "6379", "Keys": "Active", "Memory": "256MB" },
            icon: '⚡'
        }
    ],
    "Services": [
        {
            type: 'api',
            label: 'API Gateway',
            description: 'Main ingress for all traffic.',
            metadata: { "Port": "8000", "Protocol": "HTTP/2", "RateLimit": "100/s" },
            icon: '🌐'
        },
        {
            type: 'service',
            label: 'Indexer Agent',
            description: 'Watches filesystem for changes.',
            metadata: { "WatchPath": "/workspace", "Interval": "5s", "Status": "Polling" },
            icon: '🕵️'
        },
        {
            type: 'system',
            label: 'Docker Host',
            description: 'Container engine runtime.',
            metadata: { "Containers": "6 Running", "CPU": "12%", "RAM": "4.2GB" },
            icon: '🐳'
        }
    ]
};

interface NodeLibraryProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NodeLibrary({ isOpen, onClose }: NodeLibraryProps) {
    if (!isOpen) return null;

    const onDragStart = (event: React.DragEvent, nodeData: PresetNode) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
        event.dataTransfer.effectAllowed = 'move';
    };


    return (
        <div style={{
            position: 'absolute',
            top: '80px',
            left: '20px',
            width: '260px',
            maxHeight: 'calc(100vh - 100px)',
            background: 'rgba(10, 13, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(74, 158, 255, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '12px',
                borderBottom: '1px solid rgba(74, 158, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(74, 158, 255, 0.1)'
            }}>
                <span style={{ fontWeight: 700, color: '#e8edf5' }}>Node Library</span>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: '#7a8396', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    ×
                </button>
            </div>

            <div style={{ overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(PRESETS).map(([category, items]) => (
                    <div key={category}>
                        <div style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            color: '#7a8396',
                            fontWeight: 600,
                            marginBottom: '8px',
                            letterSpacing: '1px'
                        }}>
                            {category}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, item)}
                                    style={{
                                        padding: '10px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        cursor: 'grab',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s'
                                    }}
                                    className="library-node-item"
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                    <div>
                                        <div style={{ color: '#e8edf5', fontSize: '0.9rem', fontWeight: 500 }}>{item.label}</div>
                                        <div style={{ color: '#7a8396', fontSize: '0.7rem' }}>{item.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                padding: '8px',
                fontSize: '0.7rem',
                color: '#555',
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                Drag items to the canvas
            </div>
        </div>
    );
}
