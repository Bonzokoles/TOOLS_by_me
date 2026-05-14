
import { useDiagramStore } from '../store/diagramStore';
import type { CustomNodeData } from '../types';
import './NodePanel.css';

export default function NodePanel() {
    const { selectedNode, deleteNode, setSelectedNode } = useDiagramStore();

    if (!selectedNode) {
        return (
            <div className="node-panel">
                <div className="panel-header">
                    <h3>Node Details</h3>
                </div>
                <div className="panel-content">
                    <p className="panel-empty">Select a node to view details</p>
                </div>
            </div>
        );
    }

    const data = selectedNode.data as unknown as CustomNodeData;

    const handleDelete = async () => {
        if (confirm(`Delete node "${data.label}"?`)) {
            await deleteNode(selectedNode.id);
            setSelectedNode(null);
        }
    };

    const handleClose = () => {
        setSelectedNode(null);
    };

    return (
        <div className="node-panel">
            <div className="panel-header">
                <h3>Node Details</h3>
                <button className="close-btn" onClick={handleClose}>
                    ✕
                </button>
            </div>

            <div className="panel-content">
                <div className="detail-section">
                    <label>Name</label>
                    <div className="detail-value">{data.label}</div>
                </div>

                <div className="detail-section">
                    <label>Type</label>
                    <div className="detail-value">
                        <span className={`type-badge ${data.nodeType}`}>
                            {data.nodeType.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="detail-section">
                    <label>Description</label>
                    <div className="detail-value">{data.description}</div>
                </div>

                <div className="detail-section">
                    <label>Files ({data.files?.length || 0})</label>
                    <div className="files-list">
                        {data.files?.length > 0 ? (
                            data.files.map((file, idx) => (
                                <div key={idx} className="file-item">
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">{file.size}</span>
                                </div>
                            ))
                        ) : (
                            <div className="no-files">No files attached</div>
                        )}
                    </div>
                </div>

                <div className="detail-section">
                    <label>Position</label>
                    <div className="detail-value">
                        X: {Math.round(selectedNode.position.x)}, Y: {Math.round(selectedNode.position.y)}
                    </div>
                </div>

                <div className="panel-actions">
                    <button className="btn-danger" onClick={handleDelete}>
                        🗑️ Delete Node
                    </button>
                </div>
            </div>
        </div>
    );
}
