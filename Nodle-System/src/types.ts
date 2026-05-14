import type { Node, Edge } from '@xyflow/react';

// Custom node data structure
export interface CustomNodeData {
    label: string;
    nodeType: 'api' | 'rag' | 'kg' | 'vector_db' | 'system' | 'agent' | 'application' | 'service' | 'infrastructure' | 'ai';
    category?: 'data' | 'ai' | 'infrastructure' | 'application' | 'service' | 'agent' | 'system';
    status?: 'operational' | 'error' | 'warning' | 'idle';
    description: string;
    files: FileInfo[];
    metadata?: Record<string, any>;
}

export interface FileInfo {
    name: string;
    path: string;
    size: string;
    content?: string;
}

// Nodle API types
export interface NoodleNode {
    id: string;
    name: string;
    type: string;
    description: string;
    files: FileInfo[];
    metadata?: Record<string, any>;
    position?: { x: number; y: number };
    createdAt?: string;
    updatedAt?: string;
}

export interface NoodleEdge {
    id: string;
    source: string;
    target: string;
    label: string;
    type?: string;
    metadata?: Record<string, any>;
}

export interface DiagramView {
    id: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
    viewport?: { x: number; y: number; zoom: number };
    createdAt: string;
    updatedAt: string;
}

export interface GraphResponse {
    nodes: NoodleNode[];
    edges: NoodleEdge[];
}

// API Request/Response types
export interface CreateNodeRequest {
    name: string;
    type: string;
    description: string;
    files?: FileInfo[];
    metadata?: Record<string, any>;
    position?: { x: number; y: number };
}

export interface UpdateNodeRequest {
    name?: string;
    type?: string;
    description?: string;
    files?: FileInfo[];
    metadata?: Record<string, any>;
    position?: { x: number; y: number };
}

export interface CreateEdgeRequest {
    source: string;
    target: string;
    label: string;
    type?: string;
    metadata?: Record<string, any>;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// WebSocket message types
export interface WSMessage {
    type: 'node_created' | 'node_updated' | 'node_deleted' | 'edge_created' | 'edge_deleted';
    payload: any;
    timestamp: string;
}
