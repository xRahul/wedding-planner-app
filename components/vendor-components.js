const { useState, useEffect, useMemo } = React;

// ==================== VENDORS COMPONENT ====================

const Vendors = ({ vendors, updateData, budget }) => {
    const { showModal, editing: editingVendor, handleAdd, handleEdit, handleSave, handleDelete, closeModal } = useCRUD(vendors, updateData, 'vendors', validateVendor);
    const [filteredVendors, filter, setFilter] = useFilter(vendors, (v, f) => v.type === f || v.status === f);

    const vendorStats = useMemo(() => {
        const totalCost = vendors.reduce((sum, v) => sum + (v.finalCost || v.estimatedCost || 0), 0);
        const advancePaid = vendors.reduce((sum, v) => sum + (v.advancePaid || 0), 0);
        const pendingPayment = totalCost - advancePaid;
        const confirmedVendors = vendors.filter(v => v.status === 'confirmed').length;
        const bookedVendors = vendors.filter(v => v.status === 'booked').length;
        const avgRating = vendors.filter(v => v.rating > 0).length > 0 ? 
            vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.filter(v => v.rating > 0).length : 0;
        
        return { totalCost, advancePaid, pendingPayment, confirmedVendors, bookedVendors, avgRating };
    }, [vendors]);

    return (
        <div>
            <Card title={`Vendors (${vendors.length} total)`} action={
                <button className="btn btn-primary" onClick={() => handleAdd({
                    type: 'decorator', name: '', contact: '', email: '', estimatedCost: 0,
                    finalCost: 0, status: 'pending', availability: [], bookedDate: '', notes: '',
                    advancePaid: 0, paymentStatus: 'pending', rating: 0, reviews: '', budgetCategory: ''
                })}>Add Vendor</button>
            }>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
                    <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Cost</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(vendorStats.totalCost)}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Advance Paid</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-success)' }}>{formatCurrency(vendorStats.advancePaid)}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Pending Payment</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-warning)' }}>{formatCurrency(vendorStats.pendingPayment)}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Confirmed</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{vendorStats.confirmedVendors + vendorStats.bookedVendors}/{vendors.length}</div>
                    </div>
                    {vendorStats.avgRating > 0 && (
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Avg Rating</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{'⭐'.repeat(Math.round(vendorStats.avgRating))} {vendorStats.avgRating.toFixed(1)}</div>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {['all', 'confirmed', 'booked', 'pending', 'cancelled'].map(f => (
                        <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </Card>

            <Card>
                {filteredVendors.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Name</th>
                                    <th>Budget Category</th>
                                    <th>Contact</th>
                                    <th>Email</th>
                                    <th>Estimated Cost</th>
                                    <th>Final Cost</th>
                                    <th>Payment Responsibility</th>
                                    <th>Paid By</th>
                                    <th>Availability</th>
                                    <th>Booked Date</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVendors.map(vendor => (
                                    <tr key={vendor.id}>
                                        <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{vendor.type.replace('_', ' ')}</span></td>
                                        <td><strong>{vendor.name}</strong></td>
                                        <td style={{ textTransform: 'capitalize' }}>{vendor.budgetCategory ? vendor.budgetCategory.replace('_', ' ') : '-'}</td>
                                        <td>{vendor.contact || '-'}</td>
                                        <td style={{ fontSize: '11px' }}>{vendor.email || '-'}</td>
                                        <td>{formatCurrency(vendor.estimatedCost || vendor.cost || 0)}</td>
                                        <td style={{ fontWeight: 'bold', color: vendor.finalCost > 0 ? 'var(--color-success)' : 'inherit' }}>
                                            {vendor.finalCost > 0 ? formatCurrency(vendor.finalCost) : '-'}
                                        </td>
                                        <td>
                                            {vendor.paymentResponsibility ? (
                                                <span className={`badge ${vendor.paymentResponsibility === 'bride' ? 'badge-info' : vendor.paymentResponsibility === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                    {vendor.paymentResponsibility === 'bride' ? '👰 Bride' : vendor.paymentResponsibility === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {vendor.paidBy && vendor.paidBy !== 'pending' ? (
                                                <span className={`badge ${vendor.paidBy === 'bride' ? 'badge-info' : vendor.paidBy === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                    {vendor.paidBy === 'bride' ? '👰 Bride' : vendor.paidBy === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                </span>
                                            ) : <span className="badge badge-error">Pending</span>}
                                        </td>
                                        <td style={{ fontSize: '10px', maxWidth: '200px' }}>
                                            {vendor.availability && vendor.availability.length > 0 ? (
                                                vendor.availability.map((slot, idx) => (
                                                    <div key={idx} style={{ marginBottom: '4px', padding: '2px 4px', background: 'var(--color-bg-secondary)', borderRadius: '4px' }}>
                                                        {formatDate(slot.from)} {slot.fromTime}<br/>
                                                        to {formatDate(slot.to)} {slot.toTime}
                                                    </div>
                                                ))
                                            ) : (vendor.availableFrom && vendor.availableTo ? (
                                                <div>{formatDate(vendor.availableFrom)} - {formatDate(vendor.availableTo)}</div>
                                            ) : '-')}
                                        </td>
                                        <td style={{ fontSize: '11px' }}>
                                            {vendor.bookedDate ? (
                                                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{formatDate(vendor.bookedDate)}</span>
                                            ) : '-'}
                                        </td>
                                        <td><Badge status={vendor.status} /></td>
                                        <td style={{ fontSize: '11px', maxWidth: '150px' }}>{vendor.notes || '-'}</td>
                                        <td><ActionButtons onEdit={() => handleEdit(vendor)} onDelete={() => handleDelete(vendor.id)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <EmptyState icon="🤝" message="No vendors found" />}
            </Card>

            {showModal && <VendorModal vendor={editingVendor} onSave={handleSave} onClose={closeModal} budget={budget} />}
        </div>
    );
};

const VendorModal = ({ vendor, onSave, onClose, budget }) => {
    const [formData, setFormData] = useState(vendor);
    const defaultVendorTypes = [
        'pandit_ji', 'decorator', 'caterer', 'dj', 
        'photographer', 'videographer', 'florist', 
        'mehendi_artist', 'makeup_artist', 'choreographer',
        'band_baja', 'dhol_players', 'light_setup',
        'wedding_planner', 'invitation_cards', 'transport',
        'tent_house', 'sound_system', 'fireworks',
        'stage_setup', 'varmala_setup', 'luxury_car_rental',
        'astrologer', 'priest_assistant', 'havan_materials',
        'mandap_decorator', 'horse_ghodi', 'baggi_decoration',
        'sehra_bandi', 'kalash_decoration', 'coconut_supplier',
        'paan_counter', 'live_counter_chef', 'ice_cream_counter',
        'security_service', 'valet_parking', 'generator_rental',
        'ac_cooler_rental', 'crockery_cutlery', 'linen_rental'
    ];
    const [vendorTypes, setVendorTypes] = useState(defaultVendorTypes);

    useEffect(() => {
        const loadCustomVendorTypes = async () => {
            const data = await loadData();
            if (data.customVendorTypes && data.customVendorTypes.length > 0) {
                setVendorTypes([...new Set([...defaultVendorTypes, ...data.customVendorTypes])]);
            }
        };
        loadCustomVendorTypes();
    }, []);

    const handleSaveWithCustomType = async () => {
        if (formData.type && !defaultVendorTypes.includes(formData.type)) {
            const data = await loadData();
            const customTypes = data.customVendorTypes || [];
            if (!customTypes.includes(formData.type)) {
                customTypes.push(formData.type);
                data.customVendorTypes = customTypes;
                await saveData(data);
                setVendorTypes([...new Set([...defaultVendorTypes, ...customTypes])]);
            }
        }
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{vendor.name ? 'Edit Vendor' : 'Add Vendor'}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <SelectOrAddField
                        label="Vendor Type"
                        value={formData.type}
                        onChange={(val) => {
                            setFormData({ ...formData, type: val });
                            if (!defaultVendorTypes.includes(val) && !vendorTypes.includes(val)) {
                                setVendorTypes([...vendorTypes, val]);
                            }
                        }}
                        options={vendorTypes}
                        placeholder="Enter custom vendor type"
                    />
                    <div className="form-group">
                        <label className="form-label">Budget Category</label>
                        <select 
                            className="form-select"
                            value={formData.budgetCategory || ''}
                            onChange={e => setFormData({ ...formData, budgetCategory: e.target.value })}
                        >
                            <option value="">-- Select Budget Category --</option>
                            {budget && budget.map(cat => (
                                <option key={cat.category} value={cat.category}>
                                    {cat.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input 
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Contact Number</label>
                        <input 
                            type="tel"
                            className="form-input"
                            value={formData.contact}
                            onChange={e => setFormData({ ...formData, contact: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input 
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Estimated Cost (₹)</label>
                        <input 
                            type="number"
                            className="form-input"
                            value={formData.estimatedCost || formData.cost || 0}
                            onChange={e => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Final Paid Cost (₹)</label>
                        <input 
                            type="number"
                            className="form-input"
                            value={formData.finalCost || 0}
                            onChange={e => setFormData({ ...formData, finalCost: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="form-group">
                        <div className="flex-between" style={{ marginBottom: '8px' }}>
                            <label className="form-label">Availability Slots</label>
                            <button type="button" className="btn btn-primary btn-small" onClick={() => {
                                setFormData({
                                    ...formData,
                                    availability: [...(formData.availability || []), { from: '', fromTime: '', to: '', toTime: '' }]
                                });
                            }}>
                                + Add Slot
                            </button>
                        </div>
                        {formData.availability && formData.availability.length > 0 ? (
                            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px' }}>
                                {formData.availability.map((slot, idx) => (
                                    <div key={idx} style={{ padding: '8px', marginBottom: '8px', background: 'var(--color-bg-secondary)', borderRadius: '4px' }}>
                                        <div className="flex-between" style={{ marginBottom: '8px' }}>
                                            <strong>Slot {idx + 1}</strong>
                                            <button type="button" className="btn btn-danger btn-small" onClick={() => {
                                                const updated = [...formData.availability];
                                                updated.splice(idx, 1);
                                                setFormData({ ...formData, availability: updated });
                                            }}>
                                                Remove
                                            </button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            <input 
                                                type="date"
                                                className="form-input"
                                                placeholder="From Date"
                                                value={slot.from}
                                                onChange={e => {
                                                    const updated = [...formData.availability];
                                                    updated[idx].from = e.target.value;
                                                    setFormData({ ...formData, availability: updated });
                                                }}
                                            />
                                            <input 
                                                type="time"
                                                className="form-input"
                                                placeholder="From Time"
                                                value={slot.fromTime}
                                                onChange={e => {
                                                    const updated = [...formData.availability];
                                                    updated[idx].fromTime = e.target.value;
                                                    setFormData({ ...formData, availability: updated });
                                                }}
                                            />
                                            <input 
                                                type="date"
                                                className="form-input"
                                                placeholder="To Date"
                                                value={slot.to}
                                                onChange={e => {
                                                    const updated = [...formData.availability];
                                                    updated[idx].to = e.target.value;
                                                    setFormData({ ...formData, availability: updated });
                                                }}
                                            />
                                            <input 
                                                type="time"
                                                className="form-input"
                                                placeholder="To Time"
                                                value={slot.toTime}
                                                onChange={e => {
                                                    const updated = [...formData.availability];
                                                    updated[idx].toTime = e.target.value;
                                                    setFormData({ ...formData, availability: updated });
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '16px' }}>
                                No availability slots added
                            </p>
                        )}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Booked Date</label>
                        <input 
                            type="date"
                            className="form-input"
                            value={formData.bookedDate || ''}
                            onChange={e => setFormData({ ...formData, bookedDate: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Booking Status</label>
                        <select 
                            className="form-select"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="pending">Pending</option>
                            <option value="booked">Booked</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Payment Responsibility</label>
                        <select 
                            className="form-select"
                            value={formData.paymentResponsibility || ''}
                            onChange={e => setFormData({ ...formData, paymentResponsibility: e.target.value })}
                        >
                            <option value="">-- Select --</option>
                            <option value="bride">👰 Bride Side</option>
                            <option value="groom">🤵 Groom Side</option>
                            <option value="split">🤝 Split (Both)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Paid By</label>
                        <select 
                            className="form-select"
                            value={formData.paidBy || 'pending'}
                            onChange={e => setFormData({ ...formData, paidBy: e.target.value })}
                        >
                            <option value="pending">Pending</option>
                            <option value="bride">👰 Bride Side</option>
                            <option value="groom">🤵 Groom Side</option>
                            <option value="split">🤝 Split (Both)</option>
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
                        onClick={handleSaveWithCustomType}
                        disabled={!formData.name}
                    >
                        Save Vendor
                    </button>
                </div>
            </div>
        </div>
    );
};