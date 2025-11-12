const { useMemo } = React;

const Dashboard = ({ data }) => {
    // Show analytics dashboard
    return (
        <div>
            <SummaryStats data={data} />
            <SmartRecommendations data={data} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <TaskCompletionAnalytics data={data} />
                <GuestAnalytics data={data} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <BudgetHealthScorecard data={data} />
                <VendorPerformanceSummary data={data} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <TimelinePressureIndex data={data} />
                <WeeklyProgressReport data={data} />
            </div>
            <EventReadinessTracker data={data} />
        </div>
    );
};

const DashboardOld = ({ data }) => {
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
        const totalBudgetSpent = data.budget.reduce((sum, cat) => sum + (cat.actual || 0), 0);
        const pendingTasks = data.tasks.filter(t => t.status === 'pending').length;
        const highPriorityTasks = data.tasks.filter(t => t.status === 'pending' && t.priority === 'high').length;
        const daysUntilWedding = data.weddingInfo.weddingDate ? Math.ceil((new Date(data.weddingInfo.weddingDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
        const budgetPercentage = data.weddingInfo.totalBudget > 0 ? (totalBudgetSpent / data.weddingInfo.totalBudget * 100).toFixed(1) : '0.0';
        
        // North Indian wedding specific stats
        const ritualStats = {
            preWedding: data.ritualsAndCustoms?.preWedding?.length || 0,
            preWeddingCompleted: data.ritualsAndCustoms?.preWedding?.filter(r => r.completed).length || 0,
            mainCeremonies: data.ritualsAndCustoms?.mainCeremonies?.length || 0,
            mainCompleted: data.ritualsAndCustoms?.mainCeremonies?.filter(r => r.completed).length || 0
        };
        
        const vendorStats = {
            total: data.vendors.length,
            confirmed: data.vendors.filter(v => v.status === 'confirmed').length,
            booked: data.vendors.filter(v => v.status === 'booked').length,
            totalCost: data.vendors.reduce((sum, v) => sum + (v.finalCost || v.estimatedCost || 0), 0)
        };
        
        const giftStats = {
            familyGifts: data.giftsAndFavors?.familyGifts?.length || 0,
            returnGifts: data.giftsAndFavors?.returnGifts?.length || 0,
            totalGiftCost: (data.giftsAndFavors?.familyGifts || []).concat(data.giftsAndFavors?.returnGifts || []).reduce((sum, g) => sum + (g.totalCost || 0), 0)
        };
        
        const transportStats = {
            vehicles: data.travel?.transport?.length || 0,
            totalSeats: data.travel?.transport?.reduce((sum, t) => sum + (t.seats || 0), 0) || 0,
            transportCost: data.travel?.transport?.reduce((sum, t) => sum + (t.totalPrice || 0), 0) || 0
        };

        return { 
            totalGuests, totalIndividuals, confirmedGuests, confirmedIndividuals, 
            totalBudgetSpent, pendingTasks, highPriorityTasks, daysUntilWedding, budgetPercentage,
            ritualStats, vendorStats, giftStats, transportStats
        };
    }, [data]);

    // Alert system for critical items
    const alerts = [];
    if (stats.daysUntilWedding <= 7 && stats.highPriorityTasks > 0) {
        alerts.push({ type: 'error', message: `${stats.highPriorityTasks} high priority tasks pending with only ${stats.daysUntilWedding} days left!` });
    }
    if (stats.budgetPercentage > 90) {
        alerts.push({ type: 'warning', message: `Budget usage at ${stats.budgetPercentage}% - monitor spending closely` });
    }
    if (stats.vendorStats.confirmed < stats.vendorStats.total * 0.7) {
        alerts.push({ type: 'info', message: `Only ${stats.vendorStats.confirmed}/${stats.vendorStats.total} vendors confirmed - follow up needed` });
    }
    if (stats.totalIndividuals > 0 && stats.confirmedIndividuals < stats.totalIndividuals * 0.5 && stats.daysUntilWedding > 0 && stats.daysUntilWedding <= 14) {
        alerts.push({ type: 'warning', message: `Only ${Math.round(stats.confirmedIndividuals/stats.totalIndividuals*100)}% guests confirmed with 2 weeks left` });
    }

    return (
        <div>
            {/* Alert Section */}
            {alerts.length > 0 && (
                <div className="card" style={{ marginBottom: '16px', border: '2px solid var(--color-warning)' }}>
                    <h3 style={{ color: 'var(--color-warning)', marginBottom: '12px' }}>🚨 Action Required</h3>
                    {alerts.map((alert, idx) => (
                        <div key={idx} style={{ 
                            padding: '8px 12px', 
                            marginBottom: '8px', 
                            borderRadius: '4px',
                            background: alert.type === 'error' ? 'rgba(220, 53, 69, 0.1)' : alert.type === 'warning' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(13, 202, 240, 0.1)',
                            border: `1px solid ${alert.type === 'error' ? 'var(--color-error)' : alert.type === 'warning' ? 'var(--color-warning)' : 'var(--color-info)'}`
                        }}>
                            {alert.message}
                        </div>
                    ))}
                </div>
            )}

            {/* Enhanced Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card" style={{ background: stats.daysUntilWedding <= 7 ? 'rgba(220, 53, 69, 0.1)' : 'var(--color-bg-secondary)' }}>
                    <div className="stat-value" style={{ color: stats.daysUntilWedding <= 7 ? 'var(--color-error)' : 'inherit' }}>
                        {stats.daysUntilWedding}
                    </div>
                    <div className="stat-label">Days Until Wedding</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {stats.daysUntilWedding <= 0 ? '🎉 Wedding Day!' : stats.daysUntilWedding <= 7 ? '⚡ Final Week' : stats.daysUntilWedding <= 30 ? '📅 Final Month' : '⏰ Planning Phase'}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.confirmedIndividuals}/{stats.totalIndividuals}</div>
                    <div className="stat-label">Confirmed People</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {stats.confirmedGuests} entries ({stats.confirmedIndividuals} people) • {Math.round(stats.confirmedIndividuals/stats.totalIndividuals*100)}% confirmed
                    </div>
                </div>
                <div className="stat-card" style={{ background: stats.budgetPercentage > 90 ? 'rgba(220, 53, 69, 0.1)' : 'var(--color-bg-secondary)' }}>
                    <div className="stat-value" style={{ color: stats.budgetPercentage > 90 ? 'var(--color-error)' : 'inherit' }}>
                        {stats.budgetPercentage}%
                    </div>
                    <div className="stat-label">Budget Used</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {formatCurrency(data.weddingInfo.totalBudget - stats.totalBudgetSpent)} remaining
                    </div>
                </div>
                <div className="stat-card" style={{ background: stats.highPriorityTasks > 0 ? 'rgba(255, 193, 7, 0.1)' : 'var(--color-bg-secondary)' }}>
                    <div className="stat-value" style={{ color: stats.highPriorityTasks > 0 ? 'var(--color-warning)' : 'inherit' }}>
                        {stats.pendingTasks}
                    </div>
                    <div className="stat-label">Pending Tasks</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {stats.highPriorityTasks} high priority
                    </div>
                </div>
            </div>

            {/* North Indian Wedding Progress */}
            <div className="card">
                <h2 className="card-title">🪔 Wedding Ceremony Progress</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Pre-Wedding Rituals</h4>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
                            {stats.ritualStats.preWeddingCompleted}/{stats.ritualStats.preWedding}
                        </div>
                        <div className="progress-bar" style={{ height: '8px' }}>
                            <div className="progress-fill" style={{ 
                                width: `${stats.ritualStats.preWedding > 0 ? (stats.ritualStats.preWeddingCompleted / stats.ritualStats.preWedding * 100) : 0}%` 
                            }}></div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            Haldi, Mehendi, Sangeet, etc.
                        </div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Main Ceremonies</h4>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
                            {stats.ritualStats.mainCompleted}/{stats.ritualStats.mainCeremonies}
                        </div>
                        <div className="progress-bar" style={{ height: '8px' }}>
                            <div className="progress-fill" style={{ 
                                width: `${stats.ritualStats.mainCeremonies > 0 ? (stats.ritualStats.mainCompleted / stats.ritualStats.mainCeremonies * 100) : 0}%` 
                            }}></div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            Baraat, Pheras, Vidai, etc.
                        </div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Vendor Status</h4>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
                            {stats.vendorStats.confirmed}/{stats.vendorStats.total}
                        </div>
                        <div className="progress-bar" style={{ height: '8px' }}>
                            <div className="progress-fill" style={{ 
                                width: `${stats.vendorStats.total > 0 ? (stats.vendorStats.confirmed / stats.vendorStats.total * 100) : 0}%` 
                            }}></div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            Confirmed vendors
                        </div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Transport Capacity</h4>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
                            {stats.transportStats.totalSeats}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            Total seats • {stats.transportStats.vehicles} vehicles
                        </div>
                        <div style={{ fontSize: '11px', color: stats.transportStats.totalSeats < stats.confirmedIndividuals ? 'var(--color-error)' : 'var(--color-success)' }}>
                            {stats.transportStats.totalSeats >= stats.confirmedIndividuals ? '✅ Sufficient capacity' : '⚠️ Need more transport'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Wedding Overview */}
            <div className="card">
                <h2 className="card-title">💒 Wedding Overview</h2>
                <div className="grid-2">
                    <div>
                        <p><strong>👰 Bride:</strong> {data.weddingInfo.brideName}</p>
                        <p><strong>🤵 Groom:</strong> {data.weddingInfo.groomName}</p>
                        <p><strong>📅 Date:</strong> {formatDate(data.weddingInfo.weddingDate)}</p>
                        <p><strong>📍 Location:</strong> {data.weddingInfo.location}</p>
                    </div>
                    <div>
                        <p><strong>💰 Total Budget:</strong> {formatCurrency(data.weddingInfo.totalBudget)}</p>
                        <p><strong>💸 Spent:</strong> {formatCurrency(stats.totalBudgetSpent)}</p>
                        <p><strong>💵 Remaining:</strong> <span style={{ color: data.weddingInfo.totalBudget - stats.totalBudgetSpent >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                            {formatCurrency(data.weddingInfo.totalBudget - stats.totalBudgetSpent)}
                        </span></p>
                        <p><strong>🎁 Gift Budget:</strong> {formatCurrency(stats.giftStats.totalGiftCost)}</p>
                        <p><strong>🚌 Transport Cost:</strong> {formatCurrency(stats.transportStats.transportCost)}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recommendations */}
            <div className="card">
                <h2 className="card-title">📋 Quick Actions & Recommendations</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-primary)' }}>🎯 Priority Actions</h4>
                        {stats.daysUntilWedding <= 30 && (
                            <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                                • Confirm all vendor bookings<br/>
                                • Finalize guest count for catering<br/>
                                • Complete ritual item shopping<br/>
                                • Arrange transport for out-of-town guests
                            </div>
                        )}
                        {stats.daysUntilWedding <= 7 && (
                            <div style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--color-error)' }}>
                                <strong>Final Week:</strong><br/>
                                • Confirm all timings with vendors<br/>
                                • Prepare ritual items<br/>
                                • Brief family on ceremony roles<br/>
                                • Coordinate transport schedules
                            </div>
                        )}
                    </div>
                    <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-success)' }}>💡 Smart Insights</h4>
                        <div style={{ fontSize: '14px' }}>
                            • Average cost per guest: {formatCurrency(stats.totalIndividuals > 0 ? stats.totalBudgetSpent / stats.totalIndividuals : 0)}<br/>
                            • Vendor cost: {stats.totalBudgetSpent > 0 ? ((stats.vendorStats.totalCost / stats.totalBudgetSpent) * 100).toFixed(1) : '0.0'}% of budget<br/>
                            • Gift cost: {stats.totalBudgetSpent > 0 ? ((stats.giftStats.totalGiftCost / stats.totalBudgetSpent) * 100).toFixed(1) : '0.0'}% of budget<br/>
                            • Transport per person: {formatCurrency(stats.confirmedIndividuals > 0 ? stats.transportStats.transportCost / stats.confirmedIndividuals : 0)}
                        </div>
                    </div>
                </div>
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
                                <span>🌿 Jain</span>
                                <strong>{data.guests.reduce((sum, g) => {
                                    let count = g.dietary === 'jain' ? 1 : 0;
                                    if (g.type === 'family' && g.familyMembers) {
                                        count += g.familyMembers.filter(m => m.dietary === 'jain').length;
                                    }
                                    return sum + count;
                                }, 0)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Task Overview */}
            <div className="card">
                <h2 className="card-title">⚡ Upcoming High Priority Tasks</h2>
                {data.tasks.filter(t => t.status === 'pending' && t.priority === 'high').length > 0 ? (
                    <div>
                        {data.tasks.filter(t => t.status === 'pending' && t.priority === 'high').sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map(task => {
                            const daysUntilDeadline = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={task.id} style={{ 
                                    padding: '12px', 
                                    marginBottom: '8px',
                                    borderRadius: '8px',
                                    background: daysUntilDeadline <= 3 ? 'rgba(220, 53, 69, 0.1)' : daysUntilDeadline <= 7 ? 'rgba(255, 193, 7, 0.1)' : 'var(--color-bg-secondary)',
                                    border: `1px solid ${daysUntilDeadline <= 3 ? 'var(--color-error)' : daysUntilDeadline <= 7 ? 'var(--color-warning)' : 'var(--color-border)'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <strong style={{ color: daysUntilDeadline <= 3 ? 'var(--color-error)' : 'inherit' }}>
                                                {task.description}
                                            </strong>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                                📅 Due: {formatDate(task.deadline)} • 👤 {task.assignedTo}
                                            </div>
                                        </div>
                                        <div style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '11px', 
                                            fontWeight: 'bold',
                                            background: daysUntilDeadline <= 0 ? 'var(--color-error)' : daysUntilDeadline <= 3 ? 'var(--color-warning)' : 'var(--color-info)',
                                            color: 'white'
                                        }}>
                                            {daysUntilDeadline <= 0 ? 'OVERDUE' : daysUntilDeadline === 1 ? 'TOMORROW' : `${daysUntilDeadline} DAYS`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>✅</div>
                        <p>No pending high priority tasks</p>
                        <p style={{ fontSize: '14px' }}>Great job staying on top of your wedding planning!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Keep old dashboard for reference if needed