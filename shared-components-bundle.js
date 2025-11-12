const { useState, useEffect, useMemo } = React;

// ==================== SHARED COMPONENTS ====================

const Modal = ({ title, onClose, onSave, children, saveLabel = 'Save', saveDisabled = false }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <h3 className="modal-title">{title}</h3>
                <button className="modal-close" onClick={onClose}>&times;</button>
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={onSave} disabled={saveDisabled}>{saveLabel}</button>
            </div>
        </div>
    </div>
);

const FormField = ({ label, type = 'text', value, onChange, error, required, placeholder, ...props }) => (
    <div className="form-group">
        <label className="form-label">{label}{required && ' *'}</label>
        {type === 'textarea' ? (
            <textarea className={`form-textarea ${error ? 'error' : ''}`} value={value} onChange={onChange} placeholder={placeholder} {...props} />
        ) : type === 'select' ? (
            <select className={`form-select ${error ? 'error' : ''}`} value={value} onChange={onChange} {...props}>
                {props.children}
            </select>
        ) : (
            <input type={type} className={`form-input ${error ? 'error' : ''}`} value={value} onChange={onChange} placeholder={placeholder} {...props} />
        )}
        {error && <div className="error-message">{error}</div>}
    </div>
);

const Badge = ({ status, children }) => {
    const variant = ['yes', 'confirmed', 'done', 'purchased', 'completed', 'received'].includes(status) ? 'badge-success' :
                   ['no', 'declined', 'high'].includes(status) ? 'badge-error' :
                   ['pending', 'medium'].includes(status) ? 'badge-warning' : 'badge-info';
    return <span className={`badge ${variant}`}>{children || status}</span>;
};

const EmptyState = ({ icon, message, description }) => (
    <div className="empty-state">
        <div className="empty-state-icon">{icon}</div>
        <p>{message}</p>
        {description && <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>{description}</p>}
    </div>
);

const Card = ({ title, action, children }) => (
    <div className="card">
        {(title || action) && (
            <div className="flex-between">
                {title && <h2 className="card-title">{title}</h2>}
                {action}
            </div>
        )}
        {children}
    </div>
);

const ActionButtons = ({ onEdit, onDelete }) => (
    <>
        <button className="btn btn-outline btn-small" onClick={onEdit}>Edit</button>
        <button className="btn btn-danger btn-small" onClick={onDelete}>Delete</button>
    </>
);

const SelectOrAddField = ({ label, value, onChange, options, placeholder }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newValue, setNewValue] = useState('');

    const handleAdd = () => {
        if (newValue.trim()) {
            onChange(newValue.trim());
            setNewValue('');
            setIsAdding(false);
        }
    };

    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            {!isAdding ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <select className="form-select" value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1 }}>
                        <option value="">Select {label}</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>)}
                    </select>
                    <button type="button" className="btn btn-outline btn-small" onClick={() => setIsAdding(true)}>+ Add</button>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" className="form-input" value={newValue} onChange={e => setNewValue(e.target.value)} 
                        placeholder={placeholder} style={{ flex: 1 }} onKeyPress={e => e.key === 'Enter' && handleAdd()} />
                    <button type="button" className="btn btn-primary btn-small" onClick={handleAdd}>Add</button>
                    <button type="button" className="btn btn-outline btn-small" onClick={() => { setIsAdding(false); setNewValue(''); }}>Cancel</button>
                </div>
            )}
        </div>
    );
};

// ==================== SHARED HOOKS ====================

const useCRUD = (items, updateData, dataKey, validator) => {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const handleAdd = (template) => {
        setEditing({ id: generateId(), ...template });
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditing({ ...item });
        setShowModal(true);
    };

    const handleSave = (item) => {
        if (validator) {
            const errors = validator(item);
            if (errors) {
                alert(`Please fix:\n${Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join('\n')}`);
                return;
            }
        }
        const idx = items.findIndex(i => i.id === item.id);
        const updated = idx >= 0 ? [...items.slice(0, idx), item, ...items.slice(idx + 1)] : [...items, item];
        updateData(dataKey, updated);
        setShowModal(false);
        setEditing(null);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this item?')) {
            updateData(dataKey, items.filter(i => i.id !== id));
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
    };

    return { showModal, editing, handleAdd, handleEdit, handleSave, handleDelete, closeModal };
};

const useFilter = (items, filterFn) => {
    const [filter, setFilter] = useState('all');
    const filtered = useMemo(() => filter === 'all' ? items : items.filter(i => filterFn(i, filter)), [items, filter]);
    return [filtered, filter, setFilter];
};
