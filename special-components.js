const { useState, useEffect, useMemo } = React;
// ==================== TRAVEL COMPONENT ====================

        const Travel = ({ travel, updateData }) => {
            const [showModal, setShowModal] = useState(false);
            const [editingItem, setEditingItem] = useState(null);

            const handleAddTransport = () => {
                setEditingItem({ 
                    id: generateId(),
                    vehicleType: 'bus', 
                    vehicleName: '',
                    fromDate: '', 
                    toDate: '',
                    seats: 0,
                    totalPrice: 0,
                    kilometers: 0,
                    route: '',
                    driverName: '',
                    driverContact: '',
                    notes: ''
                });
                setShowModal(true);
            };

            const handleEdit = (item) => {
                setEditingItem({ ...item });
                setShowModal(true);
            };

            const handleSave = (item) => {
                try {
                    const errors = validateTravelItem(item);
                    if (errors) {
                        const errorMsg = Object.entries(errors).map(([field, msg]) => `${field}: ${msg}`).join('\n');
                        alert(`Please fix the following errors:\n\n${errorMsg}`);
                        return;
                    }

                    const updatedTravel = { ...travel };
                    const transportList = [...(updatedTravel.transport || [])];
                    
                    const index = transportList.findIndex(t => t.id === item.id);
                    if (index >= 0) {
                        transportList[index] = item;
                    } else {
                        transportList.push(item);
                    }
                    
                    updatedTravel.transport = transportList;
                    updateData('travel', updatedTravel);
                    setShowModal(false);
                    setEditingItem(null);
                } catch (error) {
                    console.error('Error saving transport:', error);
                    alert(`Failed to save transport: ${error.message}`);
                }
            };

            const handleDeleteTransport = (id) => {
                if (confirm('Delete this transport arrangement?')) {
                    const updatedTravel = { ...travel };
                    updatedTravel.transport = updatedTravel.transport.filter(t => t.id !== id);
                    updateData('travel', updatedTravel);
                }
            };

            const totalCost = useMemo(() => {
                return (travel.transport || []).reduce((sum, t) => sum + (t.totalPrice || 0), 0);
            }, [travel.transport]);

            const totalKilometers = useMemo(() => {
                return (travel.transport || []).reduce((sum, t) => sum + (t.kilometers || 0), 0);
            }, [travel.transport]);

            return (
                <div>
                    <div className="card">
                        <div className="flex-between">
                            <h2 className="card-title">🚌 Transport Arrangements</h2>
                            <button className="btn btn-primary" onClick={handleAddTransport}>Add Transport</button>
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', gap: '24px' }}>
                            <p><strong>Total Cost:</strong> {formatCurrency(totalCost)}</p>
                            <p><strong>Total Kilometers:</strong> {totalKilometers} km</p>
                            <p><strong>Total Vehicles:</strong> {(travel.transport || []).length}</p>
                        </div>
                    </div>

                    <div className="card">
                        {travel.transport && travel.transport.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Vehicle Type</th>
                                            <th>Vehicle Name</th>
                                            <th>From Date</th>
                                            <th>To Date</th>
                                            <th>Seats</th>
                                            <th>Total Price</th>
                                            <th>Kilometers</th>
                                            <th>Route</th>
                                            <th>Driver</th>
                                            <th>Contact</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {travel.transport.map((trans) => (
                                            <tr key={trans.id}>
                                                <td>
                                                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                                                        {trans.vehicleType === 'bus' ? '🚌 Bus' : trans.vehicleType === 'car' ? '🚗 Car' : trans.vehicleType === 'van' ? '🚐 Van' : '🚕 ' + trans.vehicleType}
                                                    </span>
                                                </td>
                                                <td><strong>{trans.vehicleName || '-'}</strong></td>
                                                <td>{formatDate(trans.fromDate)}</td>
                                                <td>{formatDate(trans.toDate)}</td>
                                                <td style={{ textAlign: 'center' }}>{trans.seats}</td>
                                                <td style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>{formatCurrency(trans.totalPrice || 0)}</td>
                                                <td style={{ textAlign: 'center' }}>{trans.kilometers || 0} km</td>
                                                <td style={{ fontSize: '12px', maxWidth: '150px' }}>{trans.route || '-'}</td>
                                                <td>{trans.driverName || '-'}</td>
                                                <td style={{ fontSize: '11px' }}>{trans.driverContact || '-'}</td>
                                                <td style={{ fontSize: '11px', maxWidth: '120px' }}>{trans.notes || '-'}</td>
                                                <td>
                                                    <button className="btn btn-outline btn-small" onClick={() => handleEdit(trans)}>Edit</button>
                                                    <button className="btn btn-danger btn-small" onClick={() => handleDeleteTransport(trans.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🚌</div>
                                <p>No transport arrangements added</p>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Add buses, cars, vans for guest transportation</p>
                            </div>
                        )}
                    </div>

                    {showModal && (
                        <TravelModal
                            item={editingItem}
                            onSave={handleSave}
                            onClose={() => { setShowModal(false); setEditingItem(null); }}
                        />
                    )}
                </div>
            );
        };

        const TravelModal = ({ item, onSave, onClose }) => {
            const [formData, setFormData] = useState(item);

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{item.vehicleName ? 'Edit Transport' : 'Add Transport'}</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Vehicle Type *</label>
                                <select 
                                    className="form-select"
                                    value={formData.vehicleType}
                                    onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                                >
                                    <option value="bus">Bus</option>
                                    <option value="car">Car</option>
                                    <option value="van">Van</option>
                                    <option value="tempo_traveller">Tempo Traveller</option>
                                    <option value="luxury_coach">Luxury Coach</option>
                                    <option value="suv">SUV</option>
                                    <option value="sedan">Sedan</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Vehicle Name/Number</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.vehicleName}
                                    onChange={e => setFormData({ ...formData, vehicleName: e.target.value })}
                                    placeholder="e.g., DL-01-AB-1234, Volvo AC Bus"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">From Date *</label>
                                <input 
                                    type="date"
                                    className="form-input"
                                    value={formData.fromDate}
                                    onChange={e => setFormData({ ...formData, fromDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">To Date *</label>
                                <input 
                                    type="date"
                                    className="form-input"
                                    value={formData.toDate}
                                    onChange={e => setFormData({ ...formData, toDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Number of Seats *</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={formData.seats}
                                    onChange={e => setFormData({ ...formData, seats: parseInt(e.target.value) || 0 })}
                                    placeholder="e.g., 45, 7, 4"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Total Booking Price (₹)</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={formData.totalPrice}
                                    onChange={e => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
                                    placeholder="Total cost for the booking"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Total Kilometers</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={formData.kilometers}
                                    onChange={e => setFormData({ ...formData, kilometers: parseFloat(e.target.value) || 0 })}
                                    placeholder="Total distance to be covered"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Route</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.route}
                                    onChange={e => setFormData({ ...formData, route: e.target.value })}
                                    placeholder="e.g., Delhi to Jaipur via NH-48"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Driver Name</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.driverName}
                                    onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                                    placeholder="Driver's name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Driver Contact</label>
                                <input 
                                    type="tel"
                                    className="form-input"
                                    value={formData.driverContact}
                                    onChange={e => setFormData({ ...formData, driverContact: e.target.value })}
                                    placeholder="Driver's phone number"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea 
                                    className="form-textarea"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional notes, pickup points, timings, etc."
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => onSave(formData)}
                                disabled={!formData.vehicleType || !formData.fromDate || !formData.toDate || !formData.seats}
                            >
                                Save Transport
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== SHOPPING COMPONENT ====================

        const Shopping = ({ shopping, updateData }) => {
            const [activeCategory, setActiveCategory] = useState('bride');
            const [showModal, setShowModal] = useState(false);
            const [editingItem, setEditingItem] = useState(null);
            const [editingEvent, setEditingEvent] = useState(null);

            const handleAddItem = (category, event) => {
                setEditingItem(null);
                setEditingEvent(event);
                setActiveCategory(category);
                setShowModal(true);
            };

            const handleEditItem = (item, category, event) => {
                setEditingItem(item);
                setEditingEvent(event);
                setActiveCategory(category);
                setShowModal(true);
            };

            const handleSave = (item) => {
                try {
                    if (!item.item?.trim()) {
                        alert('Item name is required.');
                        return;
                    }

                    const newShopping = { ...shopping };
                    const categoryItems = newShopping[activeCategory].find(e => e.event === editingEvent);
                    
                    if (!categoryItems) {
                        alert(`Event "${editingEvent}" not found in ${activeCategory} category.`);
                        return;
                    }

                    if (editingItem) {
                        const index = categoryItems.items.findIndex(i => i.item === editingItem.item);
                        if (index >= 0) {
                            categoryItems.items[index] = item;
                        } else {
                            alert('Original item not found. Adding as new item.');
                            categoryItems.items.push(item);
                        }
                    } else {
                        categoryItems.items.push(item);
                    }
                    
                    updateData('shopping', newShopping);
                    setShowModal(false);
                } catch (error) {
                    console.error('Error saving shopping item:', error);
                    alert(`Failed to save shopping item: ${error.message}`);
                }
            };

            const totalBudget = Object.values(shopping).reduce((sum, category) => 
                sum + category.reduce((catSum, event) => 
                    catSum + event.items.reduce((eventSum, item) => eventSum + (item.budget || 0), 0), 0), 0);

            return (
                <div>
                    <div className="card">
                        <h2 className="card-title">Shopping List</h2>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <button 
                                className={`btn ${activeCategory === 'bride' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveCategory('bride')}
                            >
                                👰 Bride
                            </button>
                            <button 
                                className={`btn ${activeCategory === 'groom' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveCategory('groom')}
                            >
                                🤵 Groom
                            </button>
                            <button 
                                className={`btn ${activeCategory === 'family' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveCategory('family')}
                            >
                                👨‍👩‍👧‍👦 Family
                            </button>
                        </div>
                        <p><strong>Total Budget:</strong> {formatCurrency(totalBudget)}</p>
                    </div>

                    {shopping[activeCategory].map(event => (
                        <div key={event.event} className="card">
                            <div className="flex-between">
                                <h3>{event.event}</h3>
                                <button 
                                    className="btn btn-primary btn-small"
                                    onClick={() => handleAddItem(activeCategory, event.event)}
                                >
                                    Add Item
                                </button>
                            </div>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Budget</th>
                                            <th>Status</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {event.items.map(item => (
                                            <tr key={item.item}>
                                                <td>{item.item}</td>
                                                <td>{formatCurrency(item.budget)}</td>
                                                <td>
                                                    <span className={`badge badge-${item.status === 'completed' ? 'success' : item.status === 'pending' ? 'warning' : 'info'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td>{item.notes}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-outline btn-small"
                                                        onClick={() => handleEditItem(item, activeCategory, event.event)}
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {showModal && (
                        <ShoppingItemModal
                            item={editingItem}
                            onSave={handleSave}
                            onClose={() => setShowModal(false)}
                            category={activeCategory}
                        />
                    )}
                </div>
            );
        };

        const ShoppingItemModal = ({ item, onSave, onClose, category }) => {
            const [formData, setFormData] = useState(item || {
                item: '',
                budget: 0,
                status: 'pending',
                notes: ''
            });

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{item ? 'Edit Item' : 'Add Item'}</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Item Name *</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.item}
                                    onChange={e => setFormData({ ...formData, item: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Budget</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="ordered">Ordered</option>
                                    <option value="received">Received</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary"
                                onClick={() => onSave(formData)}
                                disabled={!formData.item}
                            >
                                Save Item
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== RITUALS COMPONENT ====================

        const Rituals = ({ ritualsAndCustoms, traditions, updateData }) => {
            const [activeTab, setActiveTab] = useState('pre');
            const [showModal, setShowModal] = useState(false);
            const [editingItem, setEditingItem] = useState(null);

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
                        <h2 className="card-title">🪔 Rituals & Customs</h2>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button className={`btn ${activeTab === 'pre' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('pre')}>Pre-Wedding</button>
                            <button className={`btn ${activeTab === 'main' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('main')}>Main Ceremonies</button>
                            <button className={`btn ${activeTab === 'customs' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('customs')}>Customs</button>
                            <button className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('items')}>Ritual Items</button>
                        </div>
                    </div>

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

        // ==================== GIFTS COMPONENT ====================

        const Gifts = ({ giftsAndFavors, updateData }) => {
            const [activeTab, setActiveTab] = useState('family');
            const [showModal, setShowModal] = useState(false);
            const [editingItem, setEditingItem] = useState(null);

            const handleAdd = (category) => {
                setEditingItem({ 
                    id: generateId(),
                    category, 
                    event: '', 
                    giftName: '', 
                    recipient: '', 
                    quantity: 1, 
                    pricePerGift: 0, 
                    totalCost: 0,
                    status: 'pending', 
                    purchasedFrom: '',
                    notes: '' 
                });
                setShowModal(true);
            };

            const handleEdit = (item, category) => {
                setEditingItem({ ...item, category });
                setShowModal(true);
            };

            const handleSave = (item) => {
                if (!item.giftName?.trim()) {
                    alert('Gift name is required.');
                    return;
                }
                const updated = { ...giftsAndFavors };
                const key = item.category === 'family' ? 'familyGifts' : item.category === 'return' ? 'returnGifts' : 'specialGifts';
                const list = [...(updated[key] || [])];
                const idx = list.findIndex(i => i.id === item.id);
                if (idx >= 0) list[idx] = item;
                else list.push(item);
                updated[key] = list;
                updateData('giftsAndFavors', updated);
                setShowModal(false);
                setEditingItem(null);
            };

            const handleDelete = (item, category) => {
                if (confirm(`Delete ${item.giftName}?`)) {
                    const updated = { ...giftsAndFavors };
                    const key = category === 'family' ? 'familyGifts' : category === 'return' ? 'returnGifts' : 'specialGifts';
                    updated[key] = updated[key].filter(i => i.id !== item.id);
                    updateData('giftsAndFavors', updated);
                }
            };

            const calculateTotals = (category) => {
                const key = category === 'family' ? 'familyGifts' : category === 'return' ? 'returnGifts' : 'specialGifts';
                const items = giftsAndFavors[key] || [];
                return {
                    totalItems: items.length,
                    totalQuantity: items.reduce((sum, i) => sum + (i.quantity || 0), 0),
                    totalCost: items.reduce((sum, i) => sum + (i.totalCost || 0), 0),
                    purchased: items.filter(i => i.status === 'purchased').length
                };
            };

            return (
                <div>
                    <div className="card">
                        <h2 className="card-title">🎁 Gifts & Favors</h2>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <button 
                                className={`btn ${activeTab === 'family' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab('family')}
                            >
                                👨‍👩‍👧‍👦 Family Gifts
                            </button>
                            <button 
                                className={`btn ${activeTab === 'return' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab('return')}
                            >
                                🎀 Return Gifts
                            </button>
                            <button 
                                className={`btn ${activeTab === 'special' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab('special')}
                            >
                                💝 Special Gifts
                            </button>
                        </div>
                    </div>

                    {activeTab === 'family' && (
                        <div className="card">
                            <div className="flex-between">
                                <div>
                                    <h3>Family Gifts</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        Gifts for family members during various wedding events (Shagun, Tilak, Mehendi, etc.)
                                    </p>
                                </div>
                                <button className="btn btn-primary btn-small" onClick={() => handleAdd('family')}>Add Gift</button>
                            </div>
                            {(() => {
                                const totals = calculateTotals('family');
                                return (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.totalItems}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Items</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.totalQuantity}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Quantity</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(totals.totalCost)}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Cost</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.purchased}/{totals.totalItems}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Purchased</div>
                                        </div>
                                    </div>
                                );
                            })()}
                            {giftsAndFavors.familyGifts?.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Event</th>
                                                <th>Gift Name</th>
                                                <th>Recipient</th>
                                                <th>Quantity</th>
                                                <th>Price/Gift</th>
                                                <th>Total Cost</th>
                                                <th>Status</th>
                                                <th>Purchased From</th>
                                                <th>Notes</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {giftsAndFavors.familyGifts.map((gift) => (
                                                <tr key={gift.id}>
                                                    <td><span className="badge badge-info">{gift.event || '-'}</span></td>
                                                    <td><strong>{gift.giftName}</strong></td>
                                                    <td>{gift.recipient || '-'}</td>
                                                    <td style={{ textAlign: 'center' }}>{gift.quantity}</td>
                                                    <td>{formatCurrency(gift.pricePerGift || 0)}</td>
                                                    <td><strong>{formatCurrency(gift.totalCost || 0)}</strong></td>
                                                    <td>
                                                        <span className={`badge ${gift.status === 'purchased' ? 'badge-success' : gift.status === 'ordered' ? 'badge-info' : 'badge-warning'}`}>
                                                            {gift.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '12px' }}>{gift.purchasedFrom || '-'}</td>
                                                    <td style={{ fontSize: '12px', maxWidth: '150px' }}>{gift.notes || '-'}</td>
                                                    <td>
                                                        <button className="btn btn-outline btn-small" onClick={() => handleEdit(gift, 'family')}>Edit</button>
                                                        <button className="btn btn-danger btn-small" onClick={() => handleDelete(gift, 'family')}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state"><div className="empty-state-icon">🎁</div><p>No family gifts added</p></div>
                            )}
                        </div>
                    )}

                    {activeTab === 'return' && (
                        <div className="card">
                            <div className="flex-between">
                                <div>
                                    <h3>Return Gifts</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        Return gifts for guests (Dry fruits boxes, sweets, decorative items, etc.)
                                    </p>
                                </div>
                                <button className="btn btn-primary btn-small" onClick={() => handleAdd('return')}>Add Gift</button>
                            </div>
                            {(() => {
                                const totals = calculateTotals('return');
                                return (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.totalItems}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Items</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.totalQuantity}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Quantity</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(totals.totalCost)}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Cost</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.purchased}/{totals.totalItems}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Purchased</div>
                                        </div>
                                    </div>
                                );
                            })()}
                            {giftsAndFavors.returnGifts?.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Event</th>
                                                <th>Gift Name</th>
                                                <th>Recipient</th>
                                                <th>Quantity</th>
                                                <th>Price/Gift</th>
                                                <th>Total Cost</th>
                                                <th>Status</th>
                                                <th>Purchased From</th>
                                                <th>Notes</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {giftsAndFavors.returnGifts.map((gift) => (
                                                <tr key={gift.id}>
                                                    <td><span className="badge badge-info">{gift.event || '-'}</span></td>
                                                    <td><strong>{gift.giftName}</strong></td>
                                                    <td>{gift.recipient || '-'}</td>
                                                    <td style={{ textAlign: 'center' }}>{gift.quantity}</td>
                                                    <td>{formatCurrency(gift.pricePerGift || 0)}</td>
                                                    <td><strong>{formatCurrency(gift.totalCost || 0)}</strong></td>
                                                    <td>
                                                        <span className={`badge ${gift.status === 'purchased' ? 'badge-success' : gift.status === 'ordered' ? 'badge-info' : 'badge-warning'}`}>
                                                            {gift.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '12px' }}>{gift.purchasedFrom || '-'}</td>
                                                    <td style={{ fontSize: '12px', maxWidth: '150px' }}>{gift.notes || '-'}</td>
                                                    <td>
                                                        <button className="btn btn-outline btn-small" onClick={() => handleEdit(gift, 'return')}>Edit</button>
                                                        <button className="btn btn-danger btn-small" onClick={() => handleDelete(gift, 'return')}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state"><div className="empty-state-icon">🎀</div><p>No return gifts added</p></div>
                            )}
                        </div>
                    )}

                    {activeTab === 'special' && (
                        <div className="card">
                            <div className="flex-between">
                                <div>
                                    <h3>Special Gifts</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        Special gifts for bride, groom, and VIP guests (Jewelry, watches, special items)
                                    </p>
                                </div>
                                <button className="btn btn-primary btn-small" onClick={() => handleAdd('special')}>Add Gift</button>
                            </div>
                            {(() => {
                                const totals = calculateTotals('special');
                                return (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.totalItems}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Items</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.totalQuantity}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Quantity</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(totals.totalCost)}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Cost</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.purchased}/{totals.totalItems}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Purchased</div>
                                        </div>
                                    </div>
                                );
                            })()}
                            {giftsAndFavors.specialGifts?.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Event</th>
                                                <th>Gift Name</th>
                                                <th>Recipient</th>
                                                <th>Quantity</th>
                                                <th>Price/Gift</th>
                                                <th>Total Cost</th>
                                                <th>Status</th>
                                                <th>Purchased From</th>
                                                <th>Notes</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {giftsAndFavors.specialGifts.map((gift) => (
                                                <tr key={gift.id}>
                                                    <td><span className="badge badge-info">{gift.event || '-'}</span></td>
                                                    <td><strong>{gift.giftName}</strong></td>
                                                    <td>{gift.recipient || '-'}</td>
                                                    <td style={{ textAlign: 'center' }}>{gift.quantity}</td>
                                                    <td>{formatCurrency(gift.pricePerGift || 0)}</td>
                                                    <td><strong>{formatCurrency(gift.totalCost || 0)}</strong></td>
                                                    <td>
                                                        <span className={`badge ${gift.status === 'purchased' ? 'badge-success' : gift.status === 'ordered' ? 'badge-info' : 'badge-warning'}`}>
                                                            {gift.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '12px' }}>{gift.purchasedFrom || '-'}</td>
                                                    <td style={{ fontSize: '12px', maxWidth: '150px' }}>{gift.notes || '-'}</td>
                                                    <td>
                                                        <button className="btn btn-outline btn-small" onClick={() => handleEdit(gift, 'special')}>Edit</button>
                                                        <button className="btn btn-danger btn-small" onClick={() => handleDelete(gift, 'special')}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state"><div className="empty-state-icon">💝</div><p>No special gifts added</p></div>
                            )}
                        </div>
                    )}

                    {showModal && <GiftModal item={editingItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditingItem(null); }} />}
                </div>
            );
        };

        const GiftModal = ({ item, onSave, onClose }) => {
            const [formData, setFormData] = useState(item);

            const northIndianEvents = [
                'Roka', 'Sagan', 'Tilak', 'Ring Ceremony',
                'Mehendi', 'Sangeet', 'Haldi', 
                'Ganesh Puja', 'Kalash Sthapna', 'Mandap Muhurat',
                'Baraat', 'Jaimala', 'Pheras', 'Vidai', 
                'Reception', 'Grih Pravesh', 'Pag Phera'
            ];

            const commonGiftsByCategory = {
                family: [
                    'Shagun Envelope', 'Gold/Silver Coins', 'Jewelry Set', 'Saree/Suit',
                    'Sherwani/Kurta', 'Watch', 'Dry Fruits Box', 'Sweets Box',
                    'Coconut with Supari', 'Chunri with Shagun', 'Paan Supari Set'
                ],
                return: [
                    'Dry Fruits Box', 'Sweets Box', 'Decorative Diyas', 'Photo Frame',
                    'Scented Candles', 'Chocolate Box', 'Brass Items', 'Silver Plated Items',
                    'Personalized Mugs', 'Plant Saplings', 'Eco-friendly Bags'
                ],
                special: [
                    'Gold Jewelry', 'Diamond Jewelry', 'Luxury Watch', 'Designer Saree',
                    'Designer Sherwani', 'Car', 'Property Documents', 'Cash/Cheque',
                    'Electronics', 'Furniture', 'Home Appliances'
                ]
            };

            const handleQuantityChange = (qty) => {
                const quantity = parseInt(qty) || 0;
                const totalCost = quantity * (formData.pricePerGift || 0);
                setFormData({ ...formData, quantity, totalCost });
            };

            const handlePriceChange = (price) => {
                const pricePerGift = parseFloat(price) || 0;
                const totalCost = (formData.quantity || 0) * pricePerGift;
                setFormData({ ...formData, pricePerGift, totalCost });
            };

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{item.giftName ? 'Edit Gift' : 'Add Gift'}</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <SelectOrAddField
                                label="Event"
                                value={formData.event}
                                onChange={(val) => setFormData({ ...formData, event: val })}
                                options={northIndianEvents}
                                placeholder="Enter custom event"
                            />
                            <SelectOrAddField
                                label="Gift Name *"
                                value={formData.giftName}
                                onChange={(val) => setFormData({ ...formData, giftName: val })}
                                options={commonGiftsByCategory[formData.category] || []}
                                placeholder="Enter gift name"
                            />
                            <div className="form-group">
                                <label className="form-label">Recipient</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.recipient}
                                    onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                                    placeholder="e.g., Maternal Uncle, All Guests, Bride's Mother"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Quantity *</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={formData.quantity}
                                    onChange={e => handleQuantityChange(e.target.value)}
                                    min="1"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price Per Gift (₹) *</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={formData.pricePerGift}
                                    onChange={e => handlePriceChange(e.target.value)}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Total Cost (₹)</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={formData.totalCost}
                                    readOnly
                                    style={{ background: 'var(--color-bg-secondary)', fontWeight: 'bold' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select 
                                    className="form-select"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="ordered">Ordered</option>
                                    <option value="purchased">Purchased</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Purchased From</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.purchasedFrom}
                                    onChange={e => setFormData({ ...formData, purchasedFrom: e.target.value })}
                                    placeholder="Store name or vendor"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea 
                                    className="form-textarea"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional notes or specifications"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => onSave(formData)} 
                                disabled={!formData.giftName}
                            >
                                Save Gift
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== SETTINGS COMPONENT ====================

        const Settings = ({ weddingInfo, updateData, allData, setData }) => {
            const [editMode, setEditMode] = useState(false);
            const [formData, setFormData] = useState(weddingInfo);



            const [formErrors, setFormErrors] = useState({});

            const handleSave = () => {
                const errors = validateWeddingInfo(formData);
                if (errors) {
                    setFormErrors(errors);
                    return;
                }
                updateData('weddingInfo', formData);
                setEditMode(false);
                setFormErrors({});
            };

            const handleExport = () => {
                try {
                    if (!allData || typeof allData !== 'object') {
                        alert('No data available to export.');
                        return;
                    }

                    const dataStr = JSON.stringify(allData, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `wedding-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                } catch (error) {
                    console.error('Export error:', error);
                    alert(`Failed to export data: ${error.message}`);
                }
            };

            const handleImport = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                if (!file.name.endsWith('.json')) {
                    alert('Please select a valid JSON file.');
                    event.target.value = '';
                    return;
                }

                if (!confirm('This will replace all current data. Are you sure?')) {
                    event.target.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        
                        // Validate imported data structure
                        const requiredKeys = ['weddingInfo', 'timeline', 'guests', 'vendors', 'budget', 'tasks', 'menus', 'travel'];
                        const missingKeys = requiredKeys.filter(key => !importedData[key]);
                        
                        if (missingKeys.length > 0) {
                            alert(`Invalid data file. Missing required fields: ${missingKeys.join(', ')}`);
                            event.target.value = '';
                            return;
                        }

                        await saveData(importedData);
                        setData(importedData);
                        setFormData(importedData.weddingInfo);
                        alert('Data imported successfully!');
                    } catch (error) {
                        if (error instanceof SyntaxError) {
                            alert('Invalid JSON file. Please check the file format.');
                        } else {
                            alert(`Error importing data: ${error.message}`);
                        }
                        console.error('Import error:', error);
                    }
                    event.target.value = '';
                };
                reader.onerror = () => {
                    alert('Failed to read file. Please try again.');
                    event.target.value = '';
                };
                reader.readAsText(file);
            };

            const handleReset = async () => {
                if (confirm('This will reset all data to default values. This action cannot be undone. Are you sure?')) {
                    const resetData = { ...DEFAULT_DATA };
                    await saveData(resetData);
                    setData(resetData);
                    setFormData(resetData.weddingInfo);
                    alert('Data has been reset to defaults.');
                }
            };

            return (
                <div>
                    <div className="card">
                        <h2 className="card-title">Wedding Information</h2>
                        {!editMode ? (
                            <>
                                <div className="grid-2" style={{ marginBottom: '16px' }}>
                                    <div>
                                        <p><strong>Bride's Name:</strong> {weddingInfo.brideName}</p>
                                        <p><strong>Groom's Name:</strong> {weddingInfo.groomName}</p>
                                    </div>
                                    <div>
                                        <p><strong>Wedding Date:</strong> {formatDate(weddingInfo.weddingDate)}</p>
                                        <p><strong>Location:</strong> {weddingInfo.location}</p>
                                        <p><strong>Total Budget:</strong> {formatCurrency(weddingInfo.totalBudget)}</p>
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Information</button>
                            </>
                        ) : (
                            <>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Bride's Name</label>
                                        <input 
                                            type="text"
                                            className={`form-input ${formErrors.brideName ? 'error' : ''}`}
                                            value={formData.brideName}
                                            onChange={e => {
                                                setFormData({ ...formData, brideName: e.target.value });
                                                if (formErrors.brideName) {
                                                    setFormErrors({ ...formErrors, brideName: null });
                                                }
                                            }}
                                        />
                                        {formErrors.brideName && <div className="error-message">{formErrors.brideName}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Groom's Name</label>
                                        <input 
                                            type="text"
                                            className={`form-input ${formErrors.groomName ? 'error' : ''}`}
                                            value={formData.groomName}
                                            onChange={e => {
                                                setFormData({ ...formData, groomName: e.target.value });
                                                if (formErrors.groomName) {
                                                    setFormErrors({ ...formErrors, groomName: null });
                                                }
                                            }}
                                        />
                                        {formErrors.groomName && <div className="error-message">{formErrors.groomName}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Wedding Date</label>
                                        <input 
                                            type="date"
                                            className={`form-input ${formErrors.weddingDate ? 'error' : ''}`}
                                            value={formData.weddingDate}
                                            onChange={e => {
                                                setFormData({ ...formData, weddingDate: e.target.value });
                                                if (formErrors.weddingDate) {
                                                    setFormErrors({ ...formErrors, weddingDate: null });
                                                }
                                            }}
                                        />
                                        {formErrors.weddingDate && <div className="error-message">{formErrors.weddingDate}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input 
                                            type="text"
                                            className={`form-input ${formErrors.location ? 'error' : ''}`}
                                            value={formData.location}
                                            onChange={e => {
                                                setFormData({ ...formData, location: e.target.value });
                                                if (formErrors.location) {
                                                    setFormErrors({ ...formErrors, location: null });
                                                }
                                            }}
                                        />
                                        {formErrors.location && <div className="error-message">{formErrors.location}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Total Budget (₹)</label>
                                        <input 
                                            type="number"
                                            className={`form-input ${formErrors.totalBudget ? 'error' : ''}`}
                                            value={formData.totalBudget}
                                            onChange={e => {
                                                setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 });
                                                if (formErrors.totalBudget) {
                                                    setFormErrors({ ...formErrors, totalBudget: null });
                                                }
                                            }}
                                        />
                                        {formErrors.totalBudget && <div className="error-message">{formErrors.totalBudget}</div>}
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                                    <button className="btn btn-outline" onClick={() => { setEditMode(false); setFormData(weddingInfo); }}>Cancel</button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="card">
                        <h2 className="card-title">Data Management</h2>
                        <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                            Export all your wedding data as a JSON backup file, or import previously saved data.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button className="btn btn-success" onClick={handleExport} style={{ flex: '1', minWidth: '200px' }}>
                                📥 Export All Data
                            </button>
                            <label className="btn btn-primary" style={{ cursor: 'pointer', flex: '1', minWidth: '200px' }}>
                                📤 Import All Data
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    onChange={handleImport}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <button className="btn btn-danger" onClick={handleReset}>
                                🔄 Reset to Default Data
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="card-title">About This App</h2>
                        <p style={{ marginBottom: '8px' }}>
                            <strong>Wedding Planner</strong> - A complete wedding management solution
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            This application stores all data in memory during your session. 
                            Make sure to export your data regularly as a backup to save your progress. 
                            Use the Export/Import feature to backup and restore your data.
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                            <strong>Features:</strong> Dashboard, Timeline Management, Guest List, Vendor Management, 
                            Budget Tracking, Tasks Checklist, Event Menus, Travel &amp; Accommodations, Data Export/Import
                        </p>
                    </div>
                </div>
            );
        };

