import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    useReactFlow,
    type EdgeProps,
} from '@xyflow/react';
import './CustomEdge.css';

export default function CustomEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
    source,
    target,
}: EdgeProps) {
    const { getNode } = useReactFlow();
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Get source and target nodes to determine status
    const sourceNodeData = getNode(source);
    const targetNodeData = getNode(target);

    // Status based on node existence
    const isSourceOnline = !!sourceNodeData;
    const isTargetOnline = !!targetNodeData;

    // If both are online => Green edge. If mismatch or error => Red.
    // For demo, let's just make it green by default, red if specific property set
    const isHealthy = isSourceOnline && isTargetOnline;

    const edgeColor = isHealthy ? '#42d392' : '#ff4d4f';

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: edgeColor, strokeWidth: 2 }} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <div className="edge-info-marker" onClick={() => console.log('Edge info clicked')}>
                        {(data as Record<string, unknown>)?.label as string || 'Link'}
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
