import React, { useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    addEdge,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    type Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface SubFlowViewProps {
    parentNodeLabel: string;
    parentNodeType: string;
}

const initialNodes: Node[] = [
    { id: 'sub-1', position: { x: 50, y: 50 }, data: { label: 'Input Handler' }, type: 'input' },
    { id: 'sub-2', position: { x: 250, y: 50 }, data: { label: 'Process Logic' } },
    { id: 'sub-3', position: { x: 450, y: 50 }, data: { label: 'Output' }, type: 'output' },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'sub-1', target: 'sub-2', animated: true },
    { id: 'e2-3', source: 'sub-2', target: 'sub-3', animated: true },
];

export const SubFlowView: React.FC<SubFlowViewProps> = ({ parentNodeLabel, parentNodeType }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onAddNode = useCallback(() => {
        const newId = `sub-${nodes.length + 1}`;
        const newNode: Node = {
            id: newId,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: `Node ${newId}` },
            type: 'default'
        };
        setNodes((nds) => nds.concat(newNode));
    }, [nodes, setNodes]);

    return (
        <div style={{ width: '100%', height: '500px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0px', overflow: 'hidden', background: '#000000' }}>
            <div style={{
                padding: '10px 20px',
                background: '#000000',
                color: '#e2e8f0',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.9rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>🍜 <strong>Internal Logic:</strong> {parentNodeLabel} ({parentNodeType})</span>
                <button
                    onClick={onAddNode}
                    style={{
                        background: '#0a0a0a',
                        border: '1px solid #4a9eff',
                        color: '#4a9eff',
                        padding: '4px 12px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}
                >
                    + Add Noodle
                </button>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Background color="#222" gap={20} />
                <Controls style={{ borderRadius: 0 }} />
            </ReactFlow>
        </div>
    );
};
