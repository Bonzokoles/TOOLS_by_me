import { useState } from 'react';
import { useDiagramStore } from '../store/diagramStore';
import { fastcodeClient } from '../api/fastcodeClient';
import { saveViewToLocal, loadAllViews, exportViewAsJSON, exportViewAsPNG } from '../utils/viewManager';
import { downloadDiagramHTML, previewDiagramHTML } from '../utils/exportMermaidHTML';
import { useReactFlow } from '@xyflow/react';
import './Toolbar.css';

interface ToolbarProps {
    onAddNode: () => void;
    onTogglePanel?: () => void;
    onToggleLibrary?: () => void;
    onCheckStatus?: () => void;
    onCreateGroup?: () => void;
    isNodeSelected?: boolean;
}

export default function Toolbar({ onAddNode, onTogglePanel, onToggleLibrary, onCheckStatus, onCreateGroup, isNodeSelected }: ToolbarProps) {
    const { nodes, edges, saveToBackend, isLoading, importFromFastCode, fastcodeStatus } = useDiagramStore();
    const reactFlowInstance = useReactFlow();
    const [showViewMenu, setShowViewMenu] = useState(false);
    const [showFastCodeMenu, setShowFastCodeMenu] = useState(false);
    const [fastcodeAvailable, setFastcodeAvailable] = useState<boolean | null>(null);
    const savedViews = loadAllViews();

    const handleAnalyzeRepo = async () => {
        const source = prompt('Enter repo path or git URL:');
        if (!source) return;

        const isUrl = source.startsWith('http') || source.startsWith('git@');
        await importFromFastCode(source, isUrl);
        setShowFastCodeMenu(false);
    };

    const handleCheckFastCode = async () => {
        const res = await fastcodeClient.getStatus();
        if (res.success && res.data) {
            setFastcodeAvailable(true);
            alert(
                `FastCode Adapter: ${res.data.status}\n` +
                `Engine: ${res.data.fastcode_available ? 'OK' : 'Not loaded'}\n` +
                `Cached: ${res.data.cached_nodes} nodes, ${res.data.cached_edges} edges\n` +
                `Source: ${res.data.cached_source || 'none'}`
            );
        } else {
            setFastcodeAvailable(false);
            alert('FastCode adapter not reachable (port 3886)');
        }
    };

    const handleLoadCachedGraph = async () => {
        const { loadFastCodeCache } = useDiagramStore.getState();
        await loadFastCodeCache();
        setShowFastCodeMenu(false);
    };

    const handleSaveView = () => {
        const name = prompt('Enter view name:');
        if (!name) return;

        const viewport = reactFlowInstance.getViewport();
        saveViewToLocal(name, nodes, edges, viewport);
        alert(`View "${name}" saved!`);
    };

    const handleLoadView = (viewId: string) => {
        const view = savedViews.find((v) => v.id === viewId);
        if (!view) return;

        useDiagramStore.setState({ nodes: view.nodes, edges: view.edges });
        if (view.viewport) {
            reactFlowInstance.setViewport(view.viewport);
        }
        setShowViewMenu(false);
    };

    const handleExportJSON = () => {
        const name = prompt('Enter export name:') || 'diagram';
        const viewport = reactFlowInstance.getViewport();
        const view = {
            id: `export-${Date.now()}`,
            name,
            nodes,
            edges,
            viewport,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        exportViewAsJSON(view);
    };

    const handleExportPNG = async () => {
        const name = prompt('Enter filename:') || 'diagram';
        await exportViewAsPNG('react-flow-wrapper', name);
    };

    const handleExportHTML = () => {
        const title = prompt('Diagram title:') || 'Noodle Diagram';
        const desc = prompt('Description (optional):') || '';
        downloadDiagramHTML(nodes, edges, title, desc);
    };

    const handlePreviewHTML = () => {
        previewDiagramHTML(nodes, edges, 'Noodle Diagram Preview');
    };

    const handleSync = async () => {
        // Sync now acts as a Save/Push operation
        await saveToBackend();
        // Optionally reload to confirm? For now just save is safer to avoid UI jumping
        // await loadFromBackend(); 
    };

    return (
        <div className="toolbar">
            <div className="toolbar-section">
                <h3 className="toolbar-title">🔷 Nodle System</h3>
            </div>

            <div className="toolbar-section">
                <button className="toolbar-btn" onClick={onToggleLibrary} title="Open Node Library">
                    📚 Library
                </button>

                <button className="toolbar-btn primary" onClick={onAddNode} disabled={isLoading}>
                    ➕ Add Node
                </button>

                <button className="toolbar-btn" onClick={onTogglePanel} title="Toggle Details Panel">
                    ℹ️ Panel
                </button>

                {onCheckStatus && (
                    <button
                        className={`toolbar-btn ${isNodeSelected ? 'status-active' : ''}`}
                        onClick={onCheckStatus}
                        disabled={!isNodeSelected}
                        title="Check Status of Selected Node"
                        style={{
                            border: isNodeSelected ? '1px solid #4a9eff' : '1px solid transparent',
                            background: isNodeSelected ? 'rgba(74, 158, 255, 0.1)' : 'transparent',
                            color: isNodeSelected ? '#4a9eff' : '#555',
                            cursor: isNodeSelected ? 'pointer' : 'not-allowed'
                        }}
                    >
                        🩺 Check Status
                    </button>
                )}

                <button className="toolbar-btn" onClick={handleSync} disabled={isLoading}>
                    🔄 {isLoading ? 'Syncing...' : 'Sync'}
                </button>

                {onCreateGroup && (
                    <button
                        className="toolbar-btn"
                        onClick={onCreateGroup}
                        title="Create Group from Selected Nodes"
                    >
                        📦 Create Group
                    </button>
                )}
            </div>

            <div className="toolbar-section">
                <button className="toolbar-btn" onClick={handleSaveView}>
                    💾 Save View
                </button>

                <div className="dropdown">
                    <button className="toolbar-btn" onClick={() => setShowViewMenu(!showViewMenu)}>
                        📂 Load View ({savedViews.length})
                    </button>
                    {showViewMenu && (
                        <div className="dropdown-menu">
                            {savedViews.length === 0 ? (
                                <div className="dropdown-item disabled">No saved views</div>
                            ) : (
                                savedViews.map((view) => (
                                    <div
                                        key={view.id}
                                        className="dropdown-item"
                                        onClick={() => handleLoadView(view.id)}
                                    >
                                        {view.name}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="toolbar-section">
                <button className="toolbar-btn" onClick={handleExportJSON}>
                    📄 Export JSON
                </button>

                <button className="toolbar-btn" onClick={handleExportPNG}>
                    📸 Export PNG
                </button>

                <button className="toolbar-btn" onClick={handleExportHTML} title="Export as interactive HTML with Mermaid diagram">
                    🌐 Export HTML
                </button>

                <button className="toolbar-btn" onClick={handlePreviewHTML} title="Preview Mermaid diagram in new tab">
                    👁 Preview
                </button>
            </div>

            <div className="toolbar-section">
                <div className="dropdown">
                    <button
                        className="toolbar-btn"
                        onClick={() => setShowFastCodeMenu(!showFastCodeMenu)}
                        style={{
                            border: fastcodeAvailable === true ? '1px solid #00cc88' : '1px solid transparent',
                            background: fastcodeStatus ? 'rgba(0, 204, 136, 0.1)' : 'transparent',
                        }}
                        title="FastCode Code Analysis"
                    >
                        ⚡ FastCode
                    </button>
                    {showFastCodeMenu && (
                        <div className="dropdown-menu" style={{ minWidth: '180px' }}>
                            <div className="dropdown-item" onClick={handleAnalyzeRepo}>
                                🔍 Analyze Repository
                            </div>
                            <div className="dropdown-item" onClick={handleLoadCachedGraph}>
                                📥 Load Cached Graph
                            </div>
                            <div className="dropdown-item" onClick={handleCheckFastCode}>
                                🩺 Check Adapter Status
                            </div>
                        </div>
                    )}
                </div>
                {fastcodeStatus && (
                    <span style={{ fontSize: '0.7em', color: '#00cc88', marginLeft: '4px' }}>
                        {fastcodeStatus}
                    </span>
                )}
            </div>
        </div>
    );
}
