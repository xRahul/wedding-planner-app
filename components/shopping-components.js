const { useState, useEffect, useMemo } = React;

// ==================== SHOPPING COMPONENT ====================

        const Shopping = ({ shopping, updateData, budget }) => {
            const [activeCategory, setActiveCategory] = useState('bride');
            const [showModal, setShowModal] = useState(false);
            const [editingItem, setEditingItem] = useState(null);
            const [editingEvent, setEditingEvent] = useState(null);
            const [showAnalytics, setShowAnalytics] = useState(false);

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
                        <div className="flex-between">
                            <h2 className="card-title">Shopping List</h2>
                            <button className="btn btn-outline btn-small" onClick={() => setShowAnalytics(!showAnalytics)}>
                                {showAnalytics ? '📊 Hide Analytics' : '📊 Show Analytics'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
                            <button 
                                className={`btn ${activeCategory === 'bride' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveCategory('bride')}
                            >
                                👰 Bride ({shopping.bride?.reduce((sum, e) => sum + e.items.length, 0) || 0} items)
                            </button>
                            <button 
                                className={`btn ${activeCategory === 'groom' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveCategory('groom')}
                            >
                                🤵 Groom ({shopping.groom?.reduce((sum, e) => sum + e.items.length, 0) || 0} items)
                            </button>
                            <button 
                                className={`btn ${activeCategory === 'family' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveCategory('family')}
                            >
                                👨‍👩‍👧‍👦 Family ({shopping.family?.reduce((sum, e) => sum + e.items.length, 0) || 0} items)
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Budget</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(totalBudget)}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Items</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    {Object.values(shopping).reduce((sum, category) => sum + category.reduce((catSum, event) => catSum + event.items.length, 0), 0)}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Completed</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-success)' }}>
                                    {Object.values(shopping).reduce((sum, category) => sum + category.reduce((catSum, event) => catSum + event.items.filter(i => i.status === 'completed').length, 0), 0)}
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Pending</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-warning)' }}>
                                    {Object.values(shopping).reduce((sum, category) => sum + category.reduce((catSum, event) => catSum + event.items.filter(i => i.status === 'pending').length, 0), 0)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {showAnalytics && <ShoppingAnalytics shopping={shopping} />}

                    {shopping[activeCategory].map(event => (
                        <div key={event.event} className="card">
                            <div className="flex-between">
                                <div>
                                    <h3>{event.event}</h3>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        {event.items.length} items • {formatCurrency(event.items.reduce((sum, item) => sum + (item.budget || 0), 0))} budget
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                        className="btn btn-outline btn-small"
                                        onClick={() => {
                                            const templates = {
                                                bride: {
                                                    'Mehendi': [{ item: 'Mehendi Lehenga', budget: 25000, status: 'pending', notes: 'Green or yellow color' }, { item: 'Mehendi Jewelry', budget: 15000, status: 'pending', notes: 'Floral jewelry' }],
                                                    'Sangeet': [{ item: 'Sangeet Outfit', budget: 20000, status: 'pending', notes: 'Dance-friendly outfit' }, { item: 'Dancing Shoes', budget: 3000, status: 'pending', notes: 'Comfortable heels' }],
                                                    'Wedding': [{ item: 'Bridal Lehenga', budget: 80000, status: 'pending', notes: 'Red or maroon traditional' }, { item: 'Bridal Jewelry Set', budget: 150000, status: 'pending', notes: 'Gold jewelry set' }],
                                                    'Reception': [{ item: 'Reception Gown/Saree', budget: 35000, status: 'pending', notes: 'Designer outfit' }, { item: 'Reception Jewelry', budget: 25000, status: 'pending', notes: 'Diamond or gold' }]
                                                },
                                                groom: {
                                                    'Sangeet': [{ item: 'Sangeet Kurta', budget: 8000, status: 'pending', notes: 'Colorful kurta pajama' }, { item: 'Mojaris', budget: 4000, status: 'pending', notes: 'Traditional footwear' }],
                                                    'Wedding': [{ item: 'Wedding Sherwani', budget: 25000, status: 'pending', notes: 'Cream or gold sherwani' }, { item: 'Sehra', budget: 2000, status: 'pending', notes: 'Groom\'s face veil' }, { item: 'Kalgi', budget: 1500, status: 'pending', notes: 'Turban ornament' }],
                                                    'Reception': [{ item: 'Reception Suit', budget: 15000, status: 'pending', notes: 'Western or Indo-western' }]
                                                },
                                                family: {
                                                    'General': [{ item: 'Family Coordination Outfits', budget: 50000, status: 'pending', notes: 'Matching color theme' }, { item: 'Gift Wrapping Supplies', budget: 5000, status: 'pending', notes: 'For shagun and gifts' }]
                                                }
                                            };
                                            const categoryItems = templates[activeCategory]?.[event.event] || [];
                                            if (categoryItems.length > 0) {
                                                const newShopping = { ...shopping };
                                                const categoryEvent = newShopping[activeCategory].find(e => e.event === event.event);
                                                if (categoryEvent) {
                                                    categoryEvent.items = [...categoryEvent.items, ...categoryItems];
                                                    updateData('shopping', newShopping);
                                                }
                                            }
                                        }}
                                    >
                                        Add Templates
                                    </button>
                                    <button 
                                        className="btn btn-primary btn-small"
                                        onClick={() => handleAddItem(activeCategory, event.event)}
                                    >
                                        Add Custom Item
                                    </button>
                                </div>
                            </div>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Budget</th>
                                            <th>Budget Category</th>
                                            <th>Payment Responsibility</th>
                                            <th>Paid By</th>
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
                                                    {item.budgetCategory ? (
                                                        <span className="badge badge-info">{item.budgetCategory.replace(/_/g, ' ')}</span>
                                                    ) : '-'}
                                                </td>
                                                <td>
                                                    {item.paymentResponsibility ? (
                                                        <span className={`badge ${item.paymentResponsibility === 'bride' ? 'badge-info' : item.paymentResponsibility === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                            {item.paymentResponsibility === 'bride' ? '👰 Bride' : item.paymentResponsibility === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td>
                                                    {item.paidBy && item.paidBy !== 'pending' ? (
                                                        <span className={`badge ${item.paidBy === 'bride' ? 'badge-info' : item.paidBy === 'groom' ? 'badge-success' : 'badge-warning'}`}>
                                                            {item.paidBy === 'bride' ? '👰 Bride' : item.paidBy === 'groom' ? '🤵 Groom' : '🤝 Split'}
                                                        </span>
                                                    ) : <span className="badge badge-error">Pending</span>}
                                                </td>
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
                            budget={budget}
                        />
                    )}
                </div>
            );
        };

        const ShoppingItemModal = ({ item, onSave, onClose, category, budget }) => {
            const [formData, setFormData] = useState(item || {
                item: '',
                budget: 0,
                budgetCategory: '',
                status: 'pending',
                notes: ''
            });
            
            const budgetCategories = budget?.map(b => ({
                value: b.category,
                label: b.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            })) || [];

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