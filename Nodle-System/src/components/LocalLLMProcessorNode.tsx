
import { useState, useCallback } from 'react';
import './LocalLLMProcessorNode.css';
import { useReactFlow, type NodeProps } from '@xyflow/react';

export const LocalLLMProcessorNode: React.FC<NodeProps> = ({
    id,
    data,
}) => {
    const { updateNodeData } = useReactFlow();
    const [expanded, setExpanded] = useState(true);
    const [selectedTask, setSelectedTask] = useState('summarize');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const [selectedModel, setSelectedModel] = useState('llama3.2:1b');
    const [modelPrompts, setModelPrompts] = useState<Record<string, string>>({
        'llama3.2:1b': 'You are a helpful assistant. Be concise.',
        'deepseek-r1:1.5b': 'You are a senior software architect. Analyze deeply.',
        'mistral:7b': 'You are a versatile writing assistant.',
        'gemma:2b': 'You are a fast, lightweight helper.'
    });

    const tasks = [
        { value: 'summarize', label: '📋 Streszczenie' },
        { value: 'extract_entities', label: '🏷️ Wyciągnij encje' },
        { value: 'qa', label: '❓ Pytania & Odpowiedzi' },
        { value: 'generate', label: '✨ Generuj treść' },
        { value: 'translate', label: '🌍 Tłumaczenie' },
        { value: 'architect', label: '👷 Architect Plan' }, // New Task
    ];

    const models = [
        { id: 'llama3.2:1b', name: '🦙 Llama 3.2 (1B)' },
        { id: 'deepseek-r1:1.5b', name: '🧠 DeepSeek R1 (1.5B)' },
        { id: 'mistral:7b', name: '🌪️ Mistral (7B)' },
        { id: 'gemma:2b', name: '💎 Gemma (2B)' },
    ];

    const currentPrompt = modelPrompts[selectedModel] || '';

    const handlePromptChange = (newPrompt: string) => {
        setModelPrompts(prev => ({
            ...prev,
            [selectedModel]: newPrompt
        }));
    };

    const processFile = useCallback(async () => {
        const fileId = data.fileId || "U:\\The_yellow_hub\\demos\\README.md";
        setIsProcessing(true);
        setError('');

        try {
            let endpoint = '';
            let payload: any = {
                file_id: fileId,
                model: selectedModel,
                system_prompt: currentPrompt
            };

            switch (selectedTask) {
                case 'summarize':
                    endpoint = '/api/llm/summarize';
                    payload.language = 'pl';
                    break;
                case 'extract_entities':
                    endpoint = '/api/llm/extract-entities';
                    break;
                case 'qa':
                    endpoint = '/api/llm/qa';
                    payload.question = data.question || 'Podsumuj ten dokument';
                    break;
                case 'generate':
                    endpoint = '/api/llm/generate';
                    payload.topic = data.topic || 'AI i machine learning';
                    payload.content_type = 'artykuł';
                    break;
                case 'translate':
                    endpoint = '/api/llm/translate';
                    payload.target_language = 'en';
                    break;
                case 'architect':
                    endpoint = '/api/llm/architect';
                    payload.query = data.question || 'Co robimy dalej?';
                    payload.context = data.context || 'Jesteśmy w trakcie buildingu systemu RAG.';
                    break;
                default:
                    setError('Nieznane zadanie');
                    return;
            }

            // Assuming backend is at localhost:8001
            const response = await fetch(`http://localhost:8001${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const resData = await response.json();

            if (resData.status === 'error') {
                setError(resData.message);
            } else {
                let formattedResult = '';
                if (selectedTask === 'extract_entities') {
                    formattedResult = JSON.stringify(resData.entities, null, 2);
                } else if (selectedTask === 'qa') {
                    formattedResult = resData.answer;
                } else if (selectedTask === 'generate') {
                    formattedResult = resData.content;
                } else if (selectedTask === 'architect') {
                    formattedResult = resData.plan;
                } else {
                    formattedResult = resData.summary || resData.translation || resData.result || '';
                }

                setResult(formattedResult);

                updateNodeData(id, {
                    ...data,
                    result: formattedResult,
                    taskType: selectedTask,
                    processedAt: new Date().toISOString()
                });
            }
        } catch (err) {
            setError(`Błąd połączenia: ${err}`);
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    }, [data, selectedTask, id, updateNodeData, selectedModel, currentPrompt]);

    // Status Light Logic
    // Yellow = Idle/Waiting
    // Green = Processing/Working
    // Red = Error
    let statusColor = '#ffbd2e'; // Default Yellow (Waiting)
    let shadowColor = 'none';

    if (error) {
        statusColor = '#ff5f56'; // Red
        shadowColor = '0 0 10px #ff5f56';
    } else if (isProcessing) {
        statusColor = '#27c93f'; // Green
        shadowColor = '0 0 10px #27c93f';
    } else {
        // Idle/Waiting
        statusColor = '#ffbd2e'; // Yellow
        // Subtle glow for waiting
        shadowColor = '0 0 5px rgba(255, 189, 46, 0.3)';
    }

    return (
        <div className="node-service" style={{ minWidth: expanded ? 320 : 200, transition: 'all 0.3s' }}>
            {/* Header */}
            <div className="node-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                        className="node-status"
                        title={isProcessing ? "Processing" : error ? "Error" : "Waiting for Task"}
                        style={{
                            background: statusColor,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            boxShadow: shadowColor,
                            transition: 'all 0.3s'
                        }}
                    ></div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e8edf5' }}>
                        {expanded ? '🤖 Local Processor' : models.find(m => m.id === selectedModel)?.name}
                    </span>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#4a9eff',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0 4px'
                    }}
                >
                    {expanded ? '🔼' : '🔽'}
                </button>
            </div>

            {/* Content - Only visible if expanded */}
            {expanded && (
                <div className="node-content" style={{ padding: '16px', background: '#0a0d14', borderTop: '1px solid #333' }}>

                    {/* Model Selection */}
                    <div className="form-group" style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', color: '#4a9eff', fontSize: '0.75rem', marginBottom: 4, fontWeight: 600 }}>MODEL:</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            disabled={isProcessing}
                            style={{
                                width: '100%', padding: '6px', background: '#13161c', color: '#e8edf5',
                                border: '1px solid #333', borderRadius: 0, fontSize: '0.85rem'
                            }}
                        >
                            {models.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* System Prompt */}
                    <div className="form-group" style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', color: '#7a8396', fontSize: '0.75rem', marginBottom: 4 }}>SYSTEM PROMPT:</label>
                        <textarea
                            value={currentPrompt}
                            onChange={(e) => handlePromptChange(e.target.value)}
                            disabled={isProcessing}
                            rows={2}
                            style={{
                                width: '100%', padding: '6px', background: '#13161c', color: '#aaa',
                                border: '1px solid #333', borderRadius: 0, fontSize: '0.8rem', resize: 'vertical',
                                fontFamily: 'monospace'
                            }}
                            placeholder="Enter system prompt for this model..."
                        />
                    </div>

                    <div style={{ height: 1, background: '#333', margin: '12px 0' }}></div>

                    {/* Task Selection */}
                    <div className="form-group" style={{ marginBottom: 10 }}>
                        <label style={{ display: 'block', color: '#888', fontSize: '0.8em', marginBottom: 4 }}>TASK:</label>
                        <select
                            value={selectedTask}
                            onChange={(e) => setSelectedTask(e.target.value)}
                            disabled={isProcessing}
                            style={{ width: '100%', padding: '6px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 0 }}
                        >
                            {tasks.map((task) => (
                                <option key={task.value} value={task.value}>
                                    {task.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedTask === 'qa' && (
                        <div className="form-group" style={{ marginBottom: 10 }}>
                            <input
                                type="text"
                                placeholder="Enter question..."
                                value={(data as Record<string, unknown>).question as string || ''}
                                onChange={(e) => updateNodeData(id, { question: e.target.value })}
                                style={{ width: '100%', padding: '6px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 0 }}
                            />
                        </div>
                    )}

                    {selectedTask === 'generate' && (
                        <div className="form-group" style={{ marginBottom: 10 }}>
                            <input
                                type="text"
                                placeholder="Topic..."
                                value={(data as Record<string, unknown>).topic as string || ''}
                                onChange={(e) => updateNodeData(id, { topic: e.target.value })}
                                style={{ width: '100%', padding: '6px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 0 }}
                            />
                        </div>
                    )}

                    {selectedTask === 'translate' && (
                        <div className="form-group" style={{ marginBottom: 10 }}>
                            <select
                                value={(data as Record<string, unknown>).targetLang as string || 'en'}
                                onChange={(e) => updateNodeData(id, { targetLang: e.target.value })}
                                style={{ width: '100%', padding: '6px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 0 }}
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>
                    )}

                    <button
                        onClick={processFile}
                        disabled={isProcessing}
                        style={{
                            width: '100%', padding: '8px',
                            background: isProcessing ? '#333' : '#0066cc',
                            color: 'white', border: 'none', cursor: 'pointer',
                            marginTop: '8px', borderRadius: 0, fontWeight: 600
                        }}
                    >
                        {isProcessing ? '⏳ PROCESSING...' : '⚡ EXECUTE'}
                    </button>

                    {error && (
                        <div style={{ color: '#ff5f56', marginTop: 10, fontSize: '0.8em', padding: '8px', background: 'rgba(255, 95, 86, 0.1)' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {result && (
                        <div style={{ marginTop: 12, borderTop: '1px solid #333', paddingTop: 8 }}>
                            <div style={{ color: '#4a9eff', fontSize: '0.75rem', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                                <span>RESULT:</span>
                                <span style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(result)}>📋</span>
                            </div>
                            <div style={{
                                maxHeight: 200, overflow: 'auto', fontSize: '0.85rem', whiteSpace: 'pre-wrap', color: '#ccc',
                                background: '#000', padding: '8px', border: '1px solid #333', fontFamily: 'monospace'
                            }}>
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Handles - Standard Layout */}
            <div style={{ position: 'absolute', top: '50%', left: -3, width: 6, height: 6, background: '#4a9eff' }} />
            <div style={{ position: 'absolute', top: '50%', right: -3, width: 6, height: 6, background: '#4a9eff' }} />
        </div>
    );
};

export default LocalLLMProcessorNode;
