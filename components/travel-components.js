const { useState, useEffect, useMemo } = React;
// ==================== TRAVEL COMPONENT ====================

        const Travel = ({ travel, updateData, budget }) => {
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
                    notes: '',
                    budgetCategory: ''
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Cost</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(totalCost)}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Distance</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totalKilometers} km</div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Vehicles</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{(travel.transport || []).length}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Seats</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{(travel.transport || []).reduce((sum, t) => sum + (t.seats || 0), 0)}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Cost per KM</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                    {totalKilometers > 0 ? formatCurrency(totalCost / totalKilometers) : formatCurrency(0)}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Cost per Seat</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                    {(travel.transport || []).reduce((sum, t) => sum + (t.seats || 0), 0) > 0 ? 
                                        formatCurrency(totalCost / (travel.transport || []).reduce((sum, t) => sum + (t.seats || 0), 0)) : 
                                        formatCurrency(0)
                                    }
                                </div>
                            </div>
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
                                            <th>Budget Category</th>
                                            <th>Payment Responsibility</th>
                                            <th>Paid By</th>
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
                                                <td>
                                                    {trans.budgetCategory ? (
                                                        <span className="badge badge-info">{trans.budgetCategory.replace(/_/g, ' ')}</span>
                                                    ) : '-'}
                                                </td>
                                                <td>
                                                    {trans.paymentResponsibility ? (
                                                        <span className={`badge ${trans.paymentResponsibility === 'bride' ? 'badge-info' : trans.paymentResponsibility === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                            {trans.paymentResponsibility === 'bride' ? '👰 Bride' : trans.paymentResponsibility === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td>
                                                    {trans.paidBy && trans.paidBy !== 'pending' ? (
                                                        <span className={`badge ${trans.paidBy === 'bride' ? 'badge-info' : trans.paidBy === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                            {trans.paidBy === 'bride' ? '👰 Bride' : trans.paidBy === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                        </span>
                                                    ) : <span className="badge badge-error">Pending</span>}
                                                </td>
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
                                <div style={{ marginTop: '16px' }}>
                                    <button className="btn btn-outline btn-small" onClick={() => {
                                        const commonTransport = [
                                            { id: generateId(), vehicleType: 'bus', vehicleName: 'AC Bus for Baraat', seats: 45, totalPrice: 15000, kilometers: 200, route: 'Delhi to Wedding Venue', notes: 'For groom\'s family and friends' },
                                            { id: generateId(), vehicleType: 'luxury_coach', vehicleName: 'Luxury Coach', seats: 35, totalPrice: 25000, kilometers: 200, route: 'Guest pickup points', notes: 'For VIP guests' },
                                            { id: generateId(), vehicleType: 'tempo_traveller', vehicleName: 'Tempo Traveller', seats: 12, totalPrice: 8000, kilometers: 150, route: 'Local pickup', notes: 'For elderly guests' }
                                        ];
                                        const updatedTravel = { ...travel };
                                        updatedTravel.transport = [...(updatedTravel.transport || []), ...commonTransport];
                                        updateData('travel', updatedTravel);
                                    }}>Add Common Transport Options</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {showModal && (
                        <TravelModal
                            item={editingItem}
                            onSave={handleSave}
                            onClose={() => { setShowModal(false); setEditingItem(null); }}
                            budget={budget}
                        />
                    )}
                </div>
            );
        };

        const TravelModal = ({ item, onSave, onClose, budget }) => {
            const [formData, setFormData] = useState(item);
            
            const budgetCategories = budget?.map(b => ({
                value: b.category,
                label: b.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            })) || [];

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