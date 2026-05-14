"""
AI-powered Project Visualization Generator

Przykładowy endpoint do generowania interaktywnych wizualizacji projektu
przy użyciu OpenRouter API (Claude 3.7 Sonnet).

Dodaj ten kod do server.py aby włączyć generowanie grafów projektu przez AI.
"""

# Dodaj do sekcji ROUTING w server.py:

elif route == "/api/nodle/ai-generate":
    """
    POST /api/nodle/ai-generate
    Body: {
        "prompt": "Wygeneruj graf dla projektu ZENO Browser",
        "project_path": "U:\\WWW_Zen_BRo_wser_org3",
        "depth": 3,
        "model": "anthropic/claude-3.7-sonnet"  // opcjonalny
    }
    
    Returns:
    {
        "nodes": [...],
        "edges": [...],
        "metadata": {...}
    }
    """
    body = self._read_body()
    prompt = body.get("prompt", "")
    project_path = body.get("project_path", "")
    depth = body.get("depth", 3)
    model = body.get("model", "anthropic/claude-3.7-sonnet")
    
    if not prompt:
        self._json(400, {"error": "prompt is required"})
        return
    
    # Build enhanced prompt with project context
    enhanced_prompt = f"""
{prompt}

Projekt: {project_path}
Głębokość analizy: {depth} poziomy

Wygeneruj JSON z wizualizacją projektu w formacie:

{{
    "nodes": [
        {{
            "id": "unique-id",
            "name": "Node Label",
            "type": "core|service|component|data|config",
            "description": "Krótki opis",
            "files": ["file1.ts", "file2.ts"],
            "position": {{"x": 0, "y": 0}},
            "metadata": {{
                "techStack": ["React", "TypeScript"],
                "dependencies": ["package1", "package2"],
                "layer": "W1|W2|W3"
            }}
        }}
    ],
    "edges": [
        {{
            "id": "edge-id",
            "from": "node-id-1",
            "to": "node-id-2",
            "label": "imports|calls|extends|depends-on",
            "type": "dependency|data-flow|inheritance"
        }}
    ],
    "metadata": {{
        "title": "Tytuł wizualizacji",
        "description": "Opis architektury",
        "layers": ["W1: Data Layer", "W2: Processing", "W3: UI/Output"],
        "techStack": ["React", "Electron", "TypeScript"],
        "statistics": {{
            "totalFiles": 0,
            "totalModules": 0,
            "totalDependencies": 0
        }}
    }}
}}

Analizuj strukturę folderów, package.json, tsconfig.json, import statements.
Grupuj komponenty w warstwy (W1/W2/W3).
Wykrywaj wzorce architektoniczne (MVC, layered, microservices).
Zwróć TYLKO valid JSON, bez markdown.
"""
    
    # Call OpenRouter with specified model
    system_prompt = """
    Jesteś ekspertem analizy architektury oprogramowania.
    Specjalizujesz się w tworzeniu interaktywnych wizualizacji projektów.
    
    Twoim zadaniem jest:
    1. Przeanalizować strukturę projektu
    2. Zidentyfikować moduły, komponenty, usługi
    3. Wykryć zależności między nimi
    4. Zgrupować je w logiczne warstwy
    5. Wygenerować JSON do wizualizacji
    
    Zwracasz TYLKO valid JSON, bez żadnego otoczenia markdown.
    """
    
    response, error = call_openrouter(
        message=enhanced_prompt,
        system_prompt=system_prompt,
        model=model
    )
    
    if error:
        _log(f"AI generation failed: {error}")
        self._json(500, {"error": error})
        return
    
    try:
        # Parse JSON response
        graph_data = json.loads(response)
        
        # Validate structure
        if "nodes" not in graph_data or "edges" not in graph_data:
            self._json(500, {
                "error": "Invalid graph structure",
                "response": response[:500]
            })
            return
        
        # Add IDs if missing
        for node in graph_data["nodes"]:
            if "id" not in node:
                node["id"] = gen_id()
        
        for edge in graph_data["edges"]:
            if "id" not in edge:
                edge["id"] = gen_id()
        
        # Log success
        _log(f"Generated graph: {len(graph_data['nodes'])} nodes, {len(graph_data['edges'])} edges")
        
        self._json(200, {
            "success": True,
            "graph": graph_data,
            "model": model,
            "timestamp": now()
        })
        
    except json.JSONDecodeError as e:
        _log(f"JSON parse error: {e}")
        self._json(500, {
            "error": "Failed to parse AI response as JSON",
            "details": str(e),
            "response": response[:500]
        })


# Alternatywny endpoint: wzbogacanie istniejącego grafu przez AI

elif route == "/api/nodle/ai-enhance":
    """
    POST /api/nodle/ai-enhance
    Body: {
        "nodeId": "node-id",
        "action": "suggest-connections|add-details|optimize-layout",
        "model": "anthropic/claude-3.7-sonnet"  // opcjonalny
    }
    
    Używa AI do:
    - Sugerowania brakujących połączeń
    - Dodawania opisów i metadanych
    - Optymalizacji układu wizualnego
    """
    body = self._read_body()
    node_id = body.get("nodeId")
    action = body.get("action", "suggest-connections")
    model = body.get("model", "anthropic/claude-3.7-sonnet")
    
    if not node_id:
        self._json(400, {"error": "nodeId is required"})
        return
    
    # Load current graph
    data = load_data()
    node = next((n for n in data["nodes"] if n["id"] == node_id), None)
    
    if not node:
        self._json(404, {"error": "Node not found"})
        return
    
    # Build context from graph
    graph_context = f"""
    Current graph structure:
    Total nodes: {len(data['nodes'])}
    Total edges: {len(data['edges'])}
    
    Target node:
    {json.dumps(node, indent=2)}
    
    Connected nodes:
    {json.dumps([
        next((n for n in data['nodes'] if n['id'] == e['to']), None)
        for e in data['edges']
        if e['from'] == node_id
    ], indent=2)}
    """
    
    prompts = {
        "suggest-connections": f"""
        Przeanalizuj ten node i całą strukturę grafu.
        Zasugeruj 3-5 brakujących połączeń do innych node'ów które powinny być połączone.
        
        {graph_context}
        
        Zwróć JSON:
        {{
            "suggestions": [
                {{
                    "to": "node-id",
                    "label": "relationship type",
                    "reason": "dlaczego to połączenie ma sens"
                }}
            ]
        }}
        """,
        
        "add-details": f"""
        Wzbogać ten node o szczegółowe informacje.
        
        {graph_context}
        
        Zwróć JSON:
        {{
            "enhancedNode": {{
                "description": "Szczegółowy opis...",
                "metadata": {{
                    "techStack": [...],
                    "patterns": [...],
                    "responsibilities": [...]
                }}
            }}
        }}
        """,
        
        "optimize-layout": f"""
        Zasugeruj optymalną pozycję tego node'a w układzie grafu.
        
        {graph_context}
        
        Zwróć JSON:
        {{
            "position": {{"x": 0, "y": 0}},
            "reason": "dlaczego ta pozycja jest optymalna"
        }}
        """
    }
    
    prompt = prompts.get(action, prompts["suggest-connections"])
    
    response, error = call_openrouter(
        message=prompt,
        system_prompt="Jesteś ekspertem wizualizacji danych. Zwracasz TYLKO valid JSON.",
        model=model
    )
    
    if error:
        self._json(500, {"error": error})
        return
    
    try:
        result = json.loads(response)
        self._json(200, {
            "success": True,
            "result": result,
            "action": action,
            "model": model
        })
    except json.JSONDecodeError as e:
        self._json(500, {
            "error": "Failed to parse AI response",
            "details": str(e),
            "response": response[:500]
        })


# ═══════════════════════════════════════════════════════════════════════
# PRZYKŁAD UŻYCIA w frontendzie (React/TypeScript)
# ═══════════════════════════════════════════════════════════════════════

"""
// src/api/aiGraphGenerator.ts

export async function generateProjectGraph(
  prompt: string,
  projectPath: string,
  model: string = 'anthropic/claude-3.7-sonnet'
) {
  const response = await fetch('http://localhost:8001/api/nodle/ai-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      project_path: projectPath,
      depth: 3,
      model
    })
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error);
  }
  
  return data.graph;
}

export async function enhanceNode(
  nodeId: string,
  action: 'suggest-connections' | 'add-details' | 'optimize-layout',
  model: string = 'anthropic/claude-3.7-sonnet'
) {
  const response = await fetch('http://localhost:8001/api/nodle/ai-enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodeId, action, model })
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error);
  }
  
  return data.result;
}

// Użycie w komponencie:

function GraphGenerator() {
  const [loading, setLoading] = useState(false);
  const [graph, setGraph] = useState(null);
  
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newGraph = await generateProjectGraph(
        "Wygeneruj interaktywną mapę architektury ZENO Browser",
        "U:\\\\WWW_Zen_BRo_wser_org3",
        "anthropic/claude-3.7-sonnet"
      );
      
      setGraph(newGraph);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? '🤖 Generuję...' : '🚀 Wygeneruj graf przez AI'}
      </button>
      
      {graph && (
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          // ... React Flow props
        />
      )}
    </div>
  );
}
"""
