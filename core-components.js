const { useState, useEffect, useMemo } = React;

const Header = ({ weddingInfo }) => {
    return (
        <div className="header">
            <h1>💒 {weddingInfo.brideName} &amp; {weddingInfo.groomName}'s Wedding</h1>
            <p>{formatDate(weddingInfo.weddingDate)} • {weddingInfo.location}</p>
        </div>
    );
};

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
