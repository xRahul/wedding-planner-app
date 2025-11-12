const { useState, useEffect, useMemo } = React;

// ==================== MENUS COMPONENT ====================

const Menus = ({ menus, updateData, budget }) => {
    const [showEventModal, setShowEventModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [currentEventId, setCurrentEventId] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const menuStats = useMemo(() => {
        const totalEvents = menus.length;
        const totalExpected = menus.reduce((sum, m) => sum + (m.expectedGuests || 0), 0);
        const totalAttended = menus.reduce((sum, m) => sum + (m.attendedGuests || 0), 0);
        const totalExpectedCost = menus.reduce((sum, m) => {
            return sum + (m.items?.reduce((s, i) => s + ((i.pricePerPlate || 0) * (m.expectedGuests || 0)), 0) || 0);
        }, 0);
        const totalActualCost = menus.reduce((sum, m) => {
            return sum + (m.items?.reduce((s, i) => s + ((i.pricePerPlate || 0) * (m.attendedGuests || 0)), 0) || 0);
        }, 0);
        const totalItems = menus.reduce((sum, m) => sum + (m.items?.length || 0), 0);
        const avgCostPerGuest = totalAttended > 0 ? totalActualCost / totalAttended : 0;
        const costVariance = totalExpectedCost > 0 ? ((totalActualCost - totalExpectedCost) / totalExpectedCost * 100) : 0;
        
        const byPayment = { bride: 0, groom: 0, split: 0, pending: 0 };
        menus.forEach(m => {
            m.items?.forEach(item => {
                const cost = (item.pricePerPlate || 0) * (m.attendedGuests || m.expectedGuests || 0);
                if (item.paymentResponsibility === 'bride') byPayment.bride += cost;
                else if (item.paymentResponsibility === 'groom') byPayment.groom += cost;
                else if (item.paymentResponsibility === 'split') byPayment.split += cost;
                else byPayment.pending += cost;
            });
        });
        
        const mostExpensiveEvent = menus.length > 0 ? menus.reduce((max, m) => {
            const cost = m.items?.reduce((s, i) => s + ((i.pricePerPlate || 0) * (m.attendedGuests || m.expectedGuests || 0)), 0) || 0;
            return cost > (max.cost || 0) ? { name: m.name, cost } : max;
        }, {}) : null;
        
        return { totalEvents, totalExpected, totalAttended, totalExpectedCost, totalActualCost, totalItems, avgCostPerGuest, costVariance, byPayment, mostExpensiveEvent };
    }, [menus]);

    const handleAddEvent = () => {
        setEditingEvent({ id: generateId(), name: '', expectedGuests: 0, attendedGuests: 0, items: [], budgetCategory: '' });
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
        setEditingItem({ name: '', pricePerPlate: 0, description: '', budgetCategory: '', itemIndex: null });
        setShowItemModal(true);
    };

    const handleEditItem = (eventId, itemIndex) => {
        const event = menus.find(m => m.id === eventId);
        if (event && event.items[itemIndex]) {
            setCurrentEventId(eventId);
            setEditingItem({ ...event.items[itemIndex], itemIndex });
            setShowItemModal(true);
        }
    };

    const handleSaveItem = (item) => {
        if (!item.name?.trim()) {
            alert('Item name is required.');
            return;
        }
        const updatedMenus = [...menus];
        const eventIdx = updatedMenus.findIndex(m => m.id === currentEventId);
        if (eventIdx >= 0) {
            if (item.itemIndex !== null && item.itemIndex !== undefined) {
                const { itemIndex, ...itemData } = item;
                updatedMenus[eventIdx].items[itemIndex] = itemData;
            } else {
                const { itemIndex, ...itemData } = item;
                updatedMenus[eventIdx].items.push(itemData);
            }
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
                    <h2 className="card-title">🍽️ Event Menus</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline btn-small" onClick={() => setShowAnalytics(!showAnalytics)}>
                            {showAnalytics ? '📊 Hide Analytics' : '📊 Show Analytics'}
                        </button>
                        <button className="btn btn-outline btn-small" onClick={() => {
                            const weddingEvents = [
                                { id: generateId(), name: 'Mehendi Function', expectedGuests: 0, attendedGuests: 0, items: [], budgetCategory: 'catering' },
                                { id: generateId(), name: 'Sangeet Night', expectedGuests: 0, attendedGuests: 0, items: [], budgetCategory: 'catering' },
                                { id: generateId(), name: 'Haldi Ceremony', expectedGuests: 0, attendedGuests: 0, items: [], budgetCategory: 'catering' },
                                { id: generateId(), name: 'Wedding Day Lunch', expectedGuests: 0, attendedGuests: 0, items: [], budgetCategory: 'catering' },
                                { id: generateId(), name: 'Wedding Day Dinner', expectedGuests: 0, attendedGuests: 0, items: [], budgetCategory: 'catering' },
                                { id: generateId(), name: 'Reception Party', expectedGuests: 0, attendedGuests: 0, items: [], budgetCategory: 'catering' }
                            ];
                            const updatedMenus = [...menus, ...weddingEvents];
                            updateData('menus', updatedMenus);
                        }}>Add Wedding Events</button>
                        <button className="btn btn-primary" onClick={handleAddEvent}>Add Custom Event</button>
                    </div>
                </div>
            </div>

            {showAnalytics && (
                <div className="card">
                    <h3>📊 Menu Analytics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{menuStats.totalEvents}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Events</div>
                        </div>
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{menuStats.totalItems}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Menu Items</div>
                        </div>
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{menuStats.totalExpected}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Expected Guests</div>
                        </div>
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{menuStats.totalAttended}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Attended Guests</div>
                        </div>
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(menuStats.avgCostPerGuest)}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Avg Cost/Guest</div>
                        </div>
                        <div style={{ padding: '12px', background: menuStats.costVariance > 10 ? 'rgba(220, 53, 69, 0.1)' : 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: menuStats.costVariance > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                                {menuStats.costVariance > 0 ? '+' : ''}{menuStats.costVariance.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Cost Variance</div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>💰 Cost Breakdown</h4>
                            <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Expected Total:</span>
                                    <strong>{formatCurrency(menuStats.totalExpectedCost)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Actual Total:</span>
                                    <strong style={{ color: menuStats.totalActualCost > menuStats.totalExpectedCost ? 'var(--color-error)' : 'var(--color-success)' }}>
                                        {formatCurrency(menuStats.totalActualCost)}
                                    </strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Difference:</span>
                                    <strong style={{ color: menuStats.totalActualCost > menuStats.totalExpectedCost ? 'var(--color-error)' : 'var(--color-success)' }}>
                                        {formatCurrency(menuStats.totalActualCost - menuStats.totalExpectedCost)}
                                    </strong>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>👰🤵 Payment Split</h4>
                            <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>👰 Bride:</span>
                                    <strong>{formatCurrency(menuStats.byPayment.bride)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>🤵 Groom:</span>
                                    <strong>{formatCurrency(menuStats.byPayment.groom)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>🤝 Split:</span>
                                    <strong>{formatCurrency(menuStats.byPayment.split)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>⏳ Pending:</span>
                                    <strong style={{ color: 'var(--color-warning)' }}>{formatCurrency(menuStats.byPayment.pending)}</strong>
                                </div>
                            </div>
                        </div>
                        
                        {menuStats.mostExpensiveEvent && (
                            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>🌟 Most Expensive Event</h4>
                                <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                                    <div><strong>{menuStats.mostExpensiveEvent.name}</strong></div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '8px' }}>
                                        {formatCurrency(menuStats.mostExpensiveEvent.cost)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {menus.length > 0 ? (
                menus.map(event => {
                    const expTotal = event.items?.reduce((sum, item) => sum + ((item.pricePerPlate || 0) * (event.expectedGuests || 0)), 0) || 0;
                    const actTotal = event.items?.reduce((sum, item) => sum + ((item.pricePerPlate || 0) * (event.attendedGuests || 0)), 0) || 0;
                    return (
                        <div key={event.id} className="card">
                            <div className="flex-between">
                                <div>
                                    <h3>
                                        {event.name}
                                        {event.budgetCategory && (
                                            <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '12px' }}>
                                                {event.budgetCategory.replace(/_/g, ' ')}
                                            </span>
                                        )}
                                    </h3>
                                    <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        Expected: {event.expectedGuests || 0} guests | Attended: {event.attendedGuests || 0} guests
                                    </div>
                                    <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                        <div style={{ padding: '8px', background: 'var(--color-bg-secondary)', borderRadius: '4px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Expected Total</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{formatCurrency(expTotal)}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                                                {event.expectedGuests > 0 ? formatCurrency(expTotal / event.expectedGuests) + ' per person' : ''}
                                            </div>
                                        </div>
                                        <div style={{ padding: '8px', background: 'var(--color-bg-secondary)', borderRadius: '4px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Actual Total</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-success)' }}>{formatCurrency(actTotal)}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                                                {event.attendedGuests > 0 ? formatCurrency(actTotal / event.attendedGuests) + ' per person' : ''}
                                            </div>
                                        </div>
                                        <div style={{ padding: '8px', background: 'var(--color-bg-secondary)', borderRadius: '4px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Items Count</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{event.items?.length || 0}</div>
                                        </div>
                                        <div style={{ padding: '8px', background: 'var(--color-bg-secondary)', borderRadius: '4px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Variance</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: actTotal > expTotal ? 'var(--color-error)' : 'var(--color-success)' }}>
                                                {expTotal > 0 ? ((actTotal - expTotal) / expTotal * 100).toFixed(1) + '%' : '0%'}
                                            </div>
                                        </div>
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
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button className="btn btn-outline btn-small" onClick={() => {
                                            const northIndianItems = [
                                                { name: 'Dal Makhani', pricePerPlate: 45, description: 'Rich black lentils in creamy gravy', budgetCategory: 'catering' },
                                                { name: 'Paneer Butter Masala', pricePerPlate: 65, description: 'Cottage cheese in tomato-butter gravy', budgetCategory: 'catering' },
                                                { name: 'Chicken Butter Masala', pricePerPlate: 85, description: 'Tender chicken in rich tomato gravy', budgetCategory: 'catering' },
                                                { name: 'Mutton Rogan Josh', pricePerPlate: 120, description: 'Aromatic lamb curry', budgetCategory: 'catering' },
                                                { name: 'Jeera Rice', pricePerPlate: 25, description: 'Cumin flavored basmati rice', budgetCategory: 'catering' },
                                                { name: 'Butter Naan', pricePerPlate: 15, description: 'Soft leavened bread with butter', budgetCategory: 'catering' },
                                                { name: 'Mixed Vegetable', pricePerPlate: 35, description: 'Seasonal vegetables curry', budgetCategory: 'catering' },
                                                { name: 'Raita', pricePerPlate: 20, description: 'Yogurt with cucumber and spices', budgetCategory: 'catering' },
                                                { name: 'Gulab Jamun', pricePerPlate: 25, description: 'Sweet milk dumplings in syrup', budgetCategory: 'catering' },
                                                { name: 'Kulfi', pricePerPlate: 30, description: 'Traditional Indian ice cream', budgetCategory: 'catering' }
                                            ];
                                            const updatedMenus = [...menus];
                                            const eventIdx = updatedMenus.findIndex(m => m.id === event.id);
                                            if (eventIdx >= 0) {
                                                updatedMenus[eventIdx].items = [...(updatedMenus[eventIdx].items || []), ...northIndianItems];
                                                updateData('menus', updatedMenus);
                                            }
                                        }}>Add North Indian Menu</button>
                                        <button className="btn btn-primary btn-small" onClick={() => handleAddItem(event.id)}>Add Custom Item</button>
                                    </div>
                                </div>
                                {event.items?.length > 0 ? (
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Item</th>
                                                    <th>Price Per Plate</th>
                                                    <th>Budget Category</th>
                                                    <th>Payment Responsibility</th>
                                                    <th>Paid By</th>
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
                                                        <td>
                                                            {item.budgetCategory ? (
                                                                <span className="badge badge-info">{item.budgetCategory.replace(/_/g, ' ')}</span>
                                                            ) : '-'}
                                                        </td>
                                                        <td>
                                                            {item.paymentResponsibility ? (
                                                                <span className={`badge ${item.paymentResponsibility === 'bride' ? 'badge-info' : item.paymentResponsibility === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                                    {item.paymentResponsibility === 'bride' ? '👰 Bride' : item.paymentResponsibility === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                        <td>
                                                            {item.paidBy && item.paidBy !== 'pending' ? (
                                                                <span className={`badge ${item.paidBy === 'bride' ? 'badge-info' : item.paidBy === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                                    {item.paidBy === 'bride' ? '👰 Bride' : item.paidBy === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                                </span>
                                                            ) : <span className="badge badge-error">Pending</span>}
                                                        </td>
                                                        <td style={{ fontSize: '12px', maxWidth: '200px' }}>{item.description || '-'}</td>
                                                        <td>{formatCurrency((item.pricePerPlate || 0) * (event.expectedGuests || 0))}</td>
                                                        <td>{formatCurrency((item.pricePerPlate || 0) * (event.attendedGuests || 0))}</td>
                                                        <td>
                                                            <button className="btn btn-outline btn-small" onClick={() => handleEditItem(event.id, idx)} style={{ marginRight: '4px' }}>Edit</button>
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
                <EventModal event={editingEvent} onSave={handleSaveEvent} onClose={() => { setShowEventModal(false); setEditingEvent(null); }} budget={budget} />
            )}
            {showItemModal && (
                <MenuItemModal item={editingItem} onSave={handleSaveItem} onClose={() => { setShowItemModal(false); setEditingItem(null); setCurrentEventId(null); }} budget={budget} />
            )}
        </div>
    );
};

const EventModal = ({ event, onSave, onClose, budget }) => {
    const [formData, setFormData] = useState(event);
    
    const budgetCategories = budget?.map(b => ({
        value: b.category,
        label: b.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    })) || [];
    
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
                        <label className="form-label">Budget Category</label>
                        <select className="form-select" value={formData.budgetCategory || ''} onChange={e => setFormData({ ...formData, budgetCategory: e.target.value })}>
                            <option value="">Select category (optional)</option>
                            {budgetCategories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
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

const MenuItemModal = ({ item, onSave, onClose, budget }) => {
    const [formData, setFormData] = useState(item);
    
    const budgetCategories = budget?.map(b => ({
        value: b.category,
        label: b.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    })) || [];
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{item.itemIndex !== null && item.itemIndex !== undefined ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
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
                        <label className="form-label">Budget Category</label>
                        <select className="form-select" value={formData.budgetCategory || ''} onChange={e => setFormData({ ...formData, budgetCategory: e.target.value })}>
                            <option value="">Select category (optional)</option>
                            {budgetCategories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Payment Responsibility</label>
                        <select className="form-select" value={formData.paymentResponsibility || ''} onChange={e => setFormData({ ...formData, paymentResponsibility: e.target.value })}>
                            <option value="">-- Select --</option>
                            <option value="bride">👰 Bride Side</option>
                            <option value="groom">🤵 Groom Side</option>
                            <option value="split">🤝 Split (Both)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Paid By</label>
                        <select className="form-select" value={formData.paidBy || 'pending'} onChange={e => setFormData({ ...formData, paidBy: e.target.value })}>
                            <option value="pending">Pending</option>
                            <option value="bride">👰 Bride Side</option>
                            <option value="groom">🤵 Groom Side</option>
                            <option value="split">🤝 Split (Both)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Menu item description" rows="3" />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => onSave(formData)} disabled={!formData.name}>
                        {formData.itemIndex !== null && formData.itemIndex !== undefined ? 'Save' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

