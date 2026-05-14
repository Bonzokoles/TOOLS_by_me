import axios, { type AxiosInstance } from 'axios';
import type { ApiResponse, NoodleNode, NoodleEdge } from '../types';

export interface AnalyzeRequest {
    source: string;
    is_url: boolean;
    layout_cols?: number;
}

export interface AnalyzeResponse {
    success: boolean;
    nodes: NoodleNode[];
    edges: NoodleEdge[];
    stats: {
        total_elements: number;
        total_nodes: number;
        total_edges: number;
        source: string;
    };
    message: string;
}

export interface FastCodeStatus {
    status: string;
    cached_source: string | null;
    cached_nodes: number;
    cached_edges: number;
    fastcode_available: boolean;
}

class FastCodeClient {
    private api: AxiosInstance;

    constructor(baseURL: string = import.meta.env.VITE_FASTCODE_URL || 'http://localhost:3886') {
        this.api = axios.create({
            baseURL,
            timeout: 120000, // 2 min - analysis can be slow
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Analyze a repository and get Noodle-compatible graph
     */
    async analyzeRepo(source: string, isUrl: boolean = false): Promise<ApiResponse<AnalyzeResponse>> {
        try {
            const response = await this.api.post('/api/fastcode/analyze', {
                source,
                is_url: isUrl,
            });
            return {
                success: true,
                data: response.data,
                message: response.data.message,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to analyze repository',
            };
        }
    }

    /**
     * Get adapter status
     */
    async getStatus(): Promise<ApiResponse<FastCodeStatus>> {
        try {
            const response = await this.api.get('/api/fastcode/status');
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'FastCode adapter not reachable',
            };
        }
    }

    /**
     * Load cached graph from adapter (Noodle-compatible format)
     */
    async getCachedGraph(): Promise<ApiResponse<{ nodes: NoodleNode[]; edges: NoodleEdge[] }>> {
        try {
            const response = await this.api.get('/api/nodle/graph');
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to fetch cached graph',
            };
        }
    }

    /**
     * Search nodes in analyzed repo
     */
    async searchNodes(query: string): Promise<ApiResponse<NoodleNode[]>> {
        try {
            const response = await this.api.get('/api/nodle/search', {
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
}

export const fastcodeClient = new FastCodeClient();
export default FastCodeClient;
