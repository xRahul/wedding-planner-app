const { useState, useEffect, useMemo } = React;

// ==================== MENUS COMPONENT ====================

const Menus = ({ menus, updateData }) => {
    const [showEventModal, setShowEventModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [currentEventId, setCurrentEventId] = useState(null);

    const handleAddEvent = () => {
        setEditingEvent({ id: generateId(), name: '', expectedGuests: 0, attendedGuests: 0, items: [] });
        setShowEventModal(true);
    };

    const handleEditEvent = (event) => {
        setEditingEvent({ ...event });
        setShowEventModal(true);
    };

    const handleSaveEvent = (event) => {
        if (!event.name?.trim()) {
            alert('Event name is required.');
            return;
        }
        if (!event.items) event.items = [];
        const updatedMenus = [...menus];
        const idx = updatedMenus.findIndex(m => m.id === event.id);
        if (idx >= 0) {
            updatedMenus[idx] = event;
        } else {
            updatedMenus.push(event);
        }
        updateData('menus', updatedMenus);
        setShowEventModal(false);
        setEditingEvent(null);
    };

    const handleDeleteEvent = (id) => {
        if (confirm('Delete this event and all its menu items?')) {
            updateData('menus', menus.filter(m => m.id !== id));
        }
    };

    const handleAddItem = (eventId) => {
        setCurrentEventId(eventId);
        setEditingItem({ name: '', pricePerPlate: 0, description: '' });
        setShowItemModal(true);
    };

    const handleSaveItem = (item) => {
        if (!item.name?.trim()) {
            alert('Item name is required.');
            return;
        }
        const updatedMenus = [...menus];
        const eventIdx = updatedMenus.findIndex(m => m.id === currentEventId);
        if (eventIdx >= 0) {
            updatedMenus[eventIdx].items.push(item);
            updateData('menus', updatedMenus);
        }
        setShowItemModal(false);
        setEditingItem(null);
        setCurrentEventId(null);
    };

    const handleDeleteItem = (eventId, itemIdx) => {
        if (confirm('Delete this menu item?')) {
            const updatedMenus = [...menus];
            const eventIdx = updatedMenus.findIndex(m => m.id === eventId);
            if (eventIdx >= 0) {
                updatedMenus[eventIdx].items.splice(itemIdx, 1);
                updateData('menus', updatedMenus);
            }
        }
    };

    return (
        <div>
            <div className="card">
                <div className="flex-between">
                    <h2 className="card-title">Event Menus</h2>
                    <button className="btn btn-primary" onClick={handleAddEvent}>Add Event</button>
                </div>
            </div>

            {menus.length > 0 ? (
                menus.map(event => {
                    const expTotal = event.items?.reduce((sum, item) => sum + ((item.pricePerPlate || 0) * (event.expectedGuests || 0)), 0) || 0;
                    const actTotal = event.items?.reduce((sum, item) => sum + ((item.pricePerPlate || 0) * (event.attendedGuests || 0)), 0) || 0;
                    return (
                        <div key={event.id} className="card">
                            <div className="flex-between">
                                <div>
                                    <h3>{event.name}</h3>
                                    <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        Expected: {event.expectedGuests || 0} guests | Attended: {event.attendedGuests || 0} guests
                                    </div>
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
                                        <p><strong>Expected Total:</strong> {formatCurrency(expTotal)}</p>
                                        <p><strong>Actual Total:</strong> {formatCurrency(actTotal)}</p>
                                    </div>
                                </div>
                                <div>
                                    <button className="btn btn-outline btn-small" onClick={() => handleEditEvent(event)}>Edit Event</button>
                                    <button className="btn btn-danger btn-small" onClick={() => handleDeleteEvent(event.id)}>Delete Event</button>
                                </div>
                            </div>
                            <div style={{ marginTop: '16px' }}>
                                <div className="flex-between" style={{ marginBottom: '12px' }}>
                                    <strong>Menu Items</strong>
                                    <button className="btn btn-primary btn-small" onClick={() => handleAddItem(event.id)}>Add Item</button>
                                </div>
                                {event.items?.length > 0 ? (
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Item</th>
                                                    <th>Price Per Plate</th>
                                                    <th>Description</th>
                                                    <th>Expected Total</th>
                                                    <th>Actual Total</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {event.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td><strong>{item.name}</strong></td>
                                                        <td>{formatCurrency(item.pricePerPlate || 0)}</td>
                                                        <td style={{ fontSize: '12px', maxWidth: '200px' }}>{item.description || '-'}</td>
                                                        <td>{formatCurrency((item.pricePerPlate || 0) * (event.expectedGuests || 0))}</td>
                                                        <td>{formatCurrency((item.pricePerPlate || 0) * (event.attendedGuests || 0))}</td>
                                                        <td>
                                                            <button className="btn btn-danger btn-small" onClick={() => handleDeleteItem(event.id, idx)}>Delete</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">🍽️</div>
                                        <p>No menu items added</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🍽️</div>
                        <p>No events added</p>
                    </div>
                </div>
            )}

            {showEventModal && (
                <EventModal event={editingEvent} onSave={handleSaveEvent} onClose={() => { setShowEventModal(false); setEditingEvent(null); }} />
            )}
            {showItemModal && (
                <MenuItemModal item={editingItem} onSave={handleSaveItem} onClose={() => { setShowItemModal(false); setEditingItem(null); setCurrentEventId(null); }} />
            )}
        </div>
    );
};

const EventModal = ({ event, onSave, onClose }) => {
    const [formData, setFormData] = useState(event);
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{event.name ? 'Edit Event' : 'Add Event'}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Event Name *</label>
                        <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Expected Guests</label>
                        <input type="number" className="form-input" value={formData.expectedGuests} onChange={e => setFormData({ ...formData, expectedGuests: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Attended Guests</label>
                        <input type="number" className="form-input" value={formData.attendedGuests} onChange={e => setFormData({ ...formData, attendedGuests: parseInt(e.target.value) || 0 })} />
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

const MenuItemModal = ({ item, onSave, onClose }) => {
    const [formData, setFormData] = useState(item);
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">Add Menu Item</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Item Name *</label>
                        <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Paneer Tikka" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Price Per Plate (₹)</label>
                        <input type="number" className="form-input" value={formData.pricePerPlate} onChange={e => setFormData({ ...formData, pricePerPlate: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Menu item description" rows="3" />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => onSave(formData)} disabled={!formData.name}>Add</button>
                </div>
            </div>
        </div>
    );
};

