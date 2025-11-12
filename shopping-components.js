const { useState, useEffect, useMemo } = React;

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