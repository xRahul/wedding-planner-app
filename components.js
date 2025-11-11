const { useState, useEffect, useMemo } = React;

// ==================== COMPONENTS ====================

        const Header = ({ weddingInfo }) => {
            return (
                <div className="header">
                    <h1>💒 {weddingInfo.brideName} &amp; {weddingInfo.groomName}'s Wedding</h1>
                    <p>{formatDate(weddingInfo.weddingDate)} • {weddingInfo.location}</p>
                </div>
            );
        };

        // ==================== TABS COMPONENT ====================

        const Tabs = ({ activeTab, setActiveTab }) => {
            const tabs = [
                { id: 'dashboard', label: '📊 Dashboard' },
                { id: 'timeline', label: '📅 Timeline' },
                { id: 'guests', label: '👥 Guests' },
                { id: 'vendors', label: '🤝 Vendors' },
                { id: 'budget', label: '💰 Budget' },
                { id: 'tasks', label: '✅ Tasks' },
                { id: 'menus', label: '🍽️ Menus' },
                { id: 'shopping', label: '🛍️ Shopping' },
                { id: 'rituals', label: '🪔 Rituals' },
                { id: 'gifts', label: '🎁 Gifts' },
                { id: 'travel', label: '✈️ Travel' },
                { id: 'settings', label: '⚙️ Settings' }
            ];

            return (
                <div className="tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            );
        };

        // ==================== DASHBOARD COMPONENT ====================

        const Dashboard = ({ data }) => {
            const stats = useMemo(() => {
                const totalGuests = data.guests.length;
                const confirmedGuests = data.guests.filter(g => g.rsvpStatus === 'yes').length;
                const totalBudgetSpent = data.budget.reduce((sum, cat) => sum + cat.actual, 0);
                const pendingTasks = data.tasks.filter(t => t.status === 'pending').length;
                const daysUntilWedding = Math.ceil((new Date(data.weddingInfo.weddingDate) - new Date()) / (1000 * 60 * 60 * 24));
                const budgetPercentage = (totalBudgetSpent / data.weddingInfo.totalBudget * 100).toFixed(1);

                return { totalGuests, confirmedGuests, totalBudgetSpent, pendingTasks, daysUntilWedding, budgetPercentage };
            }, [data]);

            return (
                <div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{stats.daysUntilWedding}</div>
                            <div className="stat-label">Days Until Wedding</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.confirmedGuests}/{stats.totalGuests}</div>
                            <div className="stat-label">Confirmed Guests</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.budgetPercentage}%</div>
                            <div className="stat-label">Budget Used</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.pendingTasks}</div>
                            <div className="stat-label">Pending Tasks</div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="card-title">Wedding Overview</h2>
                        <div className="grid-2">
                            <div>
                                <p><strong>Bride:</strong> {data.weddingInfo.brideName}</p>
                                <p><strong>Groom:</strong> {data.weddingInfo.groomName}</p>
                                <p><strong>Date:</strong> {formatDate(data.weddingInfo.weddingDate)}</p>
                                <p><strong>Location:</strong> {data.weddingInfo.location}</p>
                            </div>
                            <div>
                                <p><strong>Total Budget:</strong> {formatCurrency(data.weddingInfo.totalBudget)}</p>
                                <p><strong>Spent:</strong> {formatCurrency(stats.totalBudgetSpent)}</p>
                                <p><strong>Remaining:</strong> {formatCurrency(data.weddingInfo.totalBudget - stats.totalBudgetSpent)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="card-title">Budget Overview</h2>
                        {data.budget.map(cat => {
                            const percentage = cat.planned > 0 ? (cat.actual / cat.planned * 100) : 0;
                            return (
                                <div key={cat.category} style={{ marginBottom: '16px' }}>
                                    <div className="flex-between">
                                        <strong style={{ textTransform: 'capitalize' }}>{cat.category}</strong>
                                        <span>{formatCurrency(cat.actual)} / {formatCurrency(cat.planned)}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${Math.min(percentage, 100)}%` }}>
                                            {percentage > 10 && `${percentage.toFixed(0)}%`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="card">
                        <h2 className="card-title">Upcoming High Priority Tasks</h2>
                        {data.tasks.filter(t => t.status === 'pending' && t.priority === 'high').length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {data.tasks.filter(t => t.status === 'pending' && t.priority === 'high').map(task => (
                                    <li key={task.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <strong>{task.description}</strong>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                            Due: {formatDate(task.deadline)} • Assigned to: {task.assignedTo}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--color-text-secondary)' }}>No pending high priority tasks</p>
                        )}
                    </div>
                </div>
            );
        };

        // ==================== TIMELINE COMPONENT ====================

        const Timeline = ({ timeline, updateData, weddingDate }) => {
            const [editingEvent, setEditingEvent] = useState(null);
            const [showModal, setShowModal] = useState(false);
            const [vendors, setVendors] = useState([]);

            useEffect(() => {
                const loadVendors = async () => {
                    const data = await loadData();
                    setVendors(data.vendors || []);
                };
                loadVendors();
            }, []);

            const sortedTimeline = useMemo(() => {
                return [...timeline].sort((a, b) => a.dayOffset - b.dayOffset);
            }, [timeline]);

            const handleAddEvent = (dayOffset) => {
                const weddingDateObj = new Date(weddingDate);
                const eventDate = new Date(weddingDateObj);
                eventDate.setDate(eventDate.getDate() + dayOffset);
                
                setEditingEvent({
                    dayOffset,
                    date: eventDate.toISOString().split('T')[0],
                    fromTime: '10:00',
                    toTime: '12:00',
                    ceremony: 'Mehendi',
                    description: '',
                    vendorTypes: [],
                    assignedVendors: {}
                });
                setShowModal(true);
            };

            const handleSaveEvent = (event) => {
                try {
                    const errors = validateTimelineEvent(event);
                    if (errors) {
                        const errorMsg = Object.entries(errors).map(([field, msg]) => `${field}: ${msg}`).join('\n');
                        alert(`Please fix the following errors:\n\n${errorMsg}`);
                        return;
                    }

                    const weddingDateObj = new Date(weddingDate);
                    if (isNaN(weddingDateObj.getTime())) {
                        alert('Please set a valid wedding date in Settings first.');
                        return;
                    }
                    
                    if (!event.date) {
                        alert('Event date is required.');
                        return;
                    }

                    const eventDateObj = new Date(event.date);
                    if (isNaN(eventDateObj.getTime())) {
                        alert('Invalid event date. Please select a valid date.');
                        return;
                    }

                    const daysDiff = Math.round((eventDateObj - weddingDateObj) / (1000 * 60 * 60 * 24));
                    
                    const updatedTimeline = [...timeline];
                    
                    if (event.eventIndex !== undefined) {
                        const oldDayIndex = updatedTimeline.findIndex(d => d.dayOffset === event.dayOffset);
                        if (oldDayIndex >= 0) {
                            updatedTimeline[oldDayIndex].events.splice(event.eventIndex, 1);
                            if (updatedTimeline[oldDayIndex].events.length === 0) {
                                updatedTimeline.splice(oldDayIndex, 1);
                            }
                        }
                    }
                    
                    const dayIndex = updatedTimeline.findIndex(d => d.dayOffset === daysDiff);
                    const eventData = {
                        date: event.date || '',
                        fromTime: event.fromTime || '',
                        toTime: event.toTime || '',
                        ceremony: event.ceremony,
                        description: event.description,
                        vendorTypes: event.vendorTypes,
                        assignedVendors: event.assignedVendors
                    };
                    
                    if (dayIndex >= 0) {
                        if (!updatedTimeline[dayIndex].events) {
                            updatedTimeline[dayIndex].events = [];
                        }
                        updatedTimeline[dayIndex].events.push(eventData);
                    } else {
                        updatedTimeline.push({
                            dayOffset: daysDiff,
                            date: event.date,
                            events: [eventData]
                        });
                    }
                    
                    updateData('timeline', updatedTimeline);
                    setShowModal(false);
                    setEditingEvent(null);
                } catch (error) {
                    console.error('Error saving timeline event:', error);
                    alert(`Failed to save event: ${error.message}`);
                }
            };

            const handleEditEvent = (dayOffset, eventIndex) => {
                const day = timeline.find(d => d.dayOffset === dayOffset);
                if (day && day.events[eventIndex]) {
                    setEditingEvent({ ...day.events[eventIndex], dayOffset, eventIndex });
                    setShowModal(true);
                }
            };

            const handleDeleteEvent = (dayOffset, eventIndex) => {
                if (confirm('Delete this event?')) {
                    const updatedTimeline = [...timeline];
                    const dayIndex = updatedTimeline.findIndex(d => d.dayOffset === dayOffset);
                    if (dayIndex >= 0) {
                        updatedTimeline[dayIndex].events.splice(eventIndex, 1);
                        if (updatedTimeline[dayIndex].events.length === 0) {
                            updatedTimeline.splice(dayIndex, 1);
                        }
                        updateData('timeline', updatedTimeline);
                    }
                }
            };

            return (
                <div>
                    <div className="card">
                        <div className="flex-between">
                            <h2 className="card-title">Wedding Timeline</h2>
                            <button className="btn btn-primary" onClick={() => handleAddEvent(0)}>Add Event</button>
                        </div>
                    </div>

                    <div className="timeline-grid">
                        {sortedTimeline.map(day => (
                            <div key={day.dayOffset} className="timeline-day">
                                <div className="timeline-day-header">
                                    {getDayLabel(day.dayOffset)} - {formatDate(day.date)}
                                </div>
                                {day.events && day.events.length > 0 ? (
                                    day.events.map((event, idx) => (
                                        <div key={idx} className="timeline-event">
                                            <div className="flex-between">
                                                <div>
                                                    <strong style={{ fontSize: '16px' }}>{event.ceremony}</strong>
                                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                                        {event.fromTime && event.fromTime.trim() && `🕐 ${event.fromTime}`}
                                                        {event.toTime && event.toTime.trim() && ` - ${event.toTime}`}
                                                    </div>
                                                </div>
                                                <div>
                                                    <button 
                                                        className="btn btn-outline btn-small"
                                                        onClick={() => handleEditEvent(day.dayOffset, idx)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-small"
                                                        onClick={() => handleDeleteEvent(day.dayOffset, idx)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            {event.description && (
                                                <p style={{ margin: '8px 0', fontSize: '14px' }}>{event.description}</p>
                                            )}
                                            {event.vendorTypes && event.vendorTypes.length > 0 && (
                                                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                                                    <strong>Vendors:</strong>
                                                    <div style={{ marginTop: '4px' }}>
                                                        {event.vendorTypes.map(type => {
                                                            const assigned = event.assignedVendors?.[type] || [];
                                                            const vendorNames = (Array.isArray(assigned) ? assigned : [assigned])
                                                                .map(id => vendors.find(v => v.id === id)?.name)
                                                                .filter(Boolean);
                                                            return (
                                                                <div key={type} style={{ marginBottom: '2px' }}>
                                                                    <span style={{ textTransform: 'capitalize' }}>{type.replace('_', ' ')}:</span>{' '}
                                                                    {vendorNames.length > 0 ? (
                                                                        <span>{vendorNames.join(', ')}</span>
                                                                    ) : (
                                                                        <span style={{ color: 'var(--color-warning)', fontStyle: 'italic' }}>Not assigned yet</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                        No events scheduled
                                    </div>
                                )}
                                <button 
                                    className="btn btn-outline btn-small mt-lg"
                                    onClick={() => handleAddEvent(day.dayOffset)}
                                    style={{ width: '100%' }}
                                >
                                    Add Event to This Day
                                </button>
                            </div>
                        ))}
                    </div>

                    {showModal && (
                        <TimelineEventModal
                            event={editingEvent}
                            onSave={handleSaveEvent}
                            onClose={() => { setShowModal(false); setEditingEvent(null); }}
                            vendors={vendors}
                        />
                    )}
                </div>
            );
        };

        const TimelineEventModal = ({ event, onSave, onClose, vendors }) => {
            const [formData, setFormData] = useState(event);

            const ceremonies = [
                'Roka', 'Sagan', 'Tilak', 
                'Mehendi', 'Sangeet', 'Haldi', 
                'Ganesh Puja', 'Mandap Muhurat', 'Kalash Sthapna',
                'Baraat', 'Jaimala', 'Pheras', 
                'Vidai', 'Reception', 'Grih Pravesh'
            ];
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

            const handleSave = () => {
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
                                onChange={(val) => setFormData({ ...formData, ceremony: val })}
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
                                    {vendorTypes.map(type => (
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
                                                    {typeVendors.map(v => (
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

        // Reusable SelectOrAdd component
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

            const vendorTypes = [
                'pandit_ji', 'decorator', 'caterer', 'dj', 
                'photographer', 'videographer', 'florist', 
                'mehendi_artist', 'makeup_artist', 'choreographer',
                'band_baja', 'dhol_players', 'light_setup',
                'wedding_planner', 'invitation_cards', 'transport',
                'tent_house', 'sound_system', 'fireworks',
                'stage_setup', 'varmala_setup', 'luxury_car_rental'
            ];

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
                                onClick={() => onSave(formData)}
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

            const handleUpdate = (category, field, value) => {
                const updatedBudget = budget.map(cat => 
                    cat.category === category ? { ...cat, [field]: parseFloat(value) || 0 } : cat
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
                                onClick={() => {
                                    onSave(category.category, 'planned', planned);
                                    onSave(category.category, 'actual', actual);
                                }}
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
                            Export your wedding data as a JSON backup file, or import previously saved data.
                        </p>
                        <div>
                            <button className="btn btn-success" onClick={handleExport}>
                                📥 Export Data (Backup)
                            </button>
                            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                📤 Import Data
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    onChange={handleImport}
                                    style={{ display: 'none' }}
                                />
                            </label>
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

