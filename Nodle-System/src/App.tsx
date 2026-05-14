import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as addReactFlowEdge,
  BackgroundVariant,
  type Node,
  type Connection,
  type NodeChange,
  type EdgeChange,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import CustomEdge from './components/CustomEdge';
import type { CustomNodeData } from './types';
import Toolbar from './components/Toolbar';
import NodeLibrary from './components/NodeLibrary';
import NodeModal from './components/NodeModal';
import NodeViewerModal from './components/NodeViewerModal';


import { useDiagramStore } from './store/diagramStore';
import { wsClient } from './api/websocket';
import './App.css';

import NodeStatusPage from './components/NodeStatusPage';
import ChatBox from './components/ChatBox';

import LocalLLMProcessorNode from './components/LocalLLMProcessorNode';
import GroupNode from './components/GroupNode';

const nodeTypes = {
  custom: CustomNode,
  llm_processor: LocalLLMProcessorNode,
  group: GroupNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

function FlowDiagram() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNode,
    loadFromBackend,
    createGroup,
    error,
    addNode, // Destructure addNode here
  } = useDiagramStore();

  const { screenToFlowPosition, getNodes } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const nodeData = JSON.parse(type);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        name: nodeData.label,
        type: nodeData.type,
        description: nodeData.description,
        files: [],
        metadata: nodeData.metadata
      };

      addNode(newNode, position);
    },
    [screenToFlowPosition, addNode]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewerNode, setViewerNode] = useState<Node | null>(null);

  useEffect(() => {
    loadFromBackend();
    wsClient.connect();

    return () => {
      wsClient.disconnect();
    };
  }, [loadFromBackend]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(addReactFlowEdge(connection, edges));
    },
    [edges, setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setViewerNode(node);
      setIsViewerOpen(true);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Position persistence - auto-save on drag
  const [saveTimeout, setSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const { saveToBackend } = useDiagramStore();

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, _node: Node) => {
      // Debounce save to avoid excessive API calls
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(() => {
        console.log('💾 Auto-saving node positions...');
        saveToBackend();
      }, 500);

      setSaveTimeout(timeout);
    },
    [saveTimeout, saveToBackend]
  );

  // Group creation handler
  const handleCreateGroup = useCallback(() => {
    const selectedNodes = getNodes().filter(n => n.selected);

    if (selectedNodes.length === 0) {
      alert('⚠️ Please select at least one node to create a group');
      return;
    }

    const groupName = prompt('📦 Enter group name:', `Group ${Date.now()}`);
    if (!groupName) return;

    const selectedIds = selectedNodes.map(n => n.id);
    createGroup(selectedIds, groupName);
  }, [getNodes, createGroup]);

  // Color mapping for MiniMap
  const nodeColors: Record<string, string> = {
    api: '#ab47bc',
    rag: '#42d392',
    kg: '#ffa726',
    vector_db: '#4a9eff',
    system: '#ff4d4f',
  };

  // Extract selected node to avoid conditional hook call
  const selectedNode = useDiagramStore((state) => state.selectedNode);




  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: 'linear-gradient(135deg, #0a0d14 0%, #000000 100%)',
          borderBottom: '1px solid rgba(74, 158, 255, 0.4)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.9)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '1.6rem',
            color: '#4a9eff',
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          🔷 YELLOW HUB - IS NOT A SIMPLE DEMO
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#7a8396' }}>
          RAG System Visualization
        </div>
      </header>

      <Toolbar
        onAddNode={() => setIsModalOpen(true)}
        onTogglePanel={() => setIsDetailsOpen(!isDetailsOpen)}
        onToggleLibrary={() => setIsLibraryOpen(!isLibraryOpen)}
        onCheckStatus={() => {
          if (selectedNode) {
            setViewerNode(selectedNode);
            setIsDetailsOpen(true);
          }
        }}
        onCreateGroup={handleCreateGroup}
        isNodeSelected={!!selectedNode}
      />
      <NodeLibrary isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} />
      {/* NodePanel removed as per user request to clean UI */}
      <NodeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <NodeViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        node={viewerNode}
      />

      {/* Node Status Panel (Slide-over) */}
      {isDetailsOpen && viewerNode && (
        <NodeStatusPage
          node={viewerNode}
          onBack={() => setIsDetailsOpen(false)}
        />
      )}

      <div id="react-flow-wrapper" style={{ width: '100%', height: '100%', paddingTop: '60px' }}>
        {error && (
          <div
            style={{
              position: 'absolute',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'rgba(255, 0, 0, 0.8)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              pointerEvents: 'none',
            }}
          >
            ⚠️ Error: {error}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 9999, color: '#00ff00', background: 'rgba(0,0,0,0.8)', padding: '5px', fontSize: '14px', fontFamily: 'monospace' }}>
          DEBUG: Nodes: {nodes.length} | Edges: {edges.length}
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeDragStop={onNodeDragStop}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          panOnDrag={[1, 2]} // Middle and right mouse button for panning
          selectionOnDrag // Enable box selection with left mouse
          multiSelectionKeyCode="Control" // Hold Ctrl for multi-select
          style={{
            background: '#000000',
          }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const colors: Record<string, string> = nodeColors;
              const nodeData = node.data as unknown as CustomNodeData;
              return colors[nodeData.nodeType] || '#4a9eff';
            }}
            maskColor="rgba(0, 0, 0, 0.9)"
          />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#0a0d14" />
        </ReactFlow>
      </div>

      {/* Knowledge Chat */}
      <ChatBox isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowDiagram />
    </ReactFlowProvider>
  );
}
