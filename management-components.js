const { useState, useEffect, useMemo } = React;

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
                    <select 
                        className="form-select"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        style={{ flex: 1 }}
                    >
                        <option value="">Select {label}</option>
                        {options.map(opt => (
                            <option key={opt} value={opt}>
                                {opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                        ))}
                    </select>
                    <button 
                        type="button"
                        className="btn btn-outline btn-small"
                        onClick={() => setIsAdding(true)}
                    >
                        + Add New
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                        type="text"
                        className="form-input"
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        placeholder={placeholder || `Enter new ${label.toLowerCase()}`}
                        style={{ flex: 1 }}
                        onKeyPress={e => e.key === 'Enter' && handleAdd()}
                    />
                    <button 
                        type="button"
                        className="btn btn-primary btn-small"
                        onClick={handleAdd}
                    >
                        Add
                    </button>
                    <button 
                        type="button"
                        className="btn btn-outline btn-small"
                        onClick={() => { setIsAdding(false); setNewValue(''); }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};
// ==================== GUESTS COMPONENT ====================

        const Guests = ({ guests, updateData, data }) => {
            const [showModal, setShowModal] = useState(false);
            const [editingGuest, setEditingGuest] = useState(null);
            const [filter, setFilter] = useState('all');
            const [savedCategories, setSavedCategories] = useState(data.savedGuestCategories || []);
            const [savedRelations, setSavedRelations] = useState(data.savedGuestRelations || []);
            const [savedDietary, setSavedDietary] = useState(data.savedDietaryPreferences || []);
            const [savedFamilyRelations, setSavedFamilyRelations] = useState(data.savedFamilyRelations || []);

            const handleUpdateCategories = (newCategories) => {
                setSavedCategories(newCategories);
                updateData('savedGuestCategories', newCategories);
            };

            const handleUpdateRelations = (newRelations) => {
                setSavedRelations(newRelations);
                updateData('savedGuestRelations', newRelations);
            };

            const handleUpdateDietary = (newDietary) => {
                setSavedDietary(newDietary);
                updateData('savedDietaryPreferences', newDietary);
            };

            const handleUpdateFamilyRelations = (newRelations) => {
                setSavedFamilyRelations(newRelations);
                updateData('savedFamilyRelations', newRelations);
            };

            const filteredGuests = useMemo(() => {
                if (filter === 'all') return guests;
                return guests.filter(g => g.category === filter || g.rsvpStatus === filter);
            }, [guests, filter]);

            const handleAdd = () => {
                setEditingGuest({
                    id: generateId(),
                    type: 'single',
                    name: '',
                    category: 'family',
                    side: 'groom',
                    relation: '',
                    phone: '',
                    dietary: 'veg',
                    rsvpStatus: 'pending',
                    aadharCollected: false,
                    room: '',
                    arrivalDate: '',
                    departureDate: '',
                    notes: '',
                    familyMembers: []
                });
                setShowModal(true);
            };

            const handleEdit = (guest) => {
                setEditingGuest({ ...guest });
                setShowModal(true);
            };

            const handleSave = (guest) => {
                try {
                    const errors = validateGuest(guest);
                    if (errors) {
                        const errorMsg = Object.entries(errors).map(([field, msg]) => `${field}: ${msg}`).join('\n');
                        alert(`Please fix the following errors:\n\n${errorMsg}`);
                        return;
                    }
                    const index = guests.findIndex(g => g.id === guest.id);
                    let updatedGuests;
                    if (index >= 0) {
                        updatedGuests = [...guests];
                        updatedGuests[index] = guest;
                    } else {
                        updatedGuests = [...guests, guest];
                    }
                    updateData('guests', updatedGuests);
                    setShowModal(false);
                    setEditingGuest(null);
                } catch (error) {
                    console.error('Error saving guest:', error);
                    alert(`Failed to save guest: ${error.message}`);
                }
            };

            const handleDelete = (id) => {
                if (confirm('Delete this guest?')) {
                    updateData('guests', guests.filter(g => g.id !== id));
                }
            };

            const stats = useMemo(() => {
                return {
                    total: guests.length,
                    confirmed: guests.filter(g => g.rsvpStatus === 'yes').length,
                    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
                    declined: guests.filter(g => g.rsvpStatus === 'no').length
                };
            }, [guests]);

            return (
                <div>
                    <div className="card">
                        <div className="flex-between">
                            <h2 className="card-title">Guest List ({stats.total} total)</h2>
                            <button className="btn btn-primary" onClick={handleAdd}>Add Guest</button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                            <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter('all')}>All</button>
                            <button className={`btn ${filter === 'family' ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter('family')}>Family</button>
                            <button className={`btn ${filter === 'friends' ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter('friends')}>Friends</button>
                            <button className={`btn ${filter === 'yes' ? 'btn-success' : 'btn-outline'} btn-small`} onClick={() => setFilter('yes')}>Confirmed ({stats.confirmed})</button>
                            <button className={`btn ${filter === 'pending' ? 'btn-outline' : 'btn-outline'} btn-small`} onClick={() => setFilter('pending')}>Pending ({stats.pending})</button>
                        </div>
                    </div>

                    <div className="card">
                        {filteredGuests.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Name</th>
                                            <th>Side</th>
                                            <th>Relation</th>
                                            <th>Phone</th>
                                            <th>Room</th>
                                            <th>Arrival</th>
                                            <th>Departure</th>
                                            <th>Dietary</th>
                                            <th>Category</th>
                                            <th>RSVP</th>
                                            <th>Aadhar</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGuests.map(guest => (
                                            <tr key={guest.id}>
                                                <td><span className="badge badge-info">{guest.type === 'family' ? '👨‍👩‍👧‍👦 Family' : '👤 Single'}</span></td>
                                                <td>
                                                    <strong>{guest.name}</strong>
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • {member.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ textTransform: 'capitalize' }}>
                                                    {guest.side}
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • {guest.side}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ textTransform: 'capitalize' }}>
                                                    {guest.relation?.replace('_', ' ')}
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • {member.familyRelation?.replace('_', ' ')}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {guest.phone}
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • {member.phone || '-'}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {guest.room || '-'}
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • {member.room || '-'}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: '11px' }}>
                                                    {guest.arrivalDate ? formatDate(guest.arrivalDate) : '-'}
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • {member.arrivalDate ? formatDate(member.arrivalDate) : '-'}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: '11px' }}>
                                                    {guest.departureDate ? formatDate(guest.departureDate) : '-'}
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • {member.departureDate ? formatDate(member.departureDate) : '-'}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ textTransform: 'capitalize' }}>
                                                    {guest.dietary?.replace('_', ' ')}
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • {member.dietary?.replace('_', ' ')}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ textTransform: 'capitalize' }}>
                                                    {guest.category?.replace('_', ' ')}
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • {guest.category?.replace('_', ' ')}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`badge ${guest.rsvpStatus === 'yes' ? 'badge-success' : guest.rsvpStatus === 'no' ? 'badge-error' : 'badge-warning'}`}>
                                                        {guest.rsvpStatus === 'yes' ? 'Yes' : guest.rsvpStatus === 'no' ? 'No' : 'Pending'}
                                                    </span>
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • <span className={`badge ${guest.rsvpStatus === 'yes' ? 'badge-success' : guest.rsvpStatus === 'no' ? 'badge-error' : 'badge-warning'}`}>
                                                                        {guest.rsvpStatus === 'yes' ? 'Yes' : guest.rsvpStatus === 'no' ? 'No' : 'Pending'}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {guest.aadharCollected ? '✅' : '❌'}
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • {member.aadharCollected ? '✅' : '❌'}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: '12px' }}>
                                                    {guest.notes}
                                                    {guest.type === 'family' && guest.familyMembers && guest.familyMembers.length > 0 && (
                                                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                                            {guest.familyMembers.map((member, idx) => (
                                                                <div key={member.id} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                                    • -
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="btn btn-outline btn-small" onClick={() => handleEdit(guest)}>Edit</button>
                                                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(guest.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">👥</div>
                                <p>No guests found</p>
                            </div>
                        )}
                    </div>

                    {showModal && (
                        <GuestModal
                            guest={editingGuest}
                            onSave={handleSave}
                            onClose={() => { setShowModal(false); setEditingGuest(null); }}
                            savedCategories={savedCategories}
                            savedRelations={savedRelations}
                            savedDietary={savedDietary}
                            savedFamilyRelations={savedFamilyRelations}
                            onUpdateCategories={handleUpdateCategories}
                            onUpdateRelations={handleUpdateRelations}
                            onUpdateDietary={handleUpdateDietary}
                            onUpdateFamilyRelations={handleUpdateFamilyRelations}
                        />
                    )}
                </div>
            );
        };



        const GuestModal = ({ guest, onSave, onClose, savedCategories, savedRelations, savedDietary, savedFamilyRelations, onUpdateCategories, onUpdateRelations, onUpdateDietary, onUpdateFamilyRelations }) => {
            const [formData, setFormData] = useState(guest || { type: 'single', familyMembers: [] });

            const handleCategoryChange = (newCategory) => {
                setFormData({ ...formData, category: newCategory });
                if (!savedCategories.includes(newCategory)) {
                    onUpdateCategories([...savedCategories, newCategory]);
                }
            };

            const handleRelationChange = (newRelation) => {
                setFormData({ ...formData, relation: newRelation });
                if (!savedRelations.includes(newRelation)) {
                    onUpdateRelations([...savedRelations, newRelation]);
                }
            };

            const handleDietaryChange = (newDietary) => {
                setFormData({ ...formData, dietary: newDietary });
                if (!savedDietary.includes(newDietary)) {
                    onUpdateDietary([...savedDietary, newDietary]);
                }
            };

            const handleAddFamilyMember = () => {
                const newMember = {
                    id: generateId(),
                    name: '',
                    familyRelation: '',
                    phone: '',
                    room: '',
                    arrivalDate: '',
                    departureDate: '',
                    dietary: 'veg',
                    aadharCollected: false
                };
                setFormData({
                    ...formData,
                    familyMembers: [...(formData.familyMembers || []), newMember]
                });
            };

            const handleRemoveFamilyMember = (index) => {
                const updated = [...formData.familyMembers];
                updated.splice(index, 1);
                setFormData({ ...formData, familyMembers: updated });
            };

            const handleUpdateFamilyMember = (index, field, value) => {
                const updated = [...formData.familyMembers];
                updated[index] = { ...updated[index], [field]: value };
                setFormData({ ...formData, familyMembers: updated });
            };

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{guest.name ? 'Edit Guest' : 'Add Guest'}</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Guest Type *</label>
                                <select 
                                    className="form-select"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="single">Single Guest</option>
                                    <option value="family">Family</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{formData.type === 'family' ? 'Family Head Name *' : 'Name *'}</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <SelectOrAddField
                                label="Category"
                                value={formData.category}
                                onChange={handleCategoryChange}
                                options={savedCategories}
                                placeholder="Enter custom category"
                            />
                            <div className="form-group">
                                <label className="form-label">Side *</label>
                                <select 
                                    className="form-select"
                                    value={formData.side}
                                    onChange={e => setFormData({ ...formData, side: e.target.value })}
                                >
                                    <option value="bride">Bride's Side</option>
                                    <option value="groom">Groom's Side</option>
                                </select>
                            </div>
                            <SelectOrAddField
                                label="Relation"
                                value={formData.relation}
                                onChange={handleRelationChange}
                                options={savedRelations}
                                placeholder="Enter custom relation"
                            />
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input 
                                    type="tel"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Room Number</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.room || ''}
                                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                                    placeholder="e.g., 101, A-205"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Arrival Date</label>
                                <input 
                                    type="date"
                                    className="form-input"
                                    value={formData.arrivalDate || ''}
                                    onChange={e => setFormData({ ...formData, arrivalDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Departure Date</label>
                                <input 
                                    type="date"
                                    className="form-input"
                                    value={formData.departureDate || ''}
                                    onChange={e => setFormData({ ...formData, departureDate: e.target.value })}
                                />
                            </div>
                            <SelectOrAddField
                                label="Dietary Preference"
                                value={formData.dietary}
                                onChange={handleDietaryChange}
                                options={savedDietary}
                                placeholder="Enter custom dietary preference"
                            />
                            <div className="form-group">
                                <label className="form-label">RSVP Status</label>
                                <select 
                                    className="form-select"
                                    value={formData.rsvpStatus}
                                    onChange={e => setFormData({ ...formData, rsvpStatus: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="yes">Confirmed</option>
                                    <option value="no">Declined</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input 
                                        type="checkbox"
                                        checked={formData.aadharCollected || false}
                                        onChange={e => setFormData({ ...formData, aadharCollected: e.target.checked })}
                                    />
                                    <span className="form-label" style={{ margin: 0 }}>Aadhar Card Collected</span>
                                </label>
                            </div>
                            {formData.type === 'family' && (
                                <div className="form-group">
                                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                                        <label className="form-label">Family Members</label>
                                        <button type="button" className="btn btn-primary btn-small" onClick={handleAddFamilyMember}>
                                            + Add Member
                                        </button>
                                    </div>
                                    {formData.familyMembers && formData.familyMembers.length > 0 ? (
                                        <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                                            {formData.familyMembers.map((member, idx) => (
                                                <div key={member.id} style={{ padding: '12px', marginBottom: '8px', background: 'var(--color-bg-secondary)', borderRadius: '4px' }}>
                                                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                                                        <strong>Member {idx + 1}</strong>
                                                        <button type="button" className="btn btn-danger btn-small" onClick={() => handleRemoveFamilyMember(idx)}>
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <div style={{ display: 'grid', gap: '8px' }}>
                                                        <input 
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="Name *"
                                                            value={member.name}
                                                            onChange={e => handleUpdateFamilyMember(idx, 'name', e.target.value)}
                                                        />
                                                        <select 
                                                            className="form-select"
                                                            value={member.familyRelation}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                handleUpdateFamilyMember(idx, 'familyRelation', val);
                                                                if (val && !savedFamilyRelations.includes(val)) {
                                                                    onUpdateFamilyRelations([...savedFamilyRelations, val]);
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Select Relation to Head</option>
                                                            {savedFamilyRelations.map(rel => (
                                                                <option key={rel} value={rel}>{rel.replace('_', ' ')}</option>
                                                            ))}
                                                        </select>
                                                        <input 
                                                            type="tel"
                                                            className="form-input"
                                                            placeholder="Phone (optional)"
                                                            value={member.phone || ''}
                                                            onChange={e => handleUpdateFamilyMember(idx, 'phone', e.target.value)}
                                                        />
                                                        <input 
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="Room (optional)"
                                                            value={member.room || ''}
                                                            onChange={e => handleUpdateFamilyMember(idx, 'room', e.target.value)}
                                                        />
                                                        <input 
                                                            type="date"
                                                            className="form-input"
                                                            placeholder="Arrival Date"
                                                            value={member.arrivalDate || ''}
                                                            onChange={e => handleUpdateFamilyMember(idx, 'arrivalDate', e.target.value)}
                                                        />
                                                        <input 
                                                            type="date"
                                                            className="form-input"
                                                            placeholder="Departure Date"
                                                            value={member.departureDate || ''}
                                                            onChange={e => handleUpdateFamilyMember(idx, 'departureDate', e.target.value)}
                                                        />
                                                        <select 
                                                            className="form-select"
                                                            value={member.dietary}
                                                            onChange={e => handleUpdateFamilyMember(idx, 'dietary', e.target.value)}
                                                        >
                                                            {savedDietary.map(diet => (
                                                                <option key={diet} value={diet}>{diet.replace('_', ' ')}</option>
                                                            ))}
                                                        </select>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                                            <input 
                                                                type="checkbox"
                                                                checked={member.aadharCollected || false}
                                                                onChange={e => handleUpdateFamilyMember(idx, 'aadharCollected', e.target.checked)}
                                                            />
                                                            Aadhar Collected
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '16px' }}>
                                            No family members added
                                        </p>
                                    )}
                                </div>
                            )}
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
                                disabled={!formData.name}
                            >
                                Save Guest
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== VENDORS COMPONENT ====================

        const Vendors = ({ vendors, updateData }) => {
            const [showModal, setShowModal] = useState(false);
            const [editingVendor, setEditingVendor] = useState(null);
            const [filter, setFilter] = useState('all');

            const filteredVendors = useMemo(() => {
                if (filter === 'all') return vendors;
                return vendors.filter(v => v.type === filter || v.status === filter);
            }, [vendors, filter]);

            const handleAdd = () => {
                setEditingVendor({
                    id: generateId(),
                    type: 'decorator',
                    name: '',
                    contact: '',
                    email: '',
                    estimatedCost: 0,
                    finalCost: 0,
                    status: 'pending',
                    availability: [],
                    bookedDate: '',
                    notes: ''
                });
                setShowModal(true);
            };

            const handleEdit = (vendor) => {
                setEditingVendor({ ...vendor });
                setShowModal(true);
            };

            const handleSave = (vendor) => {
                try {
                    const errors = validateVendor(vendor);
                    if (errors) {
                        const errorMsg = Object.entries(errors).map(([field, msg]) => `${field}: ${msg}`).join('\n');
                        alert(`Please fix the following errors:\n\n${errorMsg}`);
                        return;
                    }
                    const index = vendors.findIndex(v => v.id === vendor.id);
                    let updatedVendors;
                    if (index >= 0) {
                        updatedVendors = [...vendors];
                        updatedVendors[index] = vendor;
                    } else {
                        updatedVendors = [...vendors, vendor];
                    }
                    updateData('vendors', updatedVendors);
                    setShowModal(false);
                    setEditingVendor(null);
                } catch (error) {
                    console.error('Error saving vendor:', error);
                    alert(`Failed to save vendor: ${error.message}`);
                }
            };

            const handleDelete = (id) => {
                if (confirm('Delete this vendor?')) {
                    updateData('vendors', vendors.filter(v => v.id !== id));
                }
            };

            const totalCost = useMemo(() => {
                return vendors.reduce((sum, v) => sum + (v.finalCost || v.cost || 0), 0);
            }, [vendors]);

            return (
                <div>
                    <div className="card">
                        <div className="flex-between">
                            <h2 className="card-title">Vendors ({vendors.length} total)</h2>
                            <button className="btn btn-primary" onClick={handleAdd}>Add Vendor</button>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <strong>Total Vendor Cost: {formatCurrency(totalCost)}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                            <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter('all')}>All</button>
                            <button className={`btn ${filter === 'confirmed' ? 'btn-success' : 'btn-outline'} btn-small`} onClick={() => setFilter('confirmed')}>Confirmed</button>
                            <button className={`btn ${filter === 'booked' ? 'btn-outline' : 'btn-outline'} btn-small`} onClick={() => setFilter('booked')}>Booked</button>
                            <button className={`btn ${filter === 'pending' ? 'btn-outline' : 'btn-outline'} btn-small`} onClick={() => setFilter('pending')}>Pending</button>
                        </div>
                    </div>

                    <div className="card">
                        {filteredVendors.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Name</th>
                                            <th>Contact</th>
                                            <th>Email</th>
                                            <th>Estimated Cost</th>
                                            <th>Final Cost</th>
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
                                                <td>{vendor.contact || '-'}</td>
                                                <td style={{ fontSize: '11px' }}>{vendor.email || '-'}</td>
                                                <td>{formatCurrency(vendor.estimatedCost || vendor.cost || 0)}</td>
                                                <td style={{ fontWeight: 'bold', color: vendor.finalCost > 0 ? 'var(--color-success)' : 'inherit' }}>
                                                    {vendor.finalCost > 0 ? formatCurrency(vendor.finalCost) : '-'}
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
                                                <td>
                                                    <span className={`badge ${vendor.status === 'confirmed' ? 'badge-success' : vendor.status === 'booked' ? 'badge-info' : 'badge-warning'}`}>
                                                        {vendor.status}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '11px', maxWidth: '150px' }}>{vendor.notes || '-'}</td>
                                                <td>
                                                    <button className="btn btn-outline btn-small" onClick={() => handleEdit(vendor)}>Edit</button>
                                                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(vendor.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🤝</div>
                                <p>No vendors found</p>
                            </div>
                        )}
                    </div>

                    {showModal && (
                        <VendorModal
                            vendor={editingVendor}
                            onSave={handleSave}
                            onClose={() => { setShowModal(false); setEditingVendor(null); }}
                        />
                    )}
                </div>
            );
        };

        const VendorModal = ({ vendor, onSave, onClose }) => {
            const [formData, setFormData] = useState(vendor);
            const defaultVendorTypes = [
                'pandit_ji', 'decorator', 'caterer', 'dj', 
                'photographer', 'videographer', 'florist', 
                'mehendi_artist', 'makeup_artist', 'choreographer',
                'band_baja', 'dhol_players', 'light_setup',
                'wedding_planner', 'invitation_cards', 'transport',
                'tent_house', 'sound_system', 'fireworks',
                'stage_setup', 'varmala_setup', 'luxury_car_rental'
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
                                onChange={(val) => setFormData({ ...formData, type: val })}
                                options={vendorTypes}
                                placeholder="Enter custom vendor type"
                            />
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

        // ==================== BUDGET COMPONENT ====================

        const Budget = ({ budget, updateData, totalBudget }) => {
            const [editingCategory, setEditingCategory] = useState(null);
            const [showAddModal, setShowAddModal] = useState(false);
            const [newCategoryName, setNewCategoryName] = useState('');

            const handleUpdate = (category, updates) => {
                const updatedBudget = budget.map(cat => 
                    cat.category === category ? { ...cat, ...updates } : cat
                );
                updateData('budget', updatedBudget);
                setEditingCategory(null);
            };

            const handleAddCategory = () => {
                if (newCategoryName.trim()) {
                    const updatedBudget = [...budget, { category: newCategoryName.trim().toLowerCase().replace(/\s+/g, '_'), planned: 0, actual: 0, subcategories: [] }];
                    updateData('budget', updatedBudget);
                    setNewCategoryName('');
                    setShowAddModal(false);
                }
            };

            const handleRemoveCategory = (category) => {
                if (confirm(`Delete ${category} category?`)) {
                    updateData('budget', budget.filter(cat => cat.category !== category));
                }
            };

            const totals = useMemo(() => {
                const totalPlanned = budget.reduce((sum, cat) => sum + cat.planned, 0);
                const totalActual = budget.reduce((sum, cat) => sum + cat.actual, 0);
                const remaining = totalBudget - totalActual;
                return { totalPlanned, totalActual, remaining };
            }, [budget, totalBudget]);

            return (
                <div>
                    <div className="card">
                        <div className="flex-between">
                            <h2 className="card-title">Budget Tracker</h2>
                            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add Category</button>
                        </div>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{formatCurrency(totalBudget)}</div>
                                <div className="stat-label">Total Budget</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{formatCurrency(totals.totalActual)}</div>
                                <div className="stat-label">Spent</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value" style={{ color: totals.remaining >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                    {formatCurrency(totals.remaining)}
                                </div>
                                <div className="stat-label">Remaining</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{((totals.totalActual / totalBudget) * 100).toFixed(1)}%</div>
                                <div className="stat-label">Budget Used</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="card-title">Budget by Category</h3>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Planned</th>
                                        <th>Actual</th>
                                        <th>Difference</th>
                                        <th>% of Budget</th>
                                        <th>Progress</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {budget.map(cat => {
                                        const diff = cat.actual - cat.planned;
                                        const percentage = cat.planned > 0 ? (cat.actual / cat.planned * 100) : 0;
                                        return (
                                            <tr key={cat.category}>
                                                <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{cat.category}</td>
                                                <td>{formatCurrency(cat.planned)}</td>
                                                <td>{formatCurrency(cat.actual)}</td>
                                                <td style={{ color: diff > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                                                    {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                                                </td>
                                                <td>{((cat.actual / totalBudget) * 100).toFixed(1)}%</td>
                                                <td style={{ minWidth: '150px' }}>
                                                    <div className="progress-bar" style={{ height: '20px' }}>
                                                        <div 
                                                            className="progress-fill" 
                                                            style={{ 
                                                                width: `${Math.min(percentage, 100)}%`,
                                                                background: percentage > 100 ? 'var(--color-error)' : 'linear-gradient(90deg, var(--color-primary), var(--color-accent))'
                                                            }}
                                                        >
                                                            {percentage > 10 && `${percentage.toFixed(0)}%`}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-outline btn-small"
                                                        onClick={() => setEditingCategory(cat.category)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-small"
                                                        onClick={() => handleRemoveCategory(cat.category)}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {editingCategory && (
                        <BudgetModal
                            category={budget.find(c => c.category === editingCategory)}
                            onSave={handleUpdate}
                            onClose={() => setEditingCategory(null)}
                        />
                    )}

                    {showAddModal && (
                        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                                <div className="modal-header">
                                    <h3 className="modal-title">Add Budget Category</h3>
                                    <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label className="form-label">Category Name *</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                            placeholder="e.g., Flowers, Music"
                                            onKeyPress={e => e.key === 'Enter' && handleAddCategory()}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={handleAddCategory}
                                        disabled={!newCategoryName.trim()}
                                    >
                                        Add Category
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        const BudgetModal = ({ category, onSave, onClose }) => {
            const [planned, setPlanned] = useState(category.planned);
            const [actual, setActual] = useState(category.actual);

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ textTransform: 'capitalize' }}>Edit {category.category} Budget</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Planned Budget (₹)</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={planned}
                                    onChange={e => setPlanned(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Actual Spent (₹)</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={actual}
                                    onChange={e => setActual(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => onSave(category.category, { planned: parseFloat(planned) || 0, actual: parseFloat(actual) || 0 })}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== TASKS COMPONENT ====================

        const Tasks = ({ tasks, updateData }) => {
            const [showModal, setShowModal] = useState(false);
            const [editingTask, setEditingTask] = useState(null);
            const [filter, setFilter] = useState('all');

            const filteredTasks = useMemo(() => {
                if (filter === 'all') return tasks;
                return tasks.filter(t => t.status === filter || t.priority === filter);
            }, [tasks, filter]);

            const handleAdd = () => {
                setEditingTask({
                    id: generateId(),
                    description: '',
                    deadline: '',
                    assignedTo: '',
                    status: 'pending',
                    priority: 'medium'
                });
                setShowModal(true);
            };

            const handleEdit = (task) => {
                setEditingTask({ ...task });
                setShowModal(true);
            };

            const handleSave = (task) => {
                try {
                    if (!task.description?.trim()) {
                        alert('Task description is required.');
                        return;
                    }

                    const index = tasks.findIndex(t => t.id === task.id);
                    let updatedTasks;
                    if (index >= 0) {
                        updatedTasks = [...tasks];
                        updatedTasks[index] = task;
                    } else {
                        updatedTasks = [...tasks, task];
                    }
                    updateData('tasks', updatedTasks);
                    setShowModal(false);
                    setEditingTask(null);
                } catch (error) {
                    console.error('Error saving task:', error);
                    alert(`Failed to save task: ${error.message}`);
                }
            };

            const handleDelete = (id) => {
                if (confirm('Delete this task?')) {
                    updateData('tasks', tasks.filter(t => t.id !== id));
                }
            };

            const handleToggleStatus = (id) => {
                const updatedTasks = tasks.map(t => 
                    t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t
                );
                updateData('tasks', updatedTasks);
            };

            const stats = useMemo(() => {
                return {
                    total: tasks.length,
                    done: tasks.filter(t => t.status === 'done').length,
                    pending: tasks.filter(t => t.status === 'pending').length,
                    high: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length
                };
            }, [tasks]);

            return (
                <div>
                    <div className="card">
                        <div className="flex-between">
                            <h2 className="card-title">Tasks Checklist ({stats.done}/{stats.total} completed)</h2>
                            <button className="btn btn-primary" onClick={handleAdd}>Add Task</button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                            <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter('all')}>All</button>
                            <button className={`btn ${filter === 'pending' ? 'btn-outline' : 'btn-outline'} btn-small`} onClick={() => setFilter('pending')}>Pending ({stats.pending})</button>
                            <button className={`btn ${filter === 'done' ? 'btn-success' : 'btn-outline'} btn-small`} onClick={() => setFilter('done')}>Done ({stats.done})</button>
                            <button className={`btn ${filter === 'high' ? 'btn-secondary' : 'btn-outline'} btn-small`} onClick={() => setFilter('high')}>High Priority ({stats.high})</button>
                        </div>
                    </div>

                    <div className="card">
                        {filteredTasks.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '50px' }}>Done</th>
                                            <th>Task</th>
                                            <th>Deadline</th>
                                            <th>Assigned To</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTasks.map(task => (
                                            <tr key={task.id} style={{ opacity: task.status === 'done' ? 0.6 : 1 }}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={task.status === 'done'}
                                                        onChange={() => handleToggleStatus(task.id)}
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                    />
                                                </td>
                                                <td>
                                                    <strong style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                                                        {task.description}
                                                    </strong>
                                                </td>
                                                <td>{formatDate(task.deadline)}</td>
                                                <td>{task.assignedTo}</td>
                                                <td>
                                                    <span className={`badge ${task.priority === 'high' ? 'badge-error' : task.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${task.status === 'done' ? 'badge-success' : 'badge-warning'}`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-outline btn-small" onClick={() => handleEdit(task)}>Edit</button>
                                                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(task.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">✅</div>
                                <p>No tasks found</p>
                            </div>
                        )}
                    </div>

                    {showModal && (
                        <TaskModal
                            task={editingTask}
                            onSave={handleSave}
                            onClose={() => { setShowModal(false); setEditingTask(null); }}
                        />
                    )}
                </div>
            );
        };

        const TaskModal = ({ task, onSave, onClose }) => {
            const [formData, setFormData] = useState(task);

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{task.description ? 'Edit Task' : 'Add Task'}</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Task Description *</label>
                                <textarea 
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Deadline</label>
                                <input 
                                    type="date"
                                    className="form-input"
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Assigned To</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.assignedTo}
                                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select 
                                    className="form-select"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select 
                                    className="form-select"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => onSave(formData)}
                                disabled={!formData.description}
                            >
                                Save Task
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

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

        