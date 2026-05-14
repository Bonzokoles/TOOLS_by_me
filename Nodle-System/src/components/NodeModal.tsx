import { useForm } from 'react-hook-form';
import { useDiagramStore } from '../store/diagramStore';
import './NodeModal.css';

interface NodeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    name: string;
    type: 'api' | 'rag' | 'kg' | 'vector_db';
    description: string;
}

export default function NodeModal({ isOpen, onClose }: NodeModalProps) {
    const { addNode, isLoading } = useDiagramStore();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

    if (!isOpen) return null;

    const onSubmit = async (data: FormData) => {
        const position = {
            x: Math.random() * 400 + 100,
            y: Math.random() * 300 + 100,
        };

        await addNode(data, position);
        reset();
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Node</h2>
                    <button className="close-btn" onClick={handleClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="name">Node Name *</label>
                        <input
                            id="name"
                            type="text"
                            {...register('name', { required: 'Name is required' })}
                            placeholder="e.g., FastAPI Gateway"
                        />
                        {errors.name && <span className="error">{errors.name.message}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Node Type *</label>
                        <select id="type" {...register('type', { required: 'Type is required' })}>
                            <option value="">Select type...</option>
                            <option value="api">API</option>
                            <option value="rag">RAG</option>
                            <option value="kg">Knowledge Graph</option>
                            <option value="vector_db">Vector DB</option>
                        </select>
                        {errors.type && <span className="error">{errors.type.message}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            rows={4}
                            {...register('description', { required: 'Description is required' })}
                            placeholder="Describe the node's purpose..."
                        />
                        {errors.description && <span className="error">{errors.description.message}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Node'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
