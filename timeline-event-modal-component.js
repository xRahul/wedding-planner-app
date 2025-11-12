const { useState, useEffect } = React;

const TimelineEventModal = ({ event, onSave, onClose, vendors }) => {
    const [formData, setFormData] = useState(event);
    const defaultCeremonies = [
        'Roka', 'Sagan', 'Tilak', 
        'Mehendi', 'Sangeet', 'Haldi', 
        'Ganesh Puja', 'Mandap Muhurat', 'Kalash Sthapna',
        'Baraat', 'Jaimala', 'Pheras', 
        'Vidai', 'Reception', 'Grih Pravesh'
    ];
    const [ceremonies, setCeremonies] = useState(defaultCeremonies);

    useEffect(() => {
        const loadCustomCeremonies = async () => {
            const data = await loadData();
            if (data.customCeremonies && data.customCeremonies.length > 0) {
                const allCeremonies = [...new Set([...defaultCeremonies, ...data.customCeremonies])];
                setCeremonies(allCeremonies);
            }
        };
        loadCustomCeremonies();
    }, []);
    const vendorTypes = [
        'pandit_ji', 'decorator', 'caterer', 'dj', 
        'photographer', 'videographer', 'florist', 
        'mehendi_artist', 'makeup_artist', 'choreographer',
        'band_baja', 'dhol_players', 'light_setup',
        'wedding_planner', 'invitation_cards', 'transport',
        'tent_house', 'sound_system', 'fireworks',
        'stage_setup', 'varmala_setup', 'luxury_car_rental'
    ];

    const handleVendorTypeChange = (e) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        setFormData({ ...formData, vendorTypes: options, assignedVendors: formData.assignedVendors || {} });
    };

    const handleVendorAssign = (type, e) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
        setFormData({ 
            ...formData, 
            assignedVendors: { ...formData.assignedVendors, [type]: selectedIds } 
        });
    };

    const handleSave = async () => {
        if (formData.ceremony && !defaultCeremonies.includes(formData.ceremony)) {
            const data = await loadData();
            const customCeremonies = data.customCeremonies || [];
            if (!customCeremonies.includes(formData.ceremony)) {
                customCeremonies.push(formData.ceremony);
                data.customCeremonies = customCeremonies;
                await saveData(data);
                setCeremonies([...new Set([...defaultCeremonies, ...customCeremonies])]);
            }
        }
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Add Event</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <SelectOrAddField
                        label="Ceremony"
                        value={formData.ceremony}
                        onChange={(val) => {
                            setFormData({ ...formData, ceremony: val });
                            if (!defaultCeremonies.includes(val) && !ceremonies.includes(val)) {
                                setCeremonies([...ceremonies, val]);
                            }
                        }}
                        options={ceremonies}
                        placeholder="Enter custom ceremony"
                    />
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input 
                            type="date"
                            className="form-input"
                            value={formData.date || ''}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">From Time</label>
                        <input 
                            type="time"
                            className="form-input"
                            value={formData.fromTime}
                            onChange={e => setFormData({ ...formData, fromTime: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">To Time</label>
                        <input 
                            type="time"
                            className="form-input"
                            value={formData.toTime}
                            onChange={e => setFormData({ ...formData, toTime: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea 
                            className="form-textarea"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Vendor Types</label>
                        <select 
                            multiple
                            className="form-select"
                            value={formData.vendorTypes || []}
                            onChange={handleVendorTypeChange}
                            style={{ height: '120px' }}
                        >
                            {[...vendorTypes].sort().map(type => (
                                <option key={type} value={type}>{type.replace('_', ' ')}</option>
                            ))}
                        </select>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Hold Ctrl/Cmd to select multiple</div>
                    </div>
                    {formData.vendorTypes && formData.vendorTypes.length > 0 && (
                        <div className="form-group">
                            <label className="form-label">Assign Vendors</label>
                            {formData.vendorTypes.map(type => {
                                const typeVendors = vendors.filter(v => v.type === type);
                                return (
                                    <div key={type} style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                                            {type.replace('_', ' ')}
                                        </label>
                                        <select
                                            multiple
                                            className="form-select"
                                            value={formData.assignedVendors?.[type] || []}
                                            onChange={e => handleVendorAssign(type, e)}
                                            style={{ height: '80px' }}
                                        >
                                            {typeVendors.sort((a, b) => a.name.localeCompare(b.name)).map(v => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Hold Ctrl/Cmd to select multiple</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save Event</button>
                </div>
            </div>
        </div>
    );
};