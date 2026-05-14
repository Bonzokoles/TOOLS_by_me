import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import './CustomNode.css';

import type { CustomNodeData, FileInfo } from './types';

interface CustomNodeProps {
    data: CustomNodeData;
    selected?: boolean;
}

function CustomNode({ data, selected }: CustomNodeProps) {
    const [expanded, setExpanded] = useState(false);
    const [activeFile, setActiveFile] = useState<number | null>(null);

    const nodeColors: Record<string, string> = {
        // Node Type Colors
        rag: '#4a9eff',
        vector_db: '#42d392',
        kg: '#ffa726',
        api: '#ab47bc',
        system: '#ff4d4f',
        agent: '#ff5252',
        application: '#ffa726',
        service: '#26c6da',
        infrastructure: '#42d392',
        ai: '#ab47bc',
        default: '#8c8c8c',
    };

    // Category Colors (for grouping by purpose)
    const categoryColors: Record<string, string> = {
        data: '#4a9eff',        // Blue
        ai: '#ab47bc',          // Purple
        infrastructure: '#42d392', // Green
        application: '#ffa726',    // Orange
        service: '#26c6da',     // Teal
        agent: '#ff5252',       // Red
        system: '#8c8c8c',      // Gray
    };

    const getNodeColor = (type: string) => {
        // Prioritize category color if available
        if (data.category && categoryColors[data.category]) {
            return categoryColors[data.category];
        }
        // Fallback to nodeType color
        return nodeColors[type] || nodeColors.default;
    };

    const toggleFile = (index: number) => {
        setActiveFile(activeFile === index ? null : index);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // --- Dynamic Status Lights Logic ---
    // User Request: "brak światełek=brak zawartości" (no lights = no content)
    // "nodle pracuje" (working) -> green
    // "posiada problem" -> red

    const hasContent = data.files.length > 0 || (data.metadata && Object.keys(data.metadata).length > 0);
    const status = data.status || (hasContent ? 'operational' : 'idle');

    // Helper for box-shadow glow
    const getGlow = (color: string, isActive: boolean) => isActive ? `0 0 8px ${color}, 0 0 12px ${color}` : 'none';
    // Define light states
    const isError = status === 'error';
    const isWarning = status === 'warning';
    const isWorking = status === 'operational'; // Green when operational

    // If no content, force everything dim/off unless explicitly errored
    const showLights = hasContent || isError;

    return (
        <div
            className={`custom-node ${expanded ? 'expanded' : ''} ${selected ? 'selected' : ''}`}
            style={{
                borderColor: getNodeColor(data.nodeType),
                boxShadow: selected ? `0 0 0 2px ${getNodeColor(data.nodeType)}` : undefined,
            }}
        >
            {/* Left Handles (Inputs) */}
            <Handle type="target" position={Position.Left} id="target-1" style={{ top: '30%' }} />
            <Handle type="target" position={Position.Left} id="target-2" style={{ top: '70%' }} />

            <div className={`node-header ${expanded ? 'expanded-header' : ''}`} style={{ borderBottomColor: getNodeColor(data.nodeType) }}>
                {/* ... existing header content ... */}
                <div className="node-title">
                    <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
                        {/* Red Light (Error) */}
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: '#ff5f56',
                            boxShadow: showLights ? getGlow('#ff5f56', isError) : 'none',
                            opacity: showLights ? (isError ? 1 : 0.3) : 0.1,
                            transition: 'all 0.3s ease'
                        }} title="Error / Stop"></div>

                        {/* Yellow Light (Warning) */}
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: '#ffbd2e',
                            boxShadow: showLights ? getGlow('#ffbd2e', isWarning) : 'none',
                            opacity: showLights ? (isWarning ? 1 : 0.3) : 0.1,
                            transition: 'all 0.3s ease'
                        }} title="Warning"></div>

                        {/* Green Light (Operational/Working) */}
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: '#27c93f',
                            boxShadow: showLights ? getGlow('#27c93f', isWorking) : 'none',
                            opacity: showLights ? (isWorking ? 1 : 0.3) : 0.1,
                            transition: 'all 0.3s ease'
                        }} title="Operational"></div>
                    </div>

                    <span
                        className="node-type-badge"
                        style={{
                            backgroundColor: `${getNodeColor(data.nodeType)}20`,
                            color: getNodeColor(data.nodeType),
                        }}
                    >
                        {(data.nodeType || 'UNKNOWN').toUpperCase()}
                    </span>
                    <span className="node-label">{data.label}</span>
                </div>
                <div className="node-actions">
                    <button className="node-btn small" title="Insert Node" style={{ fontSize: '0.8rem', marginRight: '4px' }}>➕</button>
                    <button className="node-btn" onClick={() => setExpanded(!expanded)} title={expanded ? "Collapse (Roll up)" : "Expand"}>
                        {expanded ? '🔼' : '🔽'}
                    </button>
                </div>
            </div>

            <div className="node-content">
                {/* ... existing content ... */}
                <div className="node-description">{data.description}</div>

                {data.metadata && Object.keys(data.metadata).length > 0 && (
                    <div className="node-metadata" style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: '4px 12px',
                        fontSize: '0.75rem',
                        marginBottom: '12px',
                        padding: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        {Object.entries(data.metadata).map(([key, value]) => (
                            <div key={key} style={{ display: 'contents' }}>
                                <span style={{ color: '#7a8396', fontWeight: 600 }}>{key}:</span>
                                <span style={{ color: '#e8edf5', fontFamily: 'monospace' }}>{String(value)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {data.files.length > 0 ? (
                    <div className="node-files">
                        <div className="files-header">
                            📁 Files ({data.files.length})
                        </div>
                        {data.files.map((file: FileInfo, idx: number) => (
                            <div key={idx} className="file-container">
                                <div
                                    className={`file-item ${activeFile === idx ? 'active' : ''}`}
                                    onClick={() => toggleFile(idx)}
                                >
                                    <span className="file-name">📄 {file.name}</span>
                                    <span className="file-size">{file.size}</span>
                                </div>

                                {activeFile === idx && file.content && (
                                    <div className="file-viewer">
                                        <div className="file-viewer-header">
                                            <div className="file-path">{file.path}</div>
                                            <button
                                                className="copy-btn"
                                                onClick={() => copyToClipboard(file.content || '')}
                                                title="Copy to clipboard"
                                            >
                                                📋
                                            </button>
                                        </div>
                                        <div className="code-viewer">
                                            <pre>
                                                <code className={`language-${(file as any).lang || 'text'}`}>{file.content}</code>
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-files">No files attached</div>
                )}
            </div>

            {/* Right Handles (Outputs) */}
            <Handle type="source" position={Position.Right} id="source-1" style={{ top: '30%' }} />
            <Handle type="source" position={Position.Right} id="source-2" style={{ top: '70%' }} />
        </div>
    );
}

export default memo(CustomNode);
