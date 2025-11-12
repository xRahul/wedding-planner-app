const { useState, useEffect, useMemo } = React;



// ==================== RITUALS COMPONENT ====================

const Rituals = ({ ritualsAndCustoms, traditions, updateData }) => {
    const [activeTab, setActiveTab] = useState('pre');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const handleAdd = (type) => {
        setEditingItem({ type, name: '', description: '', date: '', time: '', participants: '', items: '', notes: '', completed: false });
        setShowModal(true);
    };

    const handleEdit = (item, type) => {
        setEditingItem({ ...item, type });
        setShowModal(true);
    };

    const handleSave = (item) => {
        if (!item.name?.trim()) {
            alert('Name is required.');
            return;
        }
        const updated = { ...ritualsAndCustoms };
        const key = item.type === 'pre' ? 'preWedding' : item.type === 'main' ? 'mainCeremonies' : 'customs';
        const list = [...(updated[key] || [])];
        const idx = list.findIndex(i => i.name === item.name && i.date === item.date);
        if (idx >= 0) list[idx] = item;
        else list.push(item);
        updated[key] = list;
        updateData('ritualsAndCustoms', updated);
        setShowModal(false);
        setEditingItem(null);
    };

    const handleDelete = (item, type) => {
        if (confirm(`Delete ${item.name}?`)) {
            const updated = { ...ritualsAndCustoms };
            const key = type === 'pre' ? 'preWedding' : type === 'main' ? 'mainCeremonies' : 'customs';
            updated[key] = updated[key].filter(i => i.name !== item.name || i.date !== item.date);
            updateData('ritualsAndCustoms', updated);
        }
    };

    const handleToggle = (item, type) => {
        const updated = { ...ritualsAndCustoms };
        const key = type === 'pre' ? 'preWedding' : type === 'main' ? 'mainCeremonies' : 'customs';
        const list = [...updated[key]];
        const idx = list.findIndex(i => i.name === item.name && i.date === item.date);
        if (idx >= 0) list[idx].completed = !list[idx].completed;
        updated[key] = list;
        updateData('ritualsAndCustoms', updated);
    };

    const handleAddItem = () => {
        const item = { name: '', quantity: '', status: 'pending', notes: '' };
        const updated = { ...traditions, ritual_items: [...(traditions.ritual_items || []), item] };
        updateData('traditions', updated);
    };

    const handleUpdateItem = (idx, field, value) => {
        const updated = { ...traditions };
        updated.ritual_items[idx][field] = value;
        updateData('traditions', updated);
    };

    const handleDeleteItem = (idx) => {
        if (confirm('Delete this item?')) {
            const updated = { ...traditions };
            updated.ritual_items.splice(idx, 1);
            updateData('traditions', updated);
        }
    };

    return (
        <div>
            <div className="card">
                <div className="flex-between">
                    <h2 className="card-title">🪔 Rituals & Customs</h2>
                    <button className="btn btn-outline btn-small" onClick={() => setShowAnalytics(!showAnalytics)}>
                        {showAnalytics ? '📊 Hide Analytics' : '📊 Show Analytics'}
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                    <button className={`btn ${activeTab === 'pre' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('pre')}>Pre-Wedding</button>
                    <button className={`btn ${activeTab === 'main' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('main')}>Main Ceremonies</button>
                    <button className={`btn ${activeTab === 'customs' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('customs')}>Customs</button>
                    <button className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('items')}>Ritual Items</button>
                    <button className={`btn ${activeTab === 'templates' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('templates')}>Templates</button>
                </div>
            </div>

            {showAnalytics && <RitualAnalytics ritualsAndCustoms={ritualsAndCustoms} />}

            {activeTab === 'pre' && (
                <div className="card">
                    <div className="flex-between">
                        <h3>Pre-Wedding Rituals</h3>
                        <button className="btn btn-primary btn-small" onClick={() => handleAdd('pre')}>Add Ritual</button>
                    </div>
                    {ritualsAndCustoms.preWedding?.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Done</th>
                                        <th>Name</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Participants</th>
                                        <th>Items Needed</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ritualsAndCustoms.preWedding.map((r, i) => (
                                        <tr key={i}>
                                            <td><input type="checkbox" checked={r.completed} onChange={() => handleToggle(r, 'pre')} style={{ width: '18px', height: '18px' }} /></td>
                                            <td><strong>{r.name}</strong></td>
                                            <td>{r.date ? formatDate(r.date) : '-'}</td>
                                            <td>{r.time || '-'}</td>
                                            <td style={{ fontSize: '12px' }}>{r.participants || '-'}</td>
                                            <td style={{ fontSize: '12px' }}>{r.items || '-'}</td>
                                            <td style={{ fontSize: '12px' }}>{r.notes || '-'}</td>
                                            <td>
                                                <button className="btn btn-outline btn-small" onClick={() => handleEdit(r, 'pre')}>Edit</button>
                                                <button className="btn btn-danger btn-small" onClick={() => handleDelete(r, 'pre')}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state"><div className="empty-state-icon">🪔</div><p>No pre-wedding rituals added</p></div>
                    )}
                </div>
            )}

            {activeTab === 'main' && (
                <div className="card">
                    <div className="flex-between">
                        <h3>Main Ceremonies</h3>
                        <button className="btn btn-primary btn-small" onClick={() => handleAdd('main')}>Add Ceremony</button>
                    </div>
                    {ritualsAndCustoms.mainCeremonies?.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Done</th>
                                        <th>Name</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Participants</th>
                                        <th>Items Needed</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ritualsAndCustoms.mainCeremonies.map((r, i) => (
                                        <tr key={i}>
                                            <td><input type="checkbox" checked={r.completed} onChange={() => handleToggle(r, 'main')} style={{ width: '18px', height: '18px' }} /></td>
                                            <td><strong>{r.name}</strong></td>
                                            <td>{r.date ? formatDate(r.date) : '-'}</td>
                                            <td>{r.time || '-'}</td>
                                            <td style={{ fontSize: '12px' }}>{r.participants || '-'}</td>
                                            <td style={{ fontSize: '12px' }}>{r.items || '-'}</td>
                                            <td style={{ fontSize: '12px' }}>{r.notes || '-'}</td>
                                            <td>
                                                <button className="btn btn-outline btn-small" onClick={() => handleEdit(r, 'main')}>Edit</button>
                                                <button className="btn btn-danger btn-small" onClick={() => handleDelete(r, 'main')}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state"><div className="empty-state-icon">💒</div><p>No main ceremonies added</p></div>
                    )}
                </div>
            )}

            {activeTab === 'customs' && (
                <div className="card">
                    <div className="flex-between">
                        <h3>Customs & Traditions</h3>
                        <button className="btn btn-primary btn-small" onClick={() => handleAdd('customs')}>Add Custom</button>
                    </div>
                    {ritualsAndCustoms.customs?.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Done</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Participants</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ritualsAndCustoms.customs.map((r, i) => (
                                        <tr key={i}>
                                            <td><input type="checkbox" checked={r.completed} onChange={() => handleToggle(r, 'customs')} style={{ width: '18px', height: '18px' }} /></td>
                                            <td><strong>{r.name}</strong></td>
                                            <td style={{ fontSize: '12px' }}>{r.description || '-'}</td>
                                            <td>{r.date ? formatDate(r.date) : '-'}</td>
                                            <td>{r.time || '-'}</td>
                                            <td style={{ fontSize: '12px' }}>{r.participants || '-'}</td>
                                            <td style={{ fontSize: '12px' }}>{r.notes || '-'}</td>
                                            <td>
                                                <button className="btn btn-outline btn-small" onClick={() => handleEdit(r, 'customs')}>Edit</button>
                                                <button className="btn btn-danger btn-small" onClick={() => handleDelete(r, 'customs')}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state"><div className="empty-state-icon">🎊</div><p>No customs added</p></div>
                    )}
                </div>
            )}

            {activeTab === 'items' && (
                <div className="card">
                    <div className="flex-between">
                        <h3>Ritual Items Checklist</h3>
                        <button className="btn btn-primary btn-small" onClick={handleAddItem}>Add Item</button>
                    </div>
                    {traditions.ritual_items?.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th>Quantity</th>
                                        <th>Status</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {traditions.ritual_items.map((item, i) => (
                                        <tr key={i}>
                                            <td><input type="text" className="form-input" value={item.name} onChange={e => handleUpdateItem(i, 'name', e.target.value)} placeholder="Item name" /></td>
                                            <td><input type="text" className="form-input" value={item.quantity} onChange={e => handleUpdateItem(i, 'quantity', e.target.value)} placeholder="Qty" style={{ width: '80px' }} /></td>
                                            <td>
                                                <select className="form-select" value={item.status} onChange={e => handleUpdateItem(i, 'status', e.target.value)}>
                                                    <option value="pending">Pending</option>
                                                    <option value="ordered">Ordered</option>
                                                    <option value="received">Received</option>
                                                </select>
                                            </td>
                                            <td><input type="text" className="form-input" value={item.notes} onChange={e => handleUpdateItem(i, 'notes', e.target.value)} placeholder="Notes" /></td>
                                            <td><button className="btn btn-danger btn-small" onClick={() => handleDeleteItem(i)}>Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state"><div className="empty-state-icon">📋</div><p>No ritual items added</p></div>
                    )}
                </div>
            )}

            {showModal && <RitualModal item={editingItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditingItem(null); }} />}
        </div>
    );
};

const RitualModal = ({ item, onSave, onClose }) => {
    const [formData, setFormData] = useState(item);
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{item.name ? 'Edit' : 'Add'} {item.type === 'pre' ? 'Pre-Wedding Ritual' : item.type === 'main' ? 'Main Ceremony' : 'Custom'}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Haldi, Mehendi, Ganesh Puja" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" rows="2" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input type="date" className="form-input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Time</label>
                        <input type="time" className="form-input" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Participants</label>
                        <input type="text" className="form-input" value={formData.participants} onChange={e => setFormData({ ...formData, participants: e.target.value })} placeholder="Who will participate" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Items Needed</label>
                        <textarea className="form-textarea" value={formData.items} onChange={e => setFormData({ ...formData, items: e.target.value })} placeholder="List items needed for this ritual" rows="2" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea className="form-textarea" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes" rows="2" />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => onSave(formData)} disabled={!formData.name}>Save</button>
                </div>
            </div>
        </div>
    );
};