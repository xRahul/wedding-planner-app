const { useState, useEffect, useMemo } = React;

// ==================== BUDGET COMPONENT ====================

const Budget = ({ budget, updateData, totalBudget, allData }) => {
    const [editingCategory, setEditingCategory] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

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
    
    const addWeddingCategories = () => {
        const weddingCategories = [
            { category: 'venue_mandap', planned: 0, actual: 0 },
            { category: 'pandit_ceremonies', planned: 0, actual: 0 },
            { category: 'catering_food', planned: 0, actual: 0 },
            { category: 'decoration_flowers', planned: 0, actual: 0 },
            { category: 'photography_videography', planned: 0, actual: 0 },
            { category: 'music_entertainment', planned: 0, actual: 0 },
            { category: 'bridal_makeup_mehendi', planned: 0, actual: 0 },
            { category: 'groom_accessories', planned: 0, actual: 0 },
            { category: 'transport_baraat', planned: 0, actual: 0 },
            { category: 'gifts_favors', planned: 0, actual: 0 },
            { category: 'ritual_items', planned: 0, actual: 0 },
            { category: 'accommodation_guests', planned: 0, actual: 0 }
        ];
        
        const existingCategories = budget.map(b => b.category);
        const newCategories = weddingCategories.filter(cat => !existingCategories.includes(cat.category));
        
        if (newCategories.length > 0) {
            const updatedBudget = [...budget, ...newCategories];
            updateData('budget', updatedBudget);
        }
    };

    const handleRemoveCategory = (category) => {
        if (confirm(`Delete ${category} category?`)) {
            updateData('budget', budget.filter(cat => cat.category !== category));
        }
    };

    // Calculate linked items from all entities
    const linkedItems = useMemo(() => {
        const items = {};
        
        // Vendors: estimatedCost -> expected, finalCost -> actual
        allData?.vendors?.forEach(v => {
            if (v.budgetCategory) {
                if (!items[v.budgetCategory]) items[v.budgetCategory] = [];
                items[v.budgetCategory].push({
                    type: 'Vendor',
                    name: v.name,
                    expected: v.estimatedCost || 0,
                    actual: v.finalCost || 0,
                    paymentResponsibility: v.paymentResponsibility
                });
            }
        });
        
        // Menus: pricePerPlate * expectedGuests -> expected, pricePerPlate * attendedGuests -> actual
        allData?.menus?.forEach(m => {
            m.items?.forEach(item => {
                const category = item.budgetCategory || m.budgetCategory;
                if (category) {
                    if (!items[category]) items[category] = [];
                    const expected = (item.pricePerPlate || 0) * (m.expectedGuests || 0);
                    const actual = (item.pricePerPlate || 0) * (m.attendedGuests || 0);
                    items[category].push({
                        type: 'Menu',
                        name: `${m.name} - ${item.name}`,
                        expected: expected,
                        actual: actual,
                        paymentResponsibility: item.paymentResponsibility
                    });
                }
            });
        });
        
        // Gifts: totalCost for both expected and actual
        ['familyGifts', 'returnGifts', 'specialGifts'].forEach(giftType => {
            allData?.giftsAndFavors?.[giftType]?.forEach(g => {
                if (g.budgetCategory) {
                    if (!items[g.budgetCategory]) items[g.budgetCategory] = [];
                    const cost = g.totalCost || 0;
                    items[g.budgetCategory].push({
                        type: 'Gift',
                        name: g.recipient || g.giftName || 'Gift',
                        expected: cost,
                        actual: cost,
                        paymentResponsibility: g.paymentResponsibility
                    });
                }
            });
        });
        
        // Shopping: budget field for both expected and actual
        ['bride', 'groom', 'family'].forEach(shopType => {
            allData?.shopping?.[shopType]?.forEach(list => {
                list.items?.forEach(item => {
                    if (item.budgetCategory) {
                        if (!items[item.budgetCategory]) items[item.budgetCategory] = [];
                        items[item.budgetCategory].push({
                            type: 'Shopping',
                            name: `${shopType} - ${item.item}`,
                            expected: item.budget || 0,
                            actual: item.budget || 0,
                            paymentResponsibility: item.paymentResponsibility
                        });
                    }
                });
            });
        });
        
        // Travel: totalPrice -> expected and actual
        allData?.travel?.transport?.forEach(t => {
            if (t.budgetCategory) {
                if (!items[t.budgetCategory]) items[t.budgetCategory] = [];
                items[t.budgetCategory].push({
                    type: 'Transport',
                    name: t.vehicleType,
                    expected: t.totalPrice || 0,
                    actual: t.totalPrice || 0,
                    paymentResponsibility: t.paymentResponsibility
                });
            }
        });
        
        return items;
    }, [allData]);

    const totals = useMemo(() => {
        const totalPlanned = budget.reduce((sum, cat) => sum + (cat.planned || 0), 0);
        const totalManualActual = budget.reduce((sum, cat) => sum + (cat.actual || 0), 0);
        
        // Calculate expected and actual from linked items by side
        let totalExpected = 0;
        let totalLinkedActual = 0;
        let brideExpected = 0;
        let brideActual = 0;
        let groomExpected = 0;
        let groomActual = 0;
        
        Object.values(linkedItems).forEach(items => {
            items.forEach(item => {
                totalExpected += item.expected || 0;
                totalLinkedActual += item.actual || 0;
                
                if (item.paymentResponsibility === 'bride') {
                    brideExpected += item.expected || 0;
                    brideActual += item.actual || 0;
                } else if (item.paymentResponsibility === 'groom') {
                    groomExpected += item.expected || 0;
                    groomActual += item.actual || 0;
                } else if (item.paymentResponsibility === 'split') {
                    const halfExpected = (item.expected || 0) / 2;
                    const halfActual = (item.actual || 0) / 2;
                    brideExpected += halfExpected;
                    brideActual += halfActual;
                    groomExpected += halfExpected;
                    groomActual += halfActual;
                }
            });
        });
        
        const totalActual = totalManualActual + totalLinkedActual;
        const remaining = totalBudget - totalActual;
        const brideRemaining = (allData?.weddingInfo?.brideBudget || 0) - brideActual;
        const groomRemaining = (allData?.weddingInfo?.groomBudget || 0) - groomActual;
        
        return { 
            totalPlanned, totalManualActual, totalExpected, totalLinkedActual, totalActual, remaining,
            brideExpected, brideActual, brideRemaining,
            groomExpected, groomActual, groomRemaining
        };
    }, [budget, totalBudget, linkedItems, allData]);

    return (
        <div>
            <div className="card">
                <div className="flex-between">
                    <h2 className="card-title">Budget Tracker</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline btn-small" onClick={addWeddingCategories}>Add Wedding Categories</button>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add Category</button>
                    </div>
                </div>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{formatCurrency(totalBudget)}</div>
                        <div className="stat-label">Total Budget</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{formatCurrency(totals.totalActual)}</div>
                        <div className="stat-label">Total Spent</div>
                    </div>
                    <div className="stat-card" style={{ background: totals.remaining < 0 ? 'rgba(220, 53, 69, 0.1)' : 'var(--color-bg-secondary)' }}>
                        <div className="stat-value" style={{ color: totals.remaining >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                            {formatCurrency(totals.remaining)}
                        </div>
                        <div className="stat-label">Remaining</div>
                        {totals.remaining < 0 && (
                            <div style={{ fontSize: '10px', color: 'var(--color-error)', marginTop: '4px' }}>Over Budget!</div>
                        )}
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    <div style={{ padding: '16px', background: 'rgba(74, 144, 226, 0.1)', borderRadius: '8px', border: '2px solid var(--color-info)' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-info)' }}>👰 Bride Side Budget</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Budget</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(allData?.weddingInfo?.brideBudget || 0)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Spent</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(totals.brideActual)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Remaining</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: totals.brideRemaining >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                    {formatCurrency(totals.brideRemaining)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Used</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    {(allData?.weddingInfo?.brideBudget || 0) > 0 ? ((totals.brideActual / (allData?.weddingInfo?.brideBudget || 1)) * 100).toFixed(1) : 0}%
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ padding: '16px', background: 'rgba(39, 174, 96, 0.1)', borderRadius: '8px', border: '2px solid var(--color-success)' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-success)' }}>🤵 Groom Side Budget</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Budget</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(allData?.weddingInfo?.groomBudget || 0)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Spent</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(totals.groomActual)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Remaining</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: totals.groomRemaining >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                    {formatCurrency(totals.groomRemaining)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Used</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    {(allData?.weddingInfo?.groomBudget || 0) > 0 ? ((totals.groomActual / (allData?.weddingInfo?.groomBudget || 1)) * 100).toFixed(1) : 0}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Budget Insights */}
                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Budget Breakdown</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
                        <div>Linked Items: {Object.values(linkedItems).reduce((sum, items) => sum + items.length, 0)} total</div>
                        <div>Categories: {budget.length} total</div>
                        <div>Manual Actual: {formatCurrency(totals.totalManualActual)}</div>
                        <div>Linked Actual: {formatCurrency(totals.totalLinkedActual)}</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">Budget by Category</h3>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Category / Item</th>
                                <th>Planned</th>
                                <th>Expected</th>
                                <th>Actual</th>
                                <th>% of Budget</th>
                                <th>Progress</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budget.map(cat => {
                                const catLinkedItems = linkedItems[cat.category] || [];
                                const linkedExpected = catLinkedItems.reduce((sum, item) => sum + (item.expected || 0), 0);
                                const linkedActual = catLinkedItems.reduce((sum, item) => sum + (item.actual || 0), 0);
                                const totalActual = (cat.actual || 0) + linkedActual;
                                const totalExpected = linkedExpected;
                                const percentage = cat.planned > 0 ? (totalActual / cat.planned * 100) : 0;
                                const isExpanded = expandedCategories[cat.category];
                                
                                return (
                                    <React.Fragment key={cat.category}>
                                        <tr style={{ background: 'var(--color-bg-secondary)', fontWeight: 600, cursor: catLinkedItems.length > 0 ? 'pointer' : 'default' }}
                                            onClick={() => catLinkedItems.length > 0 && toggleCategory(cat.category)}>
                                            <td style={{ textTransform: 'capitalize' }}>
                                                {catLinkedItems.length > 0 && (
                                                    <span style={{ marginRight: '8px', fontSize: '12px' }}>{isExpanded ? '▼' : '▶'}</span>
                                                )}
                                                {cat.category.replace(/_/g, ' ')}
                                                {catLinkedItems.length > 0 && (
                                                    <span style={{ fontSize: '11px', marginLeft: '8px', color: 'var(--color-text-secondary)' }}>({catLinkedItems.length} items)</span>
                                                )}
                                            </td>
                                            <td>{formatCurrency(cat.planned || 0)}</td>
                                            <td>{formatCurrency(totalExpected)}</td>
                                            <td>{formatCurrency(totalActual)}</td>
                                            <td>{totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(1) : 0}%</td>
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
                                            <td onClick={e => e.stopPropagation()}>
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
                                        {isExpanded && catLinkedItems.map((item, idx) => (
                                            <tr key={`${cat.category}-${idx}`} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', background: '#fafafa' }}>
                                                <td style={{ paddingLeft: '40px' }}>
                                                    <span className="badge badge-info" style={{ fontSize: '10px', marginRight: '6px' }}>{item.type}</span>
                                                    {item.name}
                                                </td>
                                                <td>-</td>
                                                <td>{formatCurrency(item.expected || 0)}</td>
                                                <td>{formatCurrency(item.actual || 0)}</td>
                                                <td>-</td>
                                                <td>-</td>
                                                <td>-</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
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