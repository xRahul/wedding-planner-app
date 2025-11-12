const { useState, useEffect, useMemo } = React;

// ==================== GUESTS COMPONENT ====================

const Guests = ({ guests, updateData, data }) => {
    const { showModal, editing: editingGuest, handleAdd, handleEdit, handleSave, handleDelete, closeModal } = useCRUD(guests, updateData, 'guests', validateGuest);
    const [filteredGuests, filter, setFilter] = useFilter(guests, (g, f) => g.category === f || g.rsvpStatus === f);
    const [savedCategories, setSavedCategories] = useState(data.savedGuestCategories || []);
    const [savedRelations, setSavedRelations] = useState(data.savedGuestRelations || []);
    const [savedDietary, setSavedDietary] = useState(data.savedDietaryPreferences || []);
    const [savedFamilyRelations, setSavedFamilyRelations] = useState(data.savedFamilyRelations || []);

    const updateSaved = (key, val, setter) => {
        setter(val);
        updateData(key, val);
    };

    const stats = useMemo(() => {
        const totalIndividuals = guests.reduce((sum, g) => {
            if (g.type === 'family') return sum + 1 + (g.familyMembers?.length || 0);
            return sum + 1;
        }, 0);
        const confirmed = guests.filter(g => g.rsvpStatus === 'yes').length;
        const confirmedIndividuals = guests.reduce((sum, g) => {
            if (g.rsvpStatus === 'yes') {
                if (g.type === 'family') return sum + 1 + (g.familyMembers?.length || 0);
                return sum + 1;
            }
            return sum;
        }, 0);
        const pending = guests.filter(g => g.rsvpStatus === 'pending').length;
        const declined = guests.filter(g => g.rsvpStatus === 'no').length;
        const brideGuests = guests.filter(g => g.side === 'bride').length;
        const groomGuests = guests.filter(g => g.side === 'groom').length;
        const aadharCollected = guests.reduce((sum, g) => {
            let count = g.aadharCollected ? 1 : 0;
            if (g.type === 'family' && g.familyMembers) {
                count += g.familyMembers.filter(m => m.aadharCollected).length;
            }
            return sum + count;
        }, 0);
        const roomsAssigned = guests.reduce((sum, g) => {
            let count = g.room ? 1 : 0;
            if (g.type === 'family' && g.familyMembers) {
                count += g.familyMembers.filter(m => m.room).length;
            }
            return sum + count;
        }, 0);
        const vegCount = guests.reduce((sum, g) => {
            let count = g.dietary === 'veg' ? 1 : 0;
            if (g.type === 'family' && g.familyMembers) {
                count += g.familyMembers.filter(m => m.dietary === 'veg').length;
            }
            return sum + count;
        }, 0);
        const nonVegCount = guests.reduce((sum, g) => {
            let count = g.dietary === 'non_veg' ? 1 : 0;
            if (g.type === 'family' && g.familyMembers) {
                count += g.familyMembers.filter(m => m.dietary === 'non_veg').length;
            }
            return sum + count;
        }, 0);
        const categories = {};
        guests.forEach(g => {
            categories[g.category] = (categories[g.category] || 0) + 1;
        });
        return {
            total: guests.length,
            totalIndividuals,
            confirmed,
            confirmedIndividuals,
            pending,
            declined,
            brideGuests,
            groomGuests,
            aadharCollected,
            roomsAssigned,
            vegCount,
            nonVegCount,
            categories
        };
    }, [guests]);

    return (
        <div>
            <Card title="Guest Dashboard" action={
                <button className="btn btn-primary" onClick={() => handleAdd({
                    type: 'single', name: '', category: 'family', side: 'groom', relation: '',
                    phone: '', dietary: 'veg', rsvpStatus: 'pending', aadharCollected: false,
                    room: '', arrivalDate: '', departureDate: '', notes: '', familyMembers: []
                })}>Add Guest</button>
            }>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalIndividuals}</div>
                        <div className="stat-label">Total Individuals</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            {stats.total} entries
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.confirmedIndividuals}</div>
                        <div className="stat-label">Confirmed Attending</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            {stats.confirmed} entries confirmed
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats.pending}</div>
                        <div className="stat-label">Pending RSVP</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--color-error)' }}>{stats.declined}</div>
                        <div className="stat-label">Declined</div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Side Split</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>👰 {stats.brideGuests} | 🤵 {stats.groomGuests}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Aadhar Collected</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.aadharCollected} / {stats.totalIndividuals}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            {((stats.aadharCollected / stats.totalIndividuals) * 100).toFixed(0)}% complete
                        </div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Rooms Assigned</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.roomsAssigned} / {stats.totalIndividuals}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            {((stats.roomsAssigned / stats.totalIndividuals) * 100).toFixed(0)}% assigned
                        </div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Dietary Preferences</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>🥗 {stats.vegCount} | 🍗 {stats.nonVegCount}</div>
                    </div>
                </div>
                {Object.keys(stats.categories).length > 0 && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Categories</div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {Object.entries(stats.categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                                <div key={cat} style={{ fontSize: '14px' }}>
                                    <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{cat.replace('_', ' ')}</span>: {count}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            <Card title={`Guest List (${stats.total} entries, ${stats.totalIndividuals} individuals)`}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {['all', 'family', 'friends', 'yes', 'pending'].map(f => (
                        <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter(f)}>
                            {f === 'all' ? 'All' : f === 'yes' ? `Confirmed (${stats.confirmed})` : f === 'pending' ? `Pending (${stats.pending})` : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
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
                                        <td><span className="badge badge-info">{guest.type === 'family' ? '👨👩👧👦 Family' : '👤 Single'}</span></td>
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
                                            <Badge status={guest.rsvpStatus}>
                                                {guest.rsvpStatus === 'yes' ? 'Yes' : guest.rsvpStatus === 'no' ? 'No' : 'Pending'}
                                            </Badge>
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
                                            <ActionButtons onEdit={() => handleEdit(guest)} onDelete={() => handleDelete(guest.id)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <EmptyState icon="👥" message="No guests found" />}
            </Card>

            {showModal && (
                <GuestModal
                    guest={editingGuest}
                    onSave={handleSave}
                    onClose={closeModal}
                    savedCategories={savedCategories}
                    savedRelations={savedRelations}
                    savedDietary={savedDietary}
                    savedFamilyRelations={savedFamilyRelations}
                    onUpdateCategories={v => updateSaved('savedGuestCategories', v, setSavedCategories)}
                    onUpdateRelations={v => updateSaved('savedGuestRelations', v, setSavedRelations)}
                    onUpdateDietary={v => updateSaved('savedDietaryPreferences', v, setSavedDietary)}
                    onUpdateFamilyRelations={v => updateSaved('savedFamilyRelations', v, setSavedFamilyRelations)}
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
                    <h3 className="modal-title">{guest?.name ? 'Edit Guest' : 'Add Guest'}</h3>
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
                            value={formData.name || ''}
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
                            value={formData.phone || ''}
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
                                                    value={member.name || ''}
                                                    onChange={e => handleUpdateFamilyMember(idx, 'name', e.target.value)}
                                                />
                                                <select 
                                                    className="form-select"
                                                    value={member.familyRelation || ''}
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
                                                    value={member.dietary || 'veg'}
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
                            value={formData.notes || ''}
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