import axios, { type AxiosInstance } from 'axios';
import type {
    NoodleNode,
    NoodleEdge,
    CreateNodeRequest,
    UpdateNodeRequest,
    CreateEdgeRequest,
    ApiResponse,
    GraphResponse,
} from '../types';

class NoodleClient {
    private api: AxiosInstance;

    constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:3885/api') {
        this.api = axios.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // ==================== NODE OPERATIONS ====================

    /**
     * Fetch all nodes from Nodle backend
     */
    async getNodes(): Promise<ApiResponse<NoodleNode[]>> {
        try {
            const response = await this.api.get('/nodle/nodes');
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to fetch nodes',
            };
        }
    }

    /**
     * Get a single node by ID
     */
    async getNode(id: string): Promise<ApiResponse<NoodleNode>> {
        try {
            const response = await this.api.get(`/nodle/nodes/${id}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: `Failed to fetch node ${id}`,
            };
        }
    }

    /**
     * Create a new node
     */
    async createNode(data: CreateNodeRequest): Promise<ApiResponse<NoodleNode>> {
        try {
            const response = await this.api.post('/nodle/nodes', data);
            return {
                success: true,
                data: response.data,
                message: 'Node created successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create node',
            };
        }
    }

    /**
     * Update an existing node
     */
    async updateNode(id: string, data: UpdateNodeRequest): Promise<ApiResponse<NoodleNode>> {
        try {
            const response = await this.api.put(`/nodle/nodes/${id}`, data);
            return {
                success: true,
                data: response.data,
                message: 'Node updated successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: `Failed to update node ${id}`,
            };
        }
    }

    /**
     * Delete a node
     */
    async deleteNode(id: string): Promise<ApiResponse<void>> {
        try {
            await this.api.delete(`/nodle/nodes/${id}`);
            return {
                success: true,
                message: 'Node deleted successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: `Failed to delete node ${id}`,
            };
        }
    }

    // ==================== EDGE OPERATIONS ====================

    /**
     * Fetch all edges
     */
    async getEdges(): Promise<ApiResponse<NoodleEdge[]>> {
        try {
            const response = await this.api.get('/nodle/edges');
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to fetch edges',
            };
        }
    }

    /**
     * Create a new edge
     */
    async createEdge(data: CreateEdgeRequest): Promise<ApiResponse<NoodleEdge>> {
        try {
            const response = await this.api.post('/nodle/edges', data);
            return {
                success: true,
                data: response.data,
                message: 'Edge created successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create edge',
            };
        }
    }

    /**
     * Delete an edge
     */
    async deleteEdge(id: string): Promise<ApiResponse<void>> {
        try {
            await this.api.delete(`/nodle/edges/${id}`);
            return {
                success: true,
                message: 'Edge deleted successfully',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: `Failed to delete edge ${id}`,
            };
        }
    }

    // ==================== GRAPH OPERATIONS ====================

    /**
     * Get entire graph (nodes + edges)
     */
    async getGraph(): Promise<ApiResponse<{ nodes: NoodleNode[]; edges: NoodleEdge[] }>> {
        try {
            const response = await this.api.get('/nodle/graph');
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to fetch graph',
            };
        }
    }

    /**
     * Search nodes by query
     */
    async searchNodes(query: string): Promise<ApiResponse<NoodleNode[]>> {
        try {
            const response = await this.api.get('/nodle/search', {
                params: { q: query },
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Search failed',
            };
        }
    }

    /**
     * Sync full graph state (Push)
     */
    async syncGraph(nodes: NoodleNode[], edges: NoodleEdge[]): Promise<ApiResponse<GraphResponse>> {
        try {
            const response = await this.api.post('/nodle/sync', {
                nodes,
                edges,
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to sync graph',
            };
        }
    }
}

// Export singleton instance
export const noodleClient = new NoodleClient();
export default NoodleClient;
