"""
NODLE_SYSTEM_FIX.md

Kompleksowe naprawy dla systemu Nodle po migracji na async SQLite

## PROBLEMY DO NAPRAWIENIA:

### 1. nodle_system.py - Brakujące atrybuty .nodes i .edges
Wiele metod używa:
- self.nodes (dict) - nie istnieje po migracji
- self.edges (list) - nie istnieje po migracji

### ROZWIĄZANIE:
Dodać @property getters które pobierają z SQLite:

```python
@property
def nodes(self) -> Dict[str, NodleNode]:
    \"\"\"Get all nodes as dict (compatibility layer)\"\"\"
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Create new loop for sync access
            new_loop = asyncio.new_event_loop()
            asyncio.set_event_loop(new_loop)
            result = new_loop.run_until_complete(self._get_nodes_dict())
            asyncio.set_event_loop(loop)
            return result
        else:
            return loop.run_until_complete(self._get_nodes_dict())
    except RuntimeError:
        # No loop running
        return asyncio.run(self._get_nodes_dict())

async def _get_nodes_dict(self) -> Dict[str, NodleNode]:
    \"\"\"Async helper for nodes property\"\"\"
    all_nodes = await self.get_all_nodes()
    return {node.node_id: node for node in all_nodes}

@property  
def edges(self) -> List[NodleEdge]:
    \"\"\"Get all edges as list (compatibility layer)\"\"\"
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            new_loop = asyncio.new_event_loop()
            asyncio.set_event_loop(new_loop)
            result = new_loop.run_until_complete(self.get_all_edges())
            asyncio.set_event_loop(loop)
            return result
        else:
            return loop.run_until_complete(self.get_all_edges())
    except RuntimeError:
        return asyncio.run(self.get_all_edges())
```

### 2. Metody traverse_bfs i traverse_dfs - NIE ASYNC
Obecnie używają:
```python
if start_node not in self.nodes:  # ❌ - wymaga await
edges = self.get_edges(current, direction="out")  # ❌ - brak await
```

### ROZWIĄZANIE:
Przerobić na async:

```python
async def traverse_bfs(
    self, start_node: str, max_depth: int = 2, relation_filter: Optional[str] = None
) -> List[str]:
    \"\"\"BFS traversal - async version\"\"\"
    start = await self.get_node(start_node)
    if not start:
        logger.warning(f"Start node {start_node} not found")
        return []
    
    visited = set()
    queue = [(start_node, 0)]
    result = []
    
    while queue:
        current, depth = queue.pop(0)
        
        if current in visited or depth > max_depth:
            continue
        
        visited.add(current)
        result.append(current)
        
        # Get outgoing edges - await!
        edges = await self.get_edges(current, direction="out")
        
        if relation_filter:
            edges = [edge for edge in edges if edge.relation == relation_filter]
        
        for edge in edges:
            if edge.target not in visited:
                queue.append((edge.target, depth + 1))
    
    return result
```

### 3. routes/nodle.py - linia 162, 304, 335-340, 384, 392
Już naprawione przez zmiany await.

### 4. sync_graph endpoint - brak await
Linie 378, 384, 397, 400 - brak await przed wywołaniami async.

### ROZWIĄZANIE:
Dodać await:
```python
# Linia 378
await nodle.add_node(
    node_id=node.id,
    node_type=node.type,
    data=node_data,
    embedding=None,
)

# Linia 384
existing = await nodle.get_node(node.id)
if existing:
    existing.metadata.update(node.metadata)

# Linia 397
await nodle.add_edge(...)
```

## PRIORYTETY:

1. 🔴 KRITYCZNE: Dodać .nodes i .edges property dla kompatybilności
2. 🔴 KRITYCZNE: Naprawić traverse_bfs/dfs - dodać await
3. 🟡 ŚREDNIE: Naprawić sync_graph endpoint
4. 🟡 ŚREDNIE: Dodać metodę remove_edge (już dodana)
5. 🟢 NISKIE: Zoptymalizować cache dla częstych operacji

## TESTOWANIE:

Po naprawach przetestować:
```bash
cd JIMBO_devz_inc_HUB/Jimbo_77/api
python -c "
from app.nodle.nodle_system import NodleSystem
import asyncio

async def test():
    nodle = NodleSystem()
    # Test 1: get_all_nodes
    nodes = await nodle.get_all_nodes()
    print(f'✅ Nodes: {len(nodes)}')
    
    # Test 2: get_all_edges  
    edges = await nodle.get_all_edges()
    print(f'✅ Edges: {len(edges)}')
    
    # Test 3: Property access
    print(f'✅ nodes property: {len(nodle.nodes)}')
    print(f'✅ edges property: {len(nodle.edges)}')
    
    # Test 4: traverse_bfs
    result = await nodle.traverse_bfs('node_1', max_depth=2)
    print(f'✅ BFS: {len(result)} nodes visited')

asyncio.run(test())
"
```

## REKOMENDACJE DODATKOWE:

1. **Cache dla nodle.nodes/nodle.edges**
   - Aktualnie każde wywołanie pobiera wszystko z SQLite
   - Dla dużych grafów (>1000 node) to wolne
   - Rozwiązanie: LRU cache z TTL (5s)

2. **Batch operations**
   - Zamiast pojedynczych INSERTów, używać executemany()
   - Szczególnie dla sync_graph z wieloma nodes/edges

3. **Indeksy w SQLite**
   - Sprawdzić czy są indeksy na: node_id, source, target
   - Dodać jeśli brakują

4. **Walidacja schematu**
   - Dodać automatyczną migrację schematu przy starcie
   - Sprawdzić czy wszystkie tabele i kolumny istnieją

5. **Error handling**
   - Lepiej obsługiwać IntegrityError (duplikaty)
   - Dodawać retry logic dla timeoutów SQLite
