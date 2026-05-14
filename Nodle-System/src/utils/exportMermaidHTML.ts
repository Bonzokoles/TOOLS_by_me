/**
 * Export Noodle diagram as standalone HTML with Mermaid diagrams
 * Based on visual-explainer templates (nicobailon/visual-explainer)
 *
 * Converts React Flow nodes/edges -> Mermaid syntax -> self-contained HTML
 * with dark/light theme, zoom controls, and interactive diagrams.
 */

import type { Node, Edge } from '@xyflow/react';

// ── Node type -> Mermaid shape mapping ──
const SHAPE_MAP: Record<string, (id: string, label: string) => string> = {
    api:            (id, l) => `${id}[/"${l}"/]`,        // parallelogram
    rag:            (id, l) => `${id}[("${l}")]`,        // cylinder
    kg:             (id, l) => `${id}{"${l}"}`,          // diamond
    vector_db:      (id, l) => `${id}[("${l}")]`,        // cylinder
    system:         (id, l) => `${id}["${l}"]`,          // rectangle
    agent:          (id, l) => `${id}(("${l}"))`,        // circle
    application:    (id, l) => `${id}("${l}")`,          // rounded rect
    service:        (id, l) => `${id}["${l}"]`,          // rectangle
    infrastructure: (id, l) => `${id}[["${l}"]]`,        // subroutine
    ai:             (id, l) => `${id}>>"${l}"]`,         // flag
};

function sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

function sanitizeLabel(label: string): string {
    return label.replace(/"/g, "'").replace(/[<>]/g, '');
}

/**
 * Convert React Flow nodes and edges to Mermaid flowchart syntax
 */
export function diagramToMermaid(nodes: Node[], edges: Edge[], direction: 'TD' | 'LR' = 'TD'): string {
    const lines: string[] = [`graph ${direction}`];

    // Nodes
    for (const node of nodes) {
        const id = sanitizeId(node.id);
        const label = sanitizeLabel((node.data as any)?.label || node.id);
        const nodeType = (node.data as any)?.nodeType || 'service';
        const shapeFn = SHAPE_MAP[nodeType] || SHAPE_MAP.service;
        lines.push(`    ${shapeFn(id, label)}`);
    }

    // Edges
    for (const edge of edges) {
        const src = sanitizeId(edge.source);
        const tgt = sanitizeId(edge.target);
        const label = typeof edge.label === 'string' ? edge.label : '';

        if (label) {
            lines.push(`    ${src} -->|${sanitizeLabel(label)}| ${tgt}`);
        } else {
            lines.push(`    ${src} --> ${tgt}`);
        }
    }

    return lines.join('\n');
}

/**
 * Build node legend from unique types in diagram
 */
function buildLegend(nodes: Node[]): string {
    const typeColors: Record<string, string> = {
        api: 'var(--primary)',
        rag: 'var(--secondary)',
        kg: 'var(--tertiary)',
        vector_db: 'var(--secondary)',
        system: 'var(--primary)',
        agent: 'var(--danger)',
        application: 'var(--primary)',
        service: 'var(--tertiary)',
        infrastructure: 'var(--text-dim)',
        ai: 'var(--danger)',
    };

    const types = [...new Set(nodes.map(n => (n.data as any)?.nodeType || 'service'))];

    return types.map(t =>
        `<div class="legend-item"><div class="legend-swatch" style="background:${typeColors[t] || 'var(--primary)'}"></div> ${t}</div>`
    ).join('\n    ');
}

/**
 * Generate a self-contained HTML page with Mermaid diagram
 * Styled after visual-explainer mermaid-flowchart template
 */
export function exportDiagramAsHTML(
    nodes: Node[],
    edges: Edge[],
    title: string = 'Noodle Diagram',
    description: string = '',
    direction: 'TD' | 'LR' = 'TD'
): string {
    const mermaidCode = diagramToMermaid(nodes, edges, direction);
    const legend = buildLegend(nodes);
    const timestamp = new Date().toISOString().split('T')[0];
    const nodeCount = nodes.length;
    const edgeCount = edges.length;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700&family=Fragment+Mono:wght@400&display=swap" rel="stylesheet">
<style>
  :root {
    --font-body: 'Bricolage Grotesque', system-ui, sans-serif;
    --font-mono: 'Fragment Mono', 'SF Mono', Consolas, monospace;
    --bg: #f0fdfa;
    --surface: #ffffff;
    --surface2: #e6f7f3;
    --border: rgba(0, 0, 0, 0.07);
    --border-bright: rgba(0, 0, 0, 0.14);
    --text: #134e4a;
    --text-dim: #5f8a85;
    --primary: #0d9488;
    --primary-dim: rgba(13, 148, 136, 0.08);
    --secondary: #7c3aed;
    --secondary-dim: rgba(124, 58, 237, 0.08);
    --tertiary: #d97706;
    --tertiary-dim: rgba(217, 119, 6, 0.08);
    --danger: #dc2626;
    --danger-dim: rgba(220, 38, 38, 0.08);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #042f2e;
      --surface: #0a3d3a;
      --surface2: #115e59;
      --border: rgba(255, 255, 255, 0.08);
      --border-bright: rgba(255, 255, 255, 0.14);
      --text: #ccfbf1;
      --text-dim: #5eead4;
      --primary: #2dd4bf;
      --primary-dim: rgba(45, 212, 191, 0.14);
      --secondary: #c4b5fd;
      --secondary-dim: rgba(196, 181, 253, 0.12);
      --tertiary: #fbbf24;
      --tertiary-dim: rgba(251, 191, 36, 0.12);
      --danger: #f87171;
      --danger-dim: rgba(248, 113, 113, 0.12);
    }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background-color: var(--bg);
    background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
    background-size: 24px 24px;
    color: var(--text);
    font-family: var(--font-body);
    padding: 40px;
    min-height: 100vh;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate {
    animation: fadeUp 0.4s ease-out both;
    animation-delay: calc(var(--i, 0) * 0.06s);
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  .container { max-width: 1100px; margin: 0 auto; }
  h1 { font-size: 38px; font-weight: 700; letter-spacing: -1px; margin-bottom: 6px; }
  .subtitle { color: var(--text-dim); font-family: var(--font-mono); font-size: 12px; margin-bottom: 32px; }
  .description { font-size: 14px; line-height: 1.7; color: var(--text-dim); margin-bottom: 24px; max-width: 700px; }
  .description code { font-family: var(--font-mono); font-size: 12px; background: var(--primary-dim); color: var(--primary); padding: 1px 5px; border-radius: 3px; }
  .mermaid-wrap {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 32px 24px;
    overflow: auto;
    margin-bottom: 24px;
  }
  .mermaid-wrap .mermaid { display: flex; justify-content: center; transition: transform 0.2s ease; transform-origin: top center; }
  .zoom-controls { position: absolute; top: 8px; right: 8px; display: flex; gap: 2px; z-index: 10; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 2px; }
  .zoom-controls button { width: 28px; height: 28px; border: none; background: transparent; color: var(--text-dim); font-family: var(--font-mono); font-size: 14px; cursor: pointer; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
  .zoom-controls button:hover { background: var(--border); color: var(--text); }
  .mermaid-wrap { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  .mermaid-wrap.is-zoomed { cursor: grab; }
  .mermaid-wrap.is-panning { cursor: grabbing; user-select: none; }
  .mermaid .nodeLabel { font-family: var(--font-body) !important; font-size: 16px !important; }
  .mermaid .edgeLabel { font-family: var(--font-mono) !important; font-size: 13px !important; }
  .legend { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); }
  .legend-swatch { width: 12px; height: 12px; border-radius: 3px; }
  .stats { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 20px; text-align: center; min-width: 100px; }
  .stat-value { font-size: 28px; font-weight: 700; color: var(--primary); }
  .stat-label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); margin-top: 4px; }
  .callout { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--primary); border-radius: 0 10px 10px 0; padding: 16px 20px; font-size: 13px; line-height: 1.6; color: var(--text-dim); }
  .callout strong { color: var(--text); }
  .node-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
  .node-table th { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); text-align: left; padding: 8px 12px; border-bottom: 2px solid var(--border-bright); }
  .node-table td { padding: 8px 12px; border-bottom: 1px solid var(--border); }
  .node-table tr:hover td { background: var(--primary-dim); }
  .badge { display: inline-block; font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 4px; }
  @media (max-width: 768px) { body { padding: 16px; } h1 { font-size: 22px; } .mermaid-wrap { padding: 16px 12px; } }
</style>
</head>
<body>
<div class="container">
  <h1 class="animate" style="--i:0">${title}</h1>
  <p class="subtitle animate" style="--i:1">${nodeCount} nodes &middot; ${edgeCount} edges &middot; exported ${timestamp}</p>

  ${description ? `<p class="description animate" style="--i:2">${description}</p>` : ''}

  <div class="stats animate" style="--i:3">
    <div class="stat"><div class="stat-value">${nodeCount}</div><div class="stat-label">Nodes</div></div>
    <div class="stat"><div class="stat-value">${edgeCount}</div><div class="stat-label">Edges</div></div>
    <div class="stat"><div class="stat-value">${[...new Set(nodes.map(n => (n.data as any)?.nodeType))].length}</div><div class="stat-label">Types</div></div>
  </div>

  <div class="mermaid-wrap animate" style="--i:4">
    <div class="zoom-controls">
      <button onclick="zoomDiagram(this, 1.2)" title="Zoom in">+</button>
      <button onclick="zoomDiagram(this, 0.8)" title="Zoom out">&minus;</button>
      <button onclick="resetZoom(this)" title="Reset">&#8634;</button>
    </div>
    <pre class="mermaid">
${mermaidCode}
    </pre>
  </div>

  <div class="legend animate" style="--i:5">
    ${legend}
  </div>

  <h2 class="animate" style="--i:6; font-size:20px; margin: 24px 0 12px;">Node Directory</h2>
  <table class="node-table animate" style="--i:7">
    <thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
    <tbody>
      ${nodes.map(n => {
        const d = n.data as any;
        return `<tr><td><strong>${d?.label || n.id}</strong></td><td><span class="badge" style="background:var(--primary-dim);color:var(--primary)">${d?.nodeType || 'service'}</span></td><td>${(d?.description || '').slice(0, 120)}</td></tr>`;
      }).join('\n      ')}
    </tbody>
  </table>

  <div class="callout animate" style="--i:8">
    <strong>Exported from Noodle.</strong> This diagram was generated from a live React Flow canvas.
    Zoom with <code>Ctrl+Scroll</code>, pan by dragging when zoomed in.
    Template based on <code>visual-explainer</code> by nicobailon.
  </div>
</div>

<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    look: 'handDrawn',
    themeVariables: {
      primaryColor: isDark ? '#115e59' : '#ccfbf1',
      primaryBorderColor: isDark ? '#2dd4bf' : '#0d9488',
      primaryTextColor: isDark ? '#ccfbf1' : '#134e4a',
      secondaryColor: isDark ? '#1e1b4b' : '#ede9fe',
      secondaryBorderColor: isDark ? '#c4b5fd' : '#7c3aed',
      secondaryTextColor: isDark ? '#ccfbf1' : '#134e4a',
      tertiaryColor: isDark ? '#2e2618' : '#fffbeb',
      tertiaryBorderColor: isDark ? '#fbbf24' : '#d97706',
      tertiaryTextColor: isDark ? '#ccfbf1' : '#134e4a',
      lineColor: isDark ? '#5eead4' : '#5f8a85',
      fontSize: '16px',
      fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
    }
  });
</script>
<script>
  function zoomDiagram(btn, factor) {
    var wrap = btn.closest('.mermaid-wrap');
    var target = wrap.querySelector('.mermaid');
    var current = parseFloat(target.dataset.zoom || '1');
    var next = Math.min(Math.max(current * factor, 0.3), 5);
    target.dataset.zoom = next;
    target.style.transform = 'scale(' + next + ')';
    wrap.classList.toggle('is-zoomed', next > 1);
  }
  function resetZoom(btn) {
    var wrap = btn.closest('.mermaid-wrap');
    var target = wrap.querySelector('.mermaid');
    target.dataset.zoom = '1';
    target.style.transform = 'scale(1)';
    wrap.classList.remove('is-zoomed');
  }
  document.querySelectorAll('.mermaid-wrap').forEach(function(wrap) {
    wrap.addEventListener('wheel', function(e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      var target = wrap.querySelector('.mermaid');
      var current = parseFloat(target.dataset.zoom || '1');
      var factor = e.deltaY < 0 ? 1.1 : 0.9;
      var next = Math.min(Math.max(current * factor, 0.3), 5);
      target.dataset.zoom = next;
      target.style.transform = 'scale(' + next + ')';
      wrap.classList.toggle('is-zoomed', next > 1);
    }, { passive: false });
    var startX, startY, scrollL, scrollT;
    wrap.addEventListener('mousedown', function(e) {
      if (e.target.closest('.zoom-controls')) return;
      var target = wrap.querySelector('.mermaid');
      if (parseFloat(target.dataset.zoom || '1') <= 1) return;
      wrap.classList.add('is-panning');
      startX = e.clientX; startY = e.clientY;
      scrollL = wrap.scrollLeft; scrollT = wrap.scrollTop;
    });
    window.addEventListener('mousemove', function(e) {
      if (!wrap.classList.contains('is-panning')) return;
      wrap.scrollLeft = scrollL - (e.clientX - startX);
      wrap.scrollTop = scrollT - (e.clientY - startY);
    });
    window.addEventListener('mouseup', function() { wrap.classList.remove('is-panning'); });
  });
</script>
</body>
</html>`;
}

/**
 * Download the HTML diagram as a file
 */
export function downloadDiagramHTML(
    nodes: Node[],
    edges: Edge[],
    title: string = 'Noodle Diagram',
    description: string = '',
    direction: 'TD' | 'LR' = 'TD'
): void {
    const html = exportDiagramAsHTML(nodes, edges, title, description, direction);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.html`;
    link.click();

    URL.revokeObjectURL(url);
}

/**
 * Open the HTML diagram in a new browser tab (preview)
 */
export function previewDiagramHTML(
    nodes: Node[],
    edges: Edge[],
    title: string = 'Noodle Diagram',
    description: string = ''
): void {
    const html = exportDiagramAsHTML(nodes, edges, title, description);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}
