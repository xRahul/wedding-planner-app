const { useMemo } = React;

const Dashboard = ({ data }) => {
    const stats = useMemo(() => {
        const totalGuests = data.guests.length;
        const totalIndividuals = data.guests.reduce((sum, g) => {
            if (g.type === 'family') return sum + 1 + (g.familyMembers?.length || 0);
            return sum + 1;
        }, 0);
        const confirmedGuests = data.guests.filter(g => g.rsvpStatus === 'yes').length;
        const confirmedIndividuals = data.guests.reduce((sum, g) => {
            if (g.rsvpStatus === 'yes') {
                if (g.type === 'family') return sum + 1 + (g.familyMembers?.length || 0);
                return sum + 1;
            }
            return sum;
        }, 0);
        const totalBudgetSpent = data.budget.reduce((sum, cat) => sum + cat.actual, 0);
        const pendingTasks = data.tasks.filter(t => t.status === 'pending').length;
        const daysUntilWedding = Math.ceil((new Date(data.weddingInfo.weddingDate) - new Date()) / (1000 * 60 * 60 * 24));
        const budgetPercentage = (totalBudgetSpent / data.weddingInfo.totalBudget * 100).toFixed(1);

        return { totalGuests, totalIndividuals, confirmedGuests, confirmedIndividuals, totalBudgetSpent, pendingTasks, daysUntilWedding, budgetPercentage };
    }, [data]);

    return (
        <div>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.daysUntilWedding}</div>
                    <div className="stat-label">Days Until Wedding</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.confirmedIndividuals}/{stats.totalIndividuals}</div>
                    <div className="stat-label">Confirmed Guests</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {stats.confirmedGuests}/{stats.totalGuests} entries
                    </div>
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
                {[...data.budget].sort((a, b) => b.actual - a.actual).map(cat => {
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
                <h2 className="card-title">Guest Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div>
                        <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>RSVP Status</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>✅ Confirmed</span>
                                <strong style={{ color: 'var(--color-success)' }}>{data.guests.filter(g => g.rsvpStatus === 'yes').length}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>⏳ Pending</span>
                                <strong style={{ color: 'var(--color-warning)' }}>{data.guests.filter(g => g.rsvpStatus === 'pending').length}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>❌ Declined</span>
                                <strong style={{ color: 'var(--color-error)' }}>{data.guests.filter(g => g.rsvpStatus === 'no').length}</strong>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Data Collection</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span>Aadhar Cards</span>
                                    <strong>{data.guests.reduce((sum, g) => {
                                        let count = g.aadharCollected ? 1 : 0;
                                        if (g.type === 'family' && g.familyMembers) {
                                            count += g.familyMembers.filter(m => m.aadharCollected).length;
                                        }
                                        return sum + count;
                                    }, 0)}/{stats.totalIndividuals}</strong>
                                </div>
                                <div className="progress-bar" style={{ height: '8px' }}>
                                    <div className="progress-fill" style={{ width: `${(data.guests.reduce((sum, g) => {
                                        let count = g.aadharCollected ? 1 : 0;
                                        if (g.type === 'family' && g.familyMembers) {
                                            count += g.familyMembers.filter(m => m.aadharCollected).length;
                                        }
                                        return sum + count;
                                    }, 0) / stats.totalIndividuals * 100).toFixed(0)}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span>Room Assignments</span>
                                    <strong>{data.guests.reduce((sum, g) => {
                                        let count = g.room ? 1 : 0;
                                        if (g.type === 'family' && g.familyMembers) {
                                            count += g.familyMembers.filter(m => m.room).length;
                                        }
                                        return sum + count;
                                    }, 0)}/{stats.totalIndividuals}</strong>
                                </div>
                                <div className="progress-bar" style={{ height: '8px' }}>
                                    <div className="progress-fill" style={{ width: `${(data.guests.reduce((sum, g) => {
                                        let count = g.room ? 1 : 0;
                                        if (g.type === 'family' && g.familyMembers) {
                                            count += g.familyMembers.filter(m => m.room).length;
                                        }
                                        return sum + count;
                                    }, 0) / stats.totalIndividuals * 100).toFixed(0)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Guest Distribution</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>👰 Bride's Side</span>
                                <strong>{data.guests.filter(g => g.side === 'bride').length}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>🤵 Groom's Side</span>
                                <strong>{data.guests.filter(g => g.side === 'groom').length}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                                <span>🥗 Veg</span>
                                <strong>{data.guests.reduce((sum, g) => {
                                    let count = g.dietary === 'veg' ? 1 : 0;
                                    if (g.type === 'family' && g.familyMembers) {
                                        count += g.familyMembers.filter(m => m.dietary === 'veg').length;
                                    }
                                    return sum + count;
                                }, 0)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>🍗 Non-Veg</span>
                                <strong>{data.guests.reduce((sum, g) => {
                                    let count = g.dietary === 'non_veg' ? 1 : 0;
                                    if (g.type === 'family' && g.familyMembers) {
                                        count += g.familyMembers.filter(m => m.dietary === 'non_veg').length;
                                    }
                                    return sum + count;
                                }, 0)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2 className="card-title">Upcoming High Priority Tasks</h2>
                {data.tasks.filter(t => t.status === 'pending' && t.priority === 'high').length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {data.tasks.filter(t => t.status === 'pending' && t.priority === 'high').sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map(task => (
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