import { memo } from 'react';
import { Handle, Position, NodeResizer, useNodes } from '@xyflow/react';
import { useDiagramStore } from '../store/diagramStore';
import './GroupNode.css';

interface GroupNodeData {
    label: string;
    description?: string;
    color?: string;
    collapsed?: boolean;
}

interface GroupNodeProps {
    id: string;
    data: GroupNodeData;
    selected?: boolean;
}

function GroupNode({ id, data, selected }: GroupNodeProps) {
    const groupColor = data.color || '#4a9eff';
    const nodes = useNodes();
    const { ungroupNodes } = useDiagramStore();

    // Find child nodes
    const childNodes = nodes.filter(node => node.parentId === id);

    const handleUngroup = (e: React.MouseEvent) => {
        e.stopPropagation();
        ungroupNodes(id);
    };

    return (
        <>
            <NodeResizer
                minWidth={200}
                minHeight={150}
                isVisible={selected}
                lineStyle={{
                    borderColor: groupColor,
                    borderWidth: 2,
                }}
                handleStyle={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: groupColor,
                }}
            />
            <div
                className={`group-node ${selected ? 'selected' : ''} ${data.collapsed ? 'collapsed' : ''}`}
                style={{
                    borderColor: groupColor,
                    backgroundColor: `${groupColor}10`,
                }}
            >
                {/* Group Header */}
                <div
                    className="group-header"
                    style={{
                        borderBottomColor: `${groupColor}40`,
                        background: `linear-gradient(135deg, ${groupColor}20 0%, ${groupColor}10 100%)`,
                    }}
                >
                    <div className="group-title">
                        <span className="group-icon">📦</span>
                        <span className="group-label">{data.label}</span>
                        <button
                            className="ungroup-btn"
                            onClick={handleUngroup}
                            title="Ungroup nodes"
                        >
                            ✂️ Ungroup
                        </button>
                    </div>
                    {data.description && (
                        <div className="group-description">{data.description}</div>
                    )}

                    {/* Child nodes list */}
                    {childNodes.length > 0 && (
                        <div className="group-children-list">
                            <div className="children-header">
                                Contains {childNodes.length} node{childNodes.length !== 1 ? 's' : ''}:
                            </div>
                            <ul className="children-items">
                                {childNodes.map(child => (
                                    <li key={child.id} className="child-item">
                                        <span className="child-bullet">•</span>
                                        <span className="child-name">{(child.data as Record<string, unknown>).label as string || child.id}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Group Content Area (for child nodes) */}
                {!data.collapsed && (
                    <div className="group-content">
                        {/* Child nodes will be rendered here by React Flow */}
                    </div>
                )}

                {/* Handles for connections */}
                <Handle
                    type="target"
                    position={Position.Left}
                    style={{
                        background: groupColor,
                        width: 12,
                        height: 12,
                    }}
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{
                        background: groupColor,
                        width: 12,
                        height: 12,
                    }}
                />
            </div>
        </>
    );
}

export default memo(GroupNode);
