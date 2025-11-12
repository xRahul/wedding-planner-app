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

const Badge = ({ status, children, size = 'normal' }) => {
    const variant = ['yes', 'confirmed', 'done', 'purchased', 'completed', 'received'].includes(status) ? 'badge-success' :
                   ['no', 'declined', 'high'].includes(status) ? 'badge-error' :
                   ['pending', 'medium'].includes(status) ? 'badge-warning' : 'badge-info';
    const sizeClass = size === 'small' ? 'badge-small' : '';
    return <span className={`badge ${variant} ${sizeClass}`}>{children || status}</span>;
};

const ProgressRing = ({ percentage, size = 60, strokeWidth = 4, color = 'var(--color-primary)' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={radius} stroke="var(--color-border)" strokeWidth={strokeWidth} fill="none" />
                <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', fontWeight: 'bold' }}>
                {Math.round(percentage)}%
            </div>
        </div>
    );
};

const QuickStats = ({ stats }) => (
    <div className="quick-stats">
        {stats.map((stat, idx) => (
            <div key={idx} className="quick-stat">
                <div className="quick-stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="quick-stat-label">{stat.label}</div>
            </div>
        ))}
    </div>
);

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

// ==================== NORTH INDIAN WEDDING CONSTANTS ====================

const NORTH_INDIAN_RELATIONS = [
    'father', 'mother', 'brother', 'sister', 'uncle', 'aunt', 'cousin',
    'grandfather', 'grandmother', 'nephew', 'niece', 'son_in_law', 'daughter_in_law',
    'mama', 'mami', 'chacha', 'chachi', 'tau', 'tayi', 'bua', 'fufa',
    'nana', 'nani', 'dada', 'dadi', 'jija', 'saala', 'saali', 'devar', 'jethani'
];

const NORTH_INDIAN_CEREMONIES = [
    'Roka', 'Sagan', 'Tilak', 'Ring Ceremony', 'Mehendi', 'Sangeet', 'Haldi',
    'Ganesh Puja', 'Kalash Sthapna', 'Mandap Muhurat', 'Baraat', 'Milni',
    'Jaimala', 'Kanyadaan', 'Pheras', 'Sindoor', 'Vidai', 'Reception',
    'Grih Pravesh', 'Pag Phera', 'Mooh Dikhai'
];

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
        try {
            if (validator) {
                const errors = validator(item);
                if (errors) {
                    const errorMsg = Object.entries(errors).map(([k, v]) => `• ${k}: ${v}`).join('\n');
                    alert(`Please fix the following errors:\n\n${errorMsg}`);
                    return;
                }
            }
            const idx = items.findIndex(i => i.id === item.id);
            const updated = idx >= 0 ? [...items.slice(0, idx), item, ...items.slice(idx + 1)] : [...items, item];
            updateData(dataKey, updated);
            setShowModal(false);
            setEditing(null);
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save. Please try again.');
        }
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

const useWeddingProgress = (data) => {
    return useMemo(() => {
        const totalTasks = data.tasks?.length || 0;
        const completedTasks = data.tasks?.filter(t => t.status === 'done').length || 0;
        const totalGuests = data.guests?.length || 0;
        const confirmedGuests = data.guests?.filter(g => g.rsvpStatus === 'yes').length || 0;
        const totalVendors = data.vendors?.length || 0;
        const confirmedVendors = data.vendors?.filter(v => ['confirmed', 'booked'].includes(v.status)).length || 0;
        
        return {
            tasks: { completed: completedTasks, total: totalTasks, percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0 },
            guests: { confirmed: confirmedGuests, total: totalGuests, percentage: totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0 },
            vendors: { confirmed: confirmedVendors, total: totalVendors, percentage: totalVendors > 0 ? (confirmedVendors / totalVendors) * 100 : 0 }
        };
    }, [data]);
};

const useFilter = (items, filterFn) => {
    const [filter, setFilter] = useState('all');
    const filtered = useMemo(() => filter === 'all' ? items : items.filter(i => filterFn(i, filter)), [items, filter]);
    return [filtered, filter, setFilter];
};
