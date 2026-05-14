import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import { noodleClient } from '../api/noodleClient';
import { fastcodeClient } from '../api/fastcodeClient';
import { wsClient } from '../api/websocket';
import type { NoodleNode, NoodleEdge, CreateNodeRequest, UpdateNodeRequest } from '../types';

interface DiagramStore {
    // State
    nodes: Node[];
    edges: Edge[];
    selectedNode: Node | null;
    isLoading: boolean;
    error: string | null;
    fastcodeStatus: string | null;

    // Actions
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    setSelectedNode: (node: Node | null) => void;

    // CRUD Operations
    addNode: (data: CreateNodeRequest, position: { x: number; y: number }) => Promise<void>;
    updateNode: (id: string, data: UpdateNodeRequest) => Promise<void>;
    deleteNode: (id: string) => Promise<void>;

    // Edge operations
    addEdge: (source: string, target: string, label: string) => Promise<void>;
    deleteEdge: (id: string) => Promise<void>;

    // Backend sync
    loadFromBackend: () => Promise<void>;
    saveToBackend: () => Promise<void>;

    // Grouping
    createGroup: (selectedNodeIds: string[], groupName: string) => void;
    ungroupNodes: (groupId: string) => void;

    // FastCode integration
    importFromFastCode: (source: string, isUrl?: boolean) => Promise<void>;
    loadFastCodeCache: () => Promise<void>;

    // Real-time updates
    handleNodeCreated: (node: NoodleNode) => void;
    handleNodeUpdated: (node: NoodleNode) => void;
    handleNodeDeleted: (id: string) => void;
    handleEdgeCreated: (edge: NoodleEdge) => void;
    handleEdgeDeleted: (id: string) => void;
}

export const useDiagramStore = create<DiagramStore>((set, _get) => ({
    // Initial state
    nodes: [],
    edges: [],
    selectedNode: null,
    isLoading: false,
    error: null,
    fastcodeStatus: null,

    // Setters
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    setSelectedNode: (node) => set({ selectedNode: node }),

    // Add node
    addNode: async (data, position) => {
        set({ isLoading: true, error: null });
        try {
            const response = await noodleClient.createNode({ ...data, position });

            if (response.success && response.data) {
                const newNode: Node = {
                    id: response.data.id,
                    type: response.data.type === 'llm_processor' ? 'llm_processor' : 'custom',
                    position: response.data.position || position,
                    data: {
                        label: response.data.name,
                        nodeType: response.data.type as any,
                        description: response.data.description,
                        files: response.data.files || [],
                    },
                };

                set((state) => ({
                    nodes: [...state.nodes, newNode],
                    isLoading: false,
                }));
            } else {
                set({ error: response.error || 'Failed to create node', isLoading: false });
            }
        } catch (error: any) {
            console.error('Add Node Error:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    // Update node
    updateNode: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await noodleClient.updateNode(id, data);

            if (response.success && response.data) {
                set((state) => ({
                    nodes: state.nodes.map((node) =>
                        node.id === id
                            ? {
                                ...node,
                                data: {
                                    ...node.data,
                                    label: response.data!.name,
                                    description: response.data!.description,
                                    files: response.data!.files || [],
                                },
                                position: response.data!.position || node.position,
                            }
                            : node
                    ),
                    isLoading: false,
                }));
            } else {
                set({ error: response.error || 'Failed to update node', isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Delete node
    deleteNode: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await noodleClient.deleteNode(id);

            if (response.success) {
                set((state) => ({
                    nodes: state.nodes.filter((node) => node.id !== id),
                    edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
                    selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
                    isLoading: false,
                }));
            } else {
                set({ error: response.error || 'Failed to delete node', isLoading: false });
            }
        } catch (error: any) {
            console.error('Delete Node Error:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    // Add edge
    addEdge: async (source, target, label) => {
        set({ isLoading: true, error: null });
        try {
            const response = await noodleClient.createEdge({ source, target, label });

            if (response.success && response.data) {
                const newEdge: Edge = {
                    id: response.data.id,
                    source: response.data.source,
                    target: response.data.target,
                    label: response.data.label,
                    type: 'smoothstep',
                    animated: true,
                };

                set((state) => ({
                    edges: [...state.edges, newEdge],
                    isLoading: false,
                }));
            } else {
                set({ error: response.error || 'Failed to create edge', isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Delete edge
    deleteEdge: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await noodleClient.deleteEdge(id);

            if (response.success) {
                set((state) => ({
                    edges: state.edges.filter((edge) => edge.id !== id),
                    isLoading: false,
                }));
            } else {
                set({ error: response.error || 'Failed to delete edge', isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Save to backend (Push)
    saveToBackend: async () => {
        set({ isLoading: true, error: null });
        try {
            const state = _get();

            const noodleNodes: NoodleNode[] = state.nodes.map((n) => ({
                id: n.id,
                name: (n.data.label as string) || n.id,
                type: (n.data.nodeType as string) || 'custom',
                description: (n.data.description as string) || '',
                files: (n.data.files as any[]) || [],
                position: n.position,
                metadata: {},
            }));

            const noodleEdges: NoodleEdge[] = state.edges.map((e) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                label: (e.label as string) || 'related_to',
                metadata: {},
            }));

            const response = await noodleClient.syncGraph(noodleNodes, noodleEdges);

            if (response.success && response.data) {
                // Optional: Update state with normalized data from backend
                set({ isLoading: false });
            } else {
                set({ error: response.error || 'Failed to sync graph', isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Load from backend
    loadFromBackend: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await noodleClient.getGraph();

            if (response.success && response.data) {
                const nodes: Node[] = response.data.nodes.map((n) => ({
                    id: n.id,
                    type: n.type === 'llm_processor' ? 'llm_processor' : 'custom',
                    position: n.position || { x: Math.random() * 500, y: Math.random() * 500 },
                    data: {
                        label: n.name,
                        nodeType: n.type as any,
                        description: n.description,
                        files: n.files || [],
                    },
                }));

                const edges: Edge[] = response.data.edges.map((e) => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    label: e.label,
                    type: 'smoothstep',
                    animated: true,
                }));

                set({ nodes, edges, isLoading: false });
            } else {
                set({ error: response.error || 'Failed to load graph', isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Create group from selected nodes
    createGroup: (selectedNodeIds, groupName) => {
        const state = _get();

        if (selectedNodeIds.length === 0) {
            console.warn('No nodes selected for grouping');
            return;
        }

        // Calculate bounding box for selected nodes
        const selectedNodes = state.nodes.filter(n => selectedNodeIds.includes(n.id));
        const minX = Math.min(...selectedNodes.map(n => n.position.x));
        const minY = Math.min(...selectedNodes.map(n => n.position.y));
        const maxX = Math.max(...selectedNodes.map(n => n.position.x + 200)); // Assume node width ~200
        const maxY = Math.max(...selectedNodes.map(n => n.position.y + 150)); // Assume node height ~150

        // Create group node
        const groupId = `group_${Date.now()}`;
        const groupNode: Node = {
            id: groupId,
            type: 'group',
            position: { x: minX - 20, y: minY - 60 }, // Offset for header
            data: {
                label: groupName,
                description: `Group of ${selectedNodeIds.length} nodes`,
                color: '#4a9eff',
            },
            style: {
                width: maxX - minX + 40,
                height: maxY - minY + 80,
            },
        };

        // Update selected nodes to be children of group
        const updatedNodes = state.nodes.map(node => {
            if (selectedNodeIds.includes(node.id)) {
                return {
                    ...node,
                    parentNode: groupId,
                    extent: 'parent' as const,
                    // Adjust position relative to group
                    position: {
                        x: node.position.x - groupNode.position.x,
                        y: node.position.y - groupNode.position.y,
                    },
                };
            }
            return node;
        });

        // Add group node to the beginning (so it renders behind children)
        set({ nodes: [groupNode, ...updatedNodes] });

        console.log(`✅ Created group "${groupName}" with ${selectedNodeIds.length} nodes`);
    },

    // Ungroup nodes - break apart a group
    ungroupNodes: (groupId: string) => {
        const nodes = _get().nodes;
        const groupNode = nodes.find(n => n.id === groupId);

        if (!groupNode || groupNode.type !== 'group') {
            console.warn(`⚠️ Node ${groupId} is not a group`);
            return;
        }

        // Find all child nodes
        const childNodes = nodes.filter(n => n.parentId === groupId);

        if (childNodes.length === 0) {
            console.warn(`⚠️ Group ${groupId} has no children`);
            // Still remove the empty group
            set({ nodes: nodes.filter(n => n.id !== groupId) });
            return;
        }

        // Get group's absolute position
        const groupX = groupNode.position.x;
        const groupY = groupNode.position.y;

        // Convert children back to absolute positioning
        const ungroupedChildren = childNodes.map(child => ({
            ...child,
            parentId: undefined,
            extent: undefined,
            position: {
                x: groupX + child.position.x,
                y: groupY + child.position.y,
            },
        }));

        // Remove group node and update children
        const remainingNodes = nodes.filter(n => n.id !== groupId && !childNodes.includes(n));
        set({ nodes: [...remainingNodes, ...ungroupedChildren] });

        console.log(`✅ Ungrouped ${childNodes.length} nodes from "${groupNode.data.label}"`);
    },

    // Real-time handlers
    handleNodeCreated: (node) => {
        // Convert NoodleNode -> React Flow Node
        const newNode: Node = {
            id: node.id,
            type: node.type === 'llm_processor' ? 'llm_processor' : 'custom',
            position: node.position || { x: 0, y: 0 },
            data: {
                label: node.name,
                nodeType: node.type as any,
                description: node.description,
                files: node.files || [],
            },
        };

        set((state) => ({
            nodes: [...state.nodes.filter((n) => n.id !== node.id), newNode],
        }));
    },

    // FastCode integration
    importFromFastCode: async (source, isUrl = false) => {
        set({ isLoading: true, error: null, fastcodeStatus: 'Analyzing...' });
        try {
            const response = await fastcodeClient.analyzeRepo(source, isUrl);
            if (response.success && response.data) {
                const fcNodes: Node[] = response.data.nodes.map((n: any) => ({
                    id: n.id,
                    type: 'custom',
                    position: n.position || { x: 0, y: 0 },
                    data: {
                        label: n.name,
                        nodeType: n.type as any,
                        description: n.description,
                        files: n.files || [],
                        metadata: n.metadata,
                    },
                }));

                const fcEdges: Edge[] = response.data.edges.map((e: any) => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    label: e.label,
                    type: 'smoothstep',
                    animated: e.type === 'animated',
                    data: { metadata: e.metadata },
                }));

                set((state) => ({
                    nodes: [...state.nodes, ...fcNodes],
                    edges: [...state.edges, ...fcEdges],
                    isLoading: false,
                    fastcodeStatus: `Imported ${fcNodes.length} nodes, ${fcEdges.length} edges`,
                }));
            } else {
                set({ isLoading: false, error: response.error || 'Analysis failed', fastcodeStatus: null });
            }
        } catch (err: any) {
            set({ isLoading: false, error: err.message, fastcodeStatus: null });
        }
    },

    loadFastCodeCache: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fastcodeClient.getCachedGraph();
            if (response.success && response.data) {
                const fcNodes: Node[] = response.data.nodes.map((n: any) => ({
                    id: n.id,
                    type: 'custom',
                    position: n.position || { x: 0, y: 0 },
                    data: {
                        label: n.name,
                        nodeType: n.type as any,
                        description: n.description,
                        files: n.files || [],
                        metadata: n.metadata,
                    },
                }));

                const fcEdges: Edge[] = response.data.edges.map((e: any) => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    label: e.label,
                    type: 'smoothstep',
                    animated: e.type === 'animated',
                }));

                set({
                    nodes: fcNodes,
                    edges: fcEdges,
                    isLoading: false,
                    fastcodeStatus: `Loaded ${fcNodes.length} cached nodes`,
                });
            } else {
                set({ isLoading: false, error: 'No cached data' });
            }
        } catch (err: any) {
            set({ isLoading: false, error: err.message });
        }
    },

    handleNodeUpdated: (node) => {
        set((state) => ({
            nodes: state.nodes.map((n) =>
                n.id === node.id
                    ? {
                        ...n,
                        data: {
                            label: node.name,
                            nodeType: node.type as any,
                            description: node.description,
                            files: node.files || [],
                        },
                        position: node.position || n.position,
                    }
                    : n
            ),
        }));
    },

    handleNodeDeleted: (id) => {
        set((state) => ({
            nodes: state.nodes.filter((n) => n.id !== id),
            edges: state.edges.filter((e) => e.source !== id && e.target !== id),
        }));
    },

    handleEdgeCreated: (edge) => {
        const newEdge: Edge = {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            type: 'smoothstep',
            animated: true,
        };

        set((state) => ({
            edges: [...state.edges.filter((e) => e.id !== edge.id), newEdge],
        }));
    },

    handleEdgeDeleted: (id) => {
        set((state) => ({
            edges: state.edges.filter((e) => e.id !== id),
        }));
    },
}));

// Initialize WebSocket listeners
wsClient.on('node_created', (data) => useDiagramStore.getState().handleNodeCreated(data));
wsClient.on('node_updated', (data) => useDiagramStore.getState().handleNodeUpdated(data));
wsClient.on('node_deleted', (data) => useDiagramStore.getState().handleNodeDeleted(data));
wsClient.on('edge_created', (data) => useDiagramStore.getState().handleEdgeCreated(data));
wsClient.on('edge_deleted', (data) => useDiagramStore.getState().handleEdgeDeleted(data));
