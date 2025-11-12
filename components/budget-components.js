const { useState, useEffect, useMemo } = React;

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
                        <div className="stat-label">Spent</div>
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
                    <div className="stat-card" style={{ background: ((totals.totalActual / totalBudget) * 100) > 90 ? 'rgba(255, 193, 7, 0.1)' : 'var(--color-bg-secondary)' }}>
                        <div className="stat-value" style={{ color: ((totals.totalActual / totalBudget) * 100) > 90 ? 'var(--color-warning)' : 'inherit' }}>
                            {((totals.totalActual / totalBudget) * 100).toFixed(1)}%
                        </div>
                        <div className="stat-label">Budget Used</div>
                        {((totals.totalActual / totalBudget) * 100) > 90 && (
                            <div style={{ fontSize: '10px', color: 'var(--color-warning)', marginTop: '4px' }}>Nearing Limit</div>
                        )}
                    </div>
                </div>
                
                {/* Budget Insights */}
                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Budget Insights</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
                        <div>Top Expense: {budget.length > 0 ? budget.reduce((max, cat) => cat.actual > max.actual ? cat : max, budget[0]).category.replace('_', ' ') : 'None'}</div>
                        <div>Categories: {budget.length} total</div>
                        <div>Avg per category: {formatCurrency(budget.length > 0 ? totals.totalActual / budget.length : 0)}</div>
                        <div>Budget utilization: {budget.filter(cat => cat.actual > 0).length}/{budget.length} categories used</div>
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