import type { DiagramView } from '../types';
import type { Node, Edge } from '@xyflow/react';
import html2canvas from 'html2canvas';

const STORAGE_KEY = 'yellow-hub-diagram-views';

/**
 * Save view to LocalStorage
 */
export function saveViewToLocal(name: string, nodes: Node[], edges: Edge[], viewport?: any): DiagramView {
    const views = loadAllViews();

    const view: DiagramView = {
        id: `view-${Date.now()}`,
        name,
        nodes,
        edges,
        viewport,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    views.push(view);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));

    return view;
}

/**
 * Load all saved views
 */
export function loadAllViews(): DiagramView[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to parse views:', error);
        return [];
    }
}

/**
 * Load specific view by ID
 */
export function loadViewById(id: string): DiagramView | null {
    const views = loadAllViews();
    return views.find((v) => v.id === id) || null;
}

/**
 * Delete view by ID
 */
export function deleteView(id: string): void {
    const views = loadAllViews();
    const filtered = views.filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Export view as JSON file
 */
export function exportViewAsJSON(view: DiagramView): void {
    const dataStr = JSON.stringify(view, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${view.name}-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

/**
 * Import view from JSON file
 */
export function importViewFromFile(file: File): Promise<DiagramView> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const view = JSON.parse(e.target?.result as string);
                resolve(view);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

/**
 * Export diagram as PNG screenshot
 */
export async function exportViewAsPNG(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2,
    });

    canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}-${Date.now()}.png`;
        link.click();

        URL.revokeObjectURL(url);
    });
}

/**
 * Clear all saved views
 */
export function clearAllViews(): void {
    localStorage.removeItem(STORAGE_KEY);
}
