// Enhanced Analytics Components for All Features
const { useMemo } = React;

// Task Analytics Component
const TaskAnalytics = ({ tasks }) => {
    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'done').length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        const overdue = tasks.filter(t => t.status === 'pending' && t.deadline && new Date(t.deadline) < new Date()).length;
        
        const byPriority = { high: 0, medium: 0, low: 0 };
        const completedByPriority = { high: 0, medium: 0, low: 0 };
        tasks.forEach(t => {
            byPriority[t.priority]++;
            if (t.status === 'done') completedByPriority[t.priority]++;
        });
        
        const byCategory = {};
        tasks.forEach(t => {
            if (!byCategory[t.category]) byCategory[t.category] = { total: 0, completed: 0 };
            byCategory[t.category].total++;
            if (t.status === 'done') byCategory[t.category].completed++;
        });
        
        const upcomingWeek = tasks.filter(t => {
            if (t.status === 'pending' && t.deadline) {
                const diff = (new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 7;
            }
            return false;
        }).length;
        
        const completionRate = total > 0 ? (completed / total * 100) : 0;
        
        return { total, completed, pending, overdue, byPriority, completedByPriority, byCategory, upcomingWeek, completionRate };
    }, [tasks]);
    
    return (
        <div className="card">
            <h3>📊 Task Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-success)' }}>{stats.completionRate.toFixed(0)}%</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Completion Rate</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.completed}/{stats.total}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Tasks Done</div>
                </div>
                <div style={{ padding: '12px', background: stats.overdue > 0 ? 'rgba(220, 53, 69, 0.1)' : 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: stats.overdue > 0 ? 'var(--color-error)' : 'inherit' }}>{stats.overdue}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Overdue</div>
                </div>
                <div style={{ padding: '12px', background: stats.upcomingWeek > 5 ? 'rgba(255, 193, 7, 0.1)' : 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: stats.upcomingWeek > 5 ? 'var(--color-warning)' : 'inherit' }}>{stats.upcomingWeek}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Due This Week</div>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>🎯 Priority Breakdown</h4>
                    {['high', 'medium', 'low'].map(p => (
                        <div key={p} style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                <span style={{ textTransform: 'capitalize' }}>{p}</span>
                                <span>{stats.completedByPriority[p]}/{stats.byPriority[p]}</span>
                            </div>
                            <div className="progress-bar" style={{ height: '6px' }}>
                                <div className="progress-fill" style={{ width: `${stats.byPriority[p] > 0 ? (stats.completedByPriority[p] / stats.byPriority[p] * 100) : 0}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>📂 Category Progress</h4>
                    <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                        {Object.entries(stats.byCategory).slice(0, 5).map(([cat, info]) => (
                            <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ textTransform: 'capitalize' }}>{cat}:</span>
                                <strong>{info.completed}/{info.total}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Shopping Analytics Component
const ShoppingAnalytics = ({ shopping }) => {
    const stats = useMemo(() => {
        const allItems = [
            ...(shopping.bride?.flatMap(s => s.items) || []),
            ...(shopping.groom?.flatMap(s => s.items) || []),
            ...(shopping.family?.flatMap(s => s.items) || [])
        ];
        
        const totalItems = allItems.length;
        const totalBudget = allItems.reduce((sum, i) => sum + (i.budget || 0), 0);
        const completed = allItems.filter(i => i.status === 'completed').length;
        const pending = allItems.filter(i => i.status === 'pending').length;
        const ordered = allItems.filter(i => i.status === 'ordered').length;
        
        const byPayment = { bride: 0, groom: 0, split: 0, pending: 0 };
        allItems.forEach(i => {
            const cost = i.budget || 0;
            if (i.paymentResponsibility === 'bride') byPayment.bride += cost;
            else if (i.paymentResponsibility === 'groom') byPayment.groom += cost;
            else if (i.paymentResponsibility === 'split') byPayment.split += cost;
            else byPayment.pending += cost;
        });
        
        const brideItems = shopping.bride?.flatMap(s => s.items).length || 0;
        const groomItems = shopping.groom?.flatMap(s => s.items).length || 0;
        const familyItems = shopping.family?.flatMap(s => s.items).length || 0;
        
        const completionRate = totalItems > 0 ? (completed / totalItems * 100) : 0;
        
        return { totalItems, totalBudget, completed, pending, ordered, byPayment, brideItems, groomItems, familyItems, completionRate };
    }, [shopping]);
    
    return (
        <div className="card">
            <h3>🛍️ Shopping Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalItems}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Items</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(stats.totalBudget)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Budget</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)' }}>{stats.completionRate.toFixed(0)}%</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Completion Rate</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.completed}/{stats.totalItems}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Completed</div>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>👰🤵 Shopping Distribution</h4>
                    <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>👰 Bride Items:</span>
                            <strong>{stats.brideItems}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🤵 Groom Items:</span>
                            <strong>{stats.groomItems}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>👨‍👩‍👧‍👦 Family Items:</span>
                            <strong>{stats.familyItems}</strong>
                        </div>
                    </div>
                </div>
                
                <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>💰 Payment Split</h4>
                    <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>👰 Bride:</span>
                            <strong>{formatCurrency(stats.byPayment.bride)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🤵 Groom:</span>
                            <strong>{formatCurrency(stats.byPayment.groom)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🤝 Split:</span>
                            <strong>{formatCurrency(stats.byPayment.split)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>⏳ Pending:</span>
                            <strong style={{ color: 'var(--color-warning)' }}>{formatCurrency(stats.byPayment.pending)}</strong>
                        </div>
                    </div>
                </div>
                
                <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>📦 Status Breakdown</h4>
                    <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>✅ Completed:</span>
                            <strong style={{ color: 'var(--color-success)' }}>{stats.completed}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>📦 Ordered:</span>
                            <strong style={{ color: 'var(--color-info)' }}>{stats.ordered}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>⏳ Pending:</span>
                            <strong style={{ color: 'var(--color-warning)' }}>{stats.pending}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Travel Analytics Component
const TravelAnalytics = ({ travel }) => {
    const stats = useMemo(() => {
        const transport = travel?.transport || [];
        const totalVehicles = transport.length;
        const totalSeats = transport.reduce((sum, t) => sum + (t.seats || 0), 0);
        const totalCost = transport.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
        const totalKm = transport.reduce((sum, t) => sum + (t.kilometers || 0), 0);
        
        const byType = {};
        transport.forEach(t => {
            if (!byType[t.vehicleType]) byType[t.vehicleType] = { count: 0, seats: 0, cost: 0 };
            byType[t.vehicleType].count++;
            byType[t.vehicleType].seats += t.seats || 0;
            byType[t.vehicleType].cost += t.totalPrice || 0;
        });
        
        const byPayment = { bride: 0, groom: 0, split: 0, pending: 0 };
        transport.forEach(t => {
            const cost = t.totalPrice || 0;
            if (t.paymentResponsibility === 'bride') byPayment.bride += cost;
            else if (t.paymentResponsibility === 'groom') byPayment.groom += cost;
            else if (t.paymentResponsibility === 'split') byPayment.split += cost;
            else byPayment.pending += cost;
        });
        
        const costPerKm = totalKm > 0 ? totalCost / totalKm : 0;
        const costPerSeat = totalSeats > 0 ? totalCost / totalSeats : 0;
        const avgSeatsPerVehicle = totalVehicles > 0 ? totalSeats / totalVehicles : 0;
        
        return { totalVehicles, totalSeats, totalCost, totalKm, byType, byPayment, costPerKm, costPerSeat, avgSeatsPerVehicle };
    }, [travel]);
    
    return (
        <div className="card">
            <h3>🚌 Travel Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalVehicles}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Vehicles</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalSeats}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Seats</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(stats.totalCost)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Cost</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalKm}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Kilometers</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(stats.costPerKm)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Cost per KM</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(stats.costPerSeat)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Cost per Seat</div>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>🚗 Vehicle Types</h4>
                    <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                        {Object.entries(stats.byType).map(([type, info]) => (
                            <div key={type} style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ textTransform: 'capitalize' }}>{type.replace('_', ' ')}:</span>
                                    <strong>{info.count} ({info.seats} seats)</strong>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                    Cost: {formatCurrency(info.cost)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>💰 Payment Split</h4>
                    <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>👰 Bride:</span>
                            <strong>{formatCurrency(stats.byPayment.bride)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🤵 Groom:</span>
                            <strong>{formatCurrency(stats.byPayment.groom)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🤝 Split:</span>
                            <strong>{formatCurrency(stats.byPayment.split)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>⏳ Pending:</span>
                            <strong style={{ color: 'var(--color-warning)' }}>{formatCurrency(stats.byPayment.pending)}</strong>
                        </div>
                    </div>
                </div>
                
                <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>📊 Averages</h4>
                    <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Seats per vehicle:</span>
                            <strong>{stats.avgSeatsPerVehicle.toFixed(1)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Cost per vehicle:</span>
                            <strong>{formatCurrency(stats.totalVehicles > 0 ? stats.totalCost / stats.totalVehicles : 0)}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Ritual Analytics Component
const RitualAnalytics = ({ ritualsAndCustoms }) => {
    const stats = useMemo(() => {
        const preWedding = ritualsAndCustoms?.preWedding || [];
        const mainCeremonies = ritualsAndCustoms?.mainCeremonies || [];
        const allRituals = [...preWedding, ...mainCeremonies];
        
        const totalRituals = allRituals.length;
        const completed = allRituals.filter(r => r.completed).length;
        const pending = totalRituals - completed;
        
        const preWeddingCompleted = preWedding.filter(r => r.completed).length;
        const mainCompleted = mainCeremonies.filter(r => r.completed).length;
        
        const completionRate = totalRituals > 0 ? (completed / totalRituals * 100) : 0;
        const preWeddingRate = preWedding.length > 0 ? (preWeddingCompleted / preWedding.length * 100) : 0;
        const mainRate = mainCeremonies.length > 0 ? (mainCompleted / mainCeremonies.length * 100) : 0;
        
        const totalItems = allRituals.reduce((sum, r) => sum + (r.items?.length || 0), 0);
        
        return { totalRituals, completed, pending, preWedding: preWedding.length, preWeddingCompleted, mainCeremonies: mainCeremonies.length, mainCompleted, completionRate, preWeddingRate, mainRate, totalItems };
    }, [ritualsAndCustoms]);
    
    return (
        <div className="card">
            <h3>🪔 Ritual Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-success)' }}>{stats.completionRate.toFixed(0)}%</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Overall Completion</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.completed}/{stats.totalRituals}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Rituals Done</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-warning)' }}>{stats.pending}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Pending</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalItems}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Items</div>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>🎊 Pre-Wedding Rituals</h4>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {stats.preWeddingCompleted}/{stats.preWedding}
                    </div>
                    <div className="progress-bar" style={{ height: '8px', marginBottom: '8px' }}>
                        <div className="progress-fill" style={{ width: `${stats.preWeddingRate}%` }}></div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {stats.preWeddingRate.toFixed(0)}% complete
                    </div>
                </div>
                
                <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>💒 Main Ceremonies</h4>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {stats.mainCompleted}/{stats.mainCeremonies}
                    </div>
                    <div className="progress-bar" style={{ height: '8px', marginBottom: '8px' }}>
                        <div className="progress-fill" style={{ width: `${stats.mainRate}%` }}></div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {stats.mainRate.toFixed(0)}% complete
                    </div>
                </div>
            </div>
        </div>
    );
};
