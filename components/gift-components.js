const { useState, useEffect, useMemo } = React;

// ==================== GIFTS COMPONENT ====================

const Gifts = ({ giftsAndFavors, updateData, budget }) => {
    const [activeTab, setActiveTab] = useState('family');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const giftStats = useMemo(() => {
        const allGifts = [...(giftsAndFavors.familyGifts || []), ...(giftsAndFavors.returnGifts || []), ...(giftsAndFavors.specialGifts || [])];
        const totalCost = allGifts.reduce((sum, g) => sum + (g.totalCost || 0), 0);
        const totalQuantity = allGifts.reduce((sum, g) => sum + (g.quantity || 0), 0);
        const purchased = allGifts.filter(g => g.status === 'purchased' || g.status === 'delivered').length;
        const pending = allGifts.filter(g => g.status === 'pending').length;
        
        const byPayment = { bride: 0, groom: 0, split: 0, pending: 0 };
        allGifts.forEach(g => {
            const cost = g.totalCost || 0;
            if (g.paymentResponsibility === 'bride') byPayment.bride += cost;
            else if (g.paymentResponsibility === 'groom') byPayment.groom += cost;
            else if (g.paymentResponsibility === 'split') byPayment.split += cost;
            else byPayment.pending += cost;
        });
        
        const byEvent = {};
        allGifts.forEach(g => {
            if (g.event) {
                if (!byEvent[g.event]) byEvent[g.event] = { count: 0, cost: 0 };
                byEvent[g.event].count++;
                byEvent[g.event].cost += g.totalCost || 0;
            }
        });
        const topEvents = Object.entries(byEvent).sort((a, b) => b[1].cost - a[1].cost).slice(0, 5);
        
        const avgCostPerGift = allGifts.length > 0 ? totalCost / allGifts.length : 0;
        const completionRate = allGifts.length > 0 ? (purchased / allGifts.length * 100) : 0;
        
        return { totalCost, totalQuantity, purchased, pending, byPayment, byEvent, topEvents, avgCostPerGift, completionRate, totalItems: allGifts.length };
    }, [giftsAndFavors]);

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
            notes: '',
            budgetCategory: '' 
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
                        💝 Special Gifts ({calculateTotals('special').totalItems})
                    </button>
                    <button 
                        className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        📊 Analytics
                    </button>
                    <button className="btn btn-outline btn-small" onClick={() => setShowAnalytics(!showAnalytics)}>
                        {showAnalytics ? '📈 Hide Stats' : '📈 Show Stats'}
                    </button>
                </div>
            </div>

            {showAnalytics && activeTab !== 'analytics' && (
                <div className="card">
                    <h3>📈 Gift Statistics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{giftStats.totalItems}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Gifts</div>
                        </div>
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{giftStats.totalQuantity}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Quantity</div>
                        </div>
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(giftStats.totalCost)}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Cost</div>
                        </div>
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(giftStats.avgCostPerGift)}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Avg per Gift</div>
                        </div>
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)' }}>{giftStats.completionRate.toFixed(0)}%</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Completion Rate</div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>👰🤵 Payment Split</h4>
                            <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>👰 Bride:</span>
                                    <strong>{formatCurrency(giftStats.byPayment.bride)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>🤵 Groom:</span>
                                    <strong>{formatCurrency(giftStats.byPayment.groom)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>🤝 Split:</span>
                                    <strong>{formatCurrency(giftStats.byPayment.split)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>⏳ Pending:</span>
                                    <strong style={{ color: 'var(--color-warning)' }}>{formatCurrency(giftStats.byPayment.pending)}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>📦 Status Breakdown</h4>
                            <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>✅ Purchased:</span>
                                    <strong style={{ color: 'var(--color-success)' }}>{giftStats.purchased}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>⏳ Pending:</span>
                                    <strong style={{ color: 'var(--color-warning)' }}>{giftStats.pending}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Progress:</span>
                                    <strong>{giftStats.purchased}/{giftStats.totalItems}</strong>
                                </div>
                            </div>
                        </div>
                        
                        {giftStats.topEvents.length > 0 && (
                            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>🎉 Top Events by Cost</h4>
                                <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                                    {giftStats.topEvents.slice(0, 3).map(([event, info]) => (
                                        <div key={event} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span>{event}:</span>
                                            <strong>{formatCurrency(info.cost)}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                                        <th>Budget Category</th>
                                        <th>Payment Responsibility</th>
                                        <th>Paid By</th>
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
                                                {gift.budgetCategory ? (
                                                    <span className="badge badge-info">{gift.budgetCategory.replace(/_/g, ' ')}</span>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                {gift.paymentResponsibility ? (
                                                    <span className={`badge ${gift.paymentResponsibility === 'bride' ? 'badge-info' : gift.paymentResponsibility === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                        {gift.paymentResponsibility === 'bride' ? '👰 Bride' : gift.paymentResponsibility === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                {gift.paidBy && gift.paidBy !== 'pending' ? (
                                                    <span className={`badge ${gift.paidBy === 'bride' ? 'badge-info' : gift.paidBy === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                        {gift.paidBy === 'bride' ? '👰 Bride' : gift.paidBy === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                    </span>
                                                ) : <span className="badge badge-error">Pending</span>}
                                            </td>
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
                                        <th>Payment Responsibility</th>
                                        <th>Paid By</th>
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
                                                {gift.paymentResponsibility ? (
                                                    <span className={`badge ${gift.paymentResponsibility === 'bride' ? 'badge-info' : gift.paymentResponsibility === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                        {gift.paymentResponsibility === 'bride' ? '👰 Bride' : gift.paymentResponsibility === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                {gift.paidBy && gift.paidBy !== 'pending' ? (
                                                    <span className={`badge ${gift.paidBy === 'bride' ? 'badge-info' : gift.paidBy === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                        {gift.paidBy === 'bride' ? '👰 Bride' : gift.paidBy === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                    </span>
                                                ) : <span className="badge badge-error">Pending</span>}
                                            </td>
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
                                        <th>Payment Responsibility</th>
                                        <th>Paid By</th>
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
                                                {gift.paymentResponsibility ? (
                                                    <span className={`badge ${gift.paymentResponsibility === 'bride' ? 'badge-info' : gift.paymentResponsibility === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                        {gift.paymentResponsibility === 'bride' ? '👰 Bride' : gift.paymentResponsibility === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                {gift.paidBy && gift.paidBy !== 'pending' ? (
                                                    <span className={`badge ${gift.paidBy === 'bride' ? 'badge-info' : gift.paidBy === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                        {gift.paidBy === 'bride' ? '👰 Bride' : gift.paidBy === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                    </span>
                                                ) : <span className="badge badge-error">Pending</span>}
                                            </td>
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

            {activeTab === 'analytics' && (
                <div className="card">
                    <h3>Gift Analytics & North Indian Traditions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-primary)' }}>Traditional Guidelines</h4>
                            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                • <strong>Shagun amounts:</strong> ₹51, ₹101, ₹501, ₹1001<br/>
                                • <strong>Gold coins:</strong> Auspicious for family gifts<br/>
                                • <strong>Dry fruits:</strong> Traditional return gifts<br/>
                                • <strong>Silver items:</strong> Considered pure and blessed<br/>
                                • <strong>Coconut + Supari:</strong> Essential in gift boxes
                            </div>
                        </div>
                        
                        <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-primary)' }}>Budget Summary</h4>
                            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                • Family gifts: {formatCurrency(calculateTotals('family').totalCost)}<br/>
                                • Return gifts: {formatCurrency(calculateTotals('return').totalCost)}<br/>
                                • Special gifts: {formatCurrency(calculateTotals('special').totalCost)}<br/>
                                • Total items: {calculateTotals('family').totalItems + calculateTotals('return').totalItems + calculateTotals('special').totalItems}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModal && <GiftModal item={editingItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditingItem(null); }} budget={budget} />}
        </div>
    );
};

const GiftModal = ({ item, onSave, onClose, budget }) => {
    const [formData, setFormData] = useState(item);
    
    const budgetCategories = budget?.map(b => ({
        value: b.category,
        label: b.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    })) || [];
    const defaultEvents = [
        'Roka', 'Sagan', 'Tilak', 'Ring Ceremony',
        'Mehendi', 'Sangeet', 'Haldi', 
        'Ganesh Puja', 'Kalash Sthapna', 'Mandap Muhurat',
        'Baraat', 'Jaimala', 'Pheras', 'Vidai', 
        'Reception', 'Grih Pravesh', 'Pag Phera'
    ];
    const [northIndianEvents, setNorthIndianEvents] = useState(defaultEvents);

    useEffect(() => {
        const loadCustomEvents = async () => {
            const data = await loadData();
            if (data.customGiftEvents && data.customGiftEvents.length > 0) {
                const allEvents = [...new Set([...defaultEvents, ...data.customGiftEvents])];
                setNorthIndianEvents(allEvents);
            }
        };
        loadCustomEvents();
    }, []);

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

    const handleSaveWithCustomEvent = async () => {
        if (formData.event && !defaultEvents.includes(formData.event)) {
            const data = await loadData();
            const customEvents = data.customGiftEvents || [];
            if (!customEvents.includes(formData.event)) {
                customEvents.push(formData.event);
                data.customGiftEvents = customEvents;
                await saveData(data);
                setNorthIndianEvents([...new Set([...defaultEvents, ...customEvents])]);
            }
        }
        onSave(formData);
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
                        onChange={(val) => {
                            setFormData({ ...formData, event: val });
                            if (!defaultEvents.includes(val) && !northIndianEvents.includes(val)) {
                                setNorthIndianEvents([...northIndianEvents, val]);
                            }
                        }}
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
                        onClick={handleSaveWithCustomEvent} 
                        disabled={!formData.giftName}
                    >
                        Save Gift
                    </button>
                </div>
            </div>
        </div>
    );
};