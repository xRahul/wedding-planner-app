const { useState, useEffect, useMemo } = React;

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
                            [...day.events].sort((a, b) => (a.fromTime || '').localeCompare(b.fromTime || '')).map((event, idx) => (
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
                                                {event.vendorTypes.sort().map(type => {
                                                    const assigned = event.assignedVendors?.[type] || [];
                                                    const vendorNames = (Array.isArray(assigned) ? assigned : [assigned])
                                                        .map(id => vendors.find(v => v.id === id)?.name)
                                                        .filter(Boolean)
                                                        .sort();
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