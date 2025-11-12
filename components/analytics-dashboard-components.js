const { useMemo } = React;

// Task Completion Analytics
const TaskCompletionAnalytics = ({ data }) => {
    const stats = useMemo(() => {
        const tasks = data.tasks || [];
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'done').length;
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
        
        return { total, completed, overdue, byPriority, completedByPriority, byCategory };
    }, [data.tasks]);
    
    const completionRate = stats.total > 0 ? (stats.completed / stats.total * 100).toFixed(1) : 0;
    
    return (
        <Card title="✅ Task Completion Analytics">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-success)' }}>{completionRate}%</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Completion Rate</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.completed}/{stats.total}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Tasks Done</div>
                </div>
                <div style={{ padding: '12px', background: stats.overdue > 5 ? 'rgba(220, 53, 69, 0.1)' : 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: stats.overdue > 0 ? 'var(--color-error)' : 'inherit' }}>{stats.overdue}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Overdue</div>
                </div>
            </div>
            
            <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Priority Completion</h4>
            {['high', 'medium', 'low'].map(p => (
                <div key={p} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{p}</span>
                        <span>{stats.completedByPriority[p]}/{stats.byPriority[p]}</span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                        <div className="progress-fill" style={{ width: `${stats.byPriority[p] > 0 ? (stats.completedByPriority[p] / stats.byPriority[p] * 100) : 0}%` }}></div>
                    </div>
                </div>
            ))}
            
            {stats.overdue > 5 && (
                <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(220, 53, 69, 0.1)', borderRadius: '4px', fontSize: '12px', color: 'var(--color-error)' }}>
                    🚨 {stats.overdue} tasks overdue - prioritize completion
                </div>
            )}
        </Card>
    );
};

// Guest Analytics
const GuestAnalytics = ({ data }) => {
    const stats = useMemo(() => {
        const guests = data.guests || [];
        const totalFamilies = guests.filter(g => g.type === 'family').length;
        const totalSingles = guests.filter(g => g.type === 'single').length;
        const totalIndividuals = guests.reduce((sum, g) => {
            if (g.type === 'family') return sum + 1 + (g.familyMembers?.length || 0);
            return sum + 1;
        }, 0);
        
        const rsvp = { yes: 0, pending: 0, no: 0 };
        const rsvpPeople = { yes: 0, pending: 0, no: 0 };
        guests.forEach(g => {
            rsvp[g.rsvpStatus]++;
            if (g.type === 'family') {
                rsvpPeople[g.rsvpStatus] += 1 + (g.familyMembers?.length || 0);
            } else {
                rsvpPeople[g.rsvpStatus]++;
            }
        });
        
        const byCategory = {};
        guests.forEach(g => {
            byCategory[g.category] = (byCategory[g.category] || 0) + 1;
        });
        
        const bySide = { bride: 0, groom: 0 };
        guests.forEach(g => bySide[g.side]++);
        
        const dietary = { veg: 0, jain: 0, other: 0 };
        guests.forEach(g => {
            if (g.dietary) dietary[g.dietary]++;
            if (g.type === 'family' && g.familyMembers) {
                g.familyMembers.forEach(m => { if (m.dietary) dietary[m.dietary]++; });
            }
        });
        
        const needsRoom = guests.filter(g => g.needsAccommodation).length;
        const aadharCollected = guests.reduce((sum, g) => {
            let count = g.aadharCollected ? 1 : 0;
            if (g.type === 'family' && g.familyMembers) {
                count += g.familyMembers.filter(m => m.aadharCollected).length;
            }
            return sum + count;
        }, 0);
        
        return { totalFamilies, totalSingles, totalIndividuals, rsvp, rsvpPeople, byCategory, bySide, dietary, needsRoom, aadharCollected };
    }, [data.guests]);
    
    return (
        <Card title="👥 Guest Analytics">
            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalIndividuals}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total People</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalFamilies}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>👨👩👧👦 Families</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalSingles}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>👤 Singles</div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>RSVP Status</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>✅ Confirmed</span>
                            <strong style={{ color: 'var(--color-success)' }}>{stats.rsvpPeople.yes} people</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>⏳ Pending</span>
                            <strong style={{ color: 'var(--color-warning)' }}>{stats.rsvpPeople.pending} people</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>❌ Declined</span>
                            <strong>{stats.rsvpPeople.no} people</strong>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Side Distribution</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>👰 Bride's Side</span>
                            <strong>{stats.bySide.bride}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🤵 Groom's Side</span>
                            <strong>{stats.bySide.groom}</strong>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Dietary Preferences</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🥗 Veg</span>
                            <strong>{stats.dietary.veg}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🌿 Jain</span>
                            <strong>{stats.dietary.jain}</strong>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Requirements</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🏨 Need Rooms</span>
                            <strong>{stats.needsRoom}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🆔 Aadhar</span>
                            <strong>{stats.aadharCollected}/{stats.totalIndividuals}</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            {stats.rsvp.pending > 10 && (
                <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '4px', fontSize: '12px', color: 'var(--color-warning)' }}>
                    ⚠️ {stats.rsvp.pending} pending RSVPs - send reminders
                </div>
            )}
        </Card>
    );
};

// Budget Health Scorecard
const BudgetHealthScorecard = ({ data }) => {
    const stats = useMemo(() => {
        const budget = data.budget || [];
        const totalBudget = data.weddingInfo?.totalBudget || 0;
        const totalSpent = budget.reduce((sum, cat) => sum + (cat.actual || 0), 0);
        
        // Calculate linked items
        let totalExpected = 0;
        let totalLinkedActual = 0;
        
        // Vendors
        data.vendors?.forEach(v => {
            if (v.budgetCategory) {
                totalExpected += v.estimatedCost || 0;
                totalLinkedActual += v.finalCost || 0;
            }
        });
        
        // Menus
        data.menus?.forEach(m => {
            const eventTotal = m.items?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;
            if (m.budgetCategory) {
                totalExpected += eventTotal;
                totalLinkedActual += eventTotal;
            }
            m.items?.forEach(item => {
                if (item.budgetCategory && item.budgetCategory !== m.budgetCategory) {
                    totalExpected += item.cost || 0;
                    totalLinkedActual += item.cost || 0;
                }
            });
        });
        
        // Gifts
        ['familyGifts', 'returnGifts', 'specialGifts'].forEach(giftType => {
            data.giftsAndFavors?.[giftType]?.forEach(g => {
                if (g.budgetCategory) {
                    const actual = giftType === 'returnGifts' ? (g.totalCost || 0) : (g.actualCost || g.cost || 0);
                    totalLinkedActual += actual;
                }
            });
        });
        
        // Shopping
        ['bride', 'groom', 'family'].forEach(shopType => {
            data.shopping?.[shopType]?.forEach(list => {
                list.items?.forEach(item => {
                    if (item.budgetCategory) {
                        totalExpected += item.estimatedCost || 0;
                        totalLinkedActual += item.actualCost || 0;
                    }
                });
            });
        });
        
        // Travel
        data.travel?.transport?.forEach(t => {
            if (t.budgetCategory) {
                totalLinkedActual += t.totalPrice || 0;
            }
        });
        
        const totalActualSpent = totalSpent + totalLinkedActual;
        const utilization = totalBudget > 0 ? (totalActualSpent / totalBudget * 100).toFixed(1) : 0;
        
        // Calculate bride/groom side spending
        let brideActual = 0;
        let groomActual = 0;
        
        data.vendors?.forEach(v => {
            if (v.budgetCategory) {
                const cost = v.finalCost || 0;
                if (v.paymentResponsibility === 'bride') brideActual += cost;
                else if (v.paymentResponsibility === 'groom') groomActual += cost;
                else if (v.paymentResponsibility === 'split') { brideActual += cost / 2; groomActual += cost / 2; }
            }
        });
        
        data.menus?.forEach(m => {
            m.items?.forEach(item => {
                const cost = (item.pricePerPlate || 0) * (m.attendedGuests || 0);
                if (item.paymentResponsibility === 'bride') brideActual += cost;
                else if (item.paymentResponsibility === 'groom') groomActual += cost;
                else if (item.paymentResponsibility === 'split') { brideActual += cost / 2; groomActual += cost / 2; }
            });
        });
        
        ['familyGifts', 'returnGifts', 'specialGifts'].forEach(giftType => {
            data.giftsAndFavors?.[giftType]?.forEach(g => {
                if (g.budgetCategory) {
                    const cost = g.totalCost || 0;
                    if (g.paymentResponsibility === 'bride') brideActual += cost;
                    else if (g.paymentResponsibility === 'groom') groomActual += cost;
                    else if (g.paymentResponsibility === 'split') { brideActual += cost / 2; groomActual += cost / 2; }
                }
            });
        });
        
        ['bride', 'groom', 'family'].forEach(shopType => {
            data.shopping?.[shopType]?.forEach(list => {
                list.items?.forEach(item => {
                    if (item.budgetCategory) {
                        const cost = item.budget || 0;
                        if (item.paymentResponsibility === 'bride') brideActual += cost;
                        else if (item.paymentResponsibility === 'groom') groomActual += cost;
                        else if (item.paymentResponsibility === 'split') { brideActual += cost / 2; groomActual += cost / 2; }
                    }
                });
            });
        });
        
        data.travel?.transport?.forEach(t => {
            if (t.budgetCategory) {
                const cost = t.totalPrice || 0;
                if (t.paymentResponsibility === 'bride') brideActual += cost;
                else if (t.paymentResponsibility === 'groom') groomActual += cost;
                else if (t.paymentResponsibility === 'split') { brideActual += cost / 2; groomActual += cost / 2; }
            }
        });
        
        const brideBudget = data.weddingInfo?.brideBudget || 0;
        const groomBudget = data.weddingInfo?.groomBudget || 0;
        const brideRemaining = brideBudget - brideActual;
        const groomRemaining = groomBudget - groomActual;
        const brideUtil = brideBudget > 0 ? (brideActual / brideBudget * 100).toFixed(1) : 0;
        const groomUtil = groomBudget > 0 ? (groomActual / groomBudget * 100).toFixed(1) : 0;
        
        const categories = budget.map(cat => ({
            name: cat.category,
            planned: cat.planned || 0,
            actual: cat.actual || 0,
            percentage: cat.planned > 0 ? (cat.actual / cat.planned * 100).toFixed(1) : 0
        })).filter(c => c.planned > 0).slice(0, 5);
        
        const guestCount = data.guests?.reduce((sum, g) => {
            if (g.rsvpStatus === 'yes') {
                if (g.type === 'family') return sum + 1 + (g.familyMembers?.length || 0);
                return sum + 1;
            }
            return sum;
        }, 0) || 1;
        
        const costPerGuest = totalActualSpent / guestCount;
        
        return { totalBudget, totalSpent, totalExpected, totalLinkedActual, totalActualSpent, utilization, categories, costPerGuest,
                 brideActual, groomActual, brideBudget, groomBudget, brideRemaining, groomRemaining, brideUtil, groomUtil };
    }, [data]);
    
    return (
        <Card title="💰 Budget Health Scorecard">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: stats.utilization > 90 ? 'rgba(220, 53, 69, 0.1)' : 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: stats.utilization > 90 ? 'var(--color-error)' : 'inherit' }}>{stats.utilization}%</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Budget Used</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(stats.totalActualSpent)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Spent</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(stats.totalExpected)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Expected (Linked)</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-success)' }}>{formatCurrency(stats.totalBudget - stats.totalActualSpent)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Remaining</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(stats.costPerGuest)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Per Guest</div>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'rgba(74, 144, 226, 0.1)', borderRadius: '8px', border: '2px solid var(--color-info)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--color-info)' }}>👰 Bride Side</h4>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{formatCurrency(stats.brideActual)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>of {formatCurrency(stats.brideBudget)} ({stats.brideUtil}%)</div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: stats.brideRemaining >= 0 ? 'var(--color-success)' : 'var(--color-error)', marginTop: '4px' }}>
                        {formatCurrency(stats.brideRemaining)} remaining
                    </div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(39, 174, 96, 0.1)', borderRadius: '8px', border: '2px solid var(--color-success)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--color-success)' }}>🤵 Groom Side</h4>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{formatCurrency(stats.groomActual)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>of {formatCurrency(stats.groomBudget)} ({stats.groomUtil}%)</div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: stats.groomRemaining >= 0 ? 'var(--color-success)' : 'var(--color-error)', marginTop: '4px' }}>
                        {formatCurrency(stats.groomRemaining)} remaining
                    </div>
                </div>
            </div>
            
            <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Top 5 Categories</h4>
            {stats.categories.map(cat => (
                <div key={cat.name} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{cat.name.replace(/_/g, ' ')}</span>
                        <span style={{ color: cat.percentage > 95 ? 'var(--color-error)' : 'inherit' }}>
                            {formatCurrency(cat.actual)} / {formatCurrency(cat.planned)} ({cat.percentage}%)
                        </span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                        <div className="progress-fill" style={{ 
                            width: `${Math.min(cat.percentage, 100)}%`,
                            background: cat.percentage > 100 ? 'var(--color-error)' : cat.percentage > 95 ? 'var(--color-warning)' : 'var(--color-primary)'
                        }}></div>
                    </div>
                </div>
            ))}
            
            {stats.utilization > 90 && (
                <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(220, 53, 69, 0.1)', borderRadius: '4px', fontSize: '12px', color: 'var(--color-error)' }}>
                    🚨 Budget {stats.utilization}% used - review all pending expenses
                </div>
            )}
        </Card>
    );
};

// Vendor Performance Summary
const VendorPerformanceSummary = ({ data }) => {
    const stats = useMemo(() => {
        const vendors = data.vendors || [];
        const total = vendors.length;
        const confirmed = vendors.filter(v => v.status === 'confirmed').length;
        const pending = vendors.filter(v => v.status === 'pending').length;
        
        const byType = {};
        vendors.forEach(v => {
            if (!byType[v.type]) byType[v.type] = { count: 0, cost: 0 };
            byType[v.type].count++;
            byType[v.type].cost += v.finalCost || v.estimatedCost || 0;
        });
        
        const totalCost = vendors.reduce((sum, v) => sum + (v.finalCost || v.estimatedCost || 0), 0);
        const advancePaid = vendors.reduce((sum, v) => sum + (v.advancePaid || 0), 0);
        
        return { total, confirmed, pending, byType, totalCost, advancePaid };
    }, [data.vendors]);
    
    return (
        <Card title="🤝 Vendor Performance Summary">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.total}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Vendors</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-success)' }}>{stats.confirmed}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Confirmed</div>
                </div>
                <div style={{ padding: '12px', background: stats.pending > 3 ? 'rgba(255, 193, 7, 0.1)' : 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: stats.pending > 3 ? 'var(--color-warning)' : 'inherit' }}>{stats.pending}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Pending</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(stats.totalCost)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Cost</div>
                </div>
            </div>
            
            <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Vendors by Type</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {Object.entries(stats.byType).map(([type, info]) => (
                    <div key={type} style={{ padding: '8px', background: 'var(--color-bg-secondary)', borderRadius: '4px', fontSize: '12px' }}>
                        <div style={{ fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '4px' }}>{type.replace(/_/g, ' ')}</div>
                        <div style={{ color: 'var(--color-text-secondary)' }}>{info.count} vendor{info.count > 1 ? 's' : ''} • {formatCurrency(info.cost)}</div>
                    </div>
                ))}
            </div>
            
            {stats.pending > 3 && (
                <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '4px', fontSize: '12px', color: 'var(--color-warning)' }}>
                    ⚠️ {stats.pending} vendors pending confirmation - follow up needed
                </div>
            )}
        </Card>
    );
};

// Event Readiness Tracker
const EventReadinessTracker = ({ data }) => {
    const events = useMemo(() => {
        const ceremonies = [...(data.ritualsAndCustoms?.preWedding || []), ...(data.ritualsAndCustoms?.mainCeremonies || [])];
        
        return ceremonies.map(ceremony => {
            const relatedTasks = data.tasks?.filter(t => 
                t.description?.toLowerCase().includes(ceremony.name?.toLowerCase())
            ) || [];
            const taskCompletion = relatedTasks.length > 0 ? 
                (relatedTasks.filter(t => t.status === 'done').length / relatedTasks.length * 100) : 100;
            
            const totalGuests = data.guests?.length || 0;
            const confirmedGuests = data.guests?.filter(g => g.rsvpStatus === 'yes').length || 0;
            const guestConfirmation = totalGuests > 0 ? (confirmedGuests / totalGuests * 100) : 0;
            
            const readiness = (taskCompletion + guestConfirmation) / 2;
            const status = readiness >= 80 ? 'ready' : readiness >= 60 ? 'on-track' : 'at-risk';
            
            return {
                name: ceremony.name,
                readiness: readiness.toFixed(0),
                status,
                taskCompletion: taskCompletion.toFixed(0),
                guestConfirmation: guestConfirmation.toFixed(0),
                completed: ceremony.completed
            };
        });
    }, [data]);
    
    return (
        <Card title="🎯 Event Readiness Tracker">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                {events.slice(0, 6).map(event => (
                    <div key={event.name} style={{ 
                        padding: '12px', 
                        background: event.completed ? 'rgba(40, 167, 69, 0.1)' : 
                                   event.status === 'at-risk' ? 'rgba(220, 53, 69, 0.1)' : 
                                   event.status === 'on-track' ? 'rgba(255, 193, 7, 0.1)' : 'var(--color-bg-secondary)',
                        borderRadius: '8px',
                        border: `2px solid ${event.completed ? 'var(--color-success)' : 
                                            event.status === 'at-risk' ? 'var(--color-error)' : 
                                            event.status === 'on-track' ? 'var(--color-warning)' : 'var(--color-border)'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '14px' }}>{event.name}</strong>
                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{event.completed ? '✅' : `${event.readiness}%`}</span>
                        </div>
                        {!event.completed && (
                            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                <div>Tasks: {event.taskCompletion}%</div>
                                <div>Guests: {event.guestConfirmation}%</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};

// Timeline Pressure Index
const TimelinePressureIndex = ({ data }) => {
    const stats = useMemo(() => {
        const tasks = data.tasks?.filter(t => t.status === 'pending' && t.deadline) || [];
        const now = new Date();
        
        const thisWeek = tasks.filter(t => {
            const deadline = new Date(t.deadline);
            const diff = (deadline - now) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff <= 7;
        }).length;
        
        const nextWeek = tasks.filter(t => {
            const deadline = new Date(t.deadline);
            const diff = (deadline - now) / (1000 * 60 * 60 * 24);
            return diff > 7 && diff <= 14;
        }).length;
        
        const highPriorityNearDeadline = tasks.filter(t => {
            const deadline = new Date(t.deadline);
            const diff = (deadline - now) / (1000 * 60 * 60 * 24);
            return t.priority === 'high' && diff <= 7;
        }).length;
        
        const pressure = thisWeek > 10 ? 'high' : thisWeek > 5 ? 'medium' : 'low';
        
        return { thisWeek, nextWeek, highPriorityNearDeadline, pressure };
    }, [data.tasks]);
    
    return (
        <Card title="⏰ Timeline Pressure Index">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '12px', background: stats.pressure === 'high' ? 'rgba(220, 53, 69, 0.1)' : 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: stats.pressure === 'high' ? 'var(--color-error)' : 'inherit' }}>{stats.thisWeek}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Due This Week</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.nextWeek}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Due Next Week</div>
                </div>
                <div style={{ padding: '12px', background: stats.highPriorityNearDeadline > 0 ? 'rgba(220, 53, 69, 0.1)' : 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: stats.highPriorityNearDeadline > 0 ? 'var(--color-error)' : 'inherit' }}>{stats.highPriorityNearDeadline}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>High Priority Soon</div>
                </div>
            </div>
            
            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Pressure Level</div>
                <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    color: stats.pressure === 'high' ? 'var(--color-error)' : stats.pressure === 'medium' ? 'var(--color-warning)' : 'var(--color-success)'
                }}>
                    {stats.pressure === 'high' ? '🔴 HIGH' : stats.pressure === 'medium' ? '🟡 MEDIUM' : '🟢 LOW'}
                </div>
            </div>
            
            {stats.thisWeek > 10 && (
                <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(220, 53, 69, 0.1)', borderRadius: '4px', fontSize: '12px', color: 'var(--color-error)' }}>
                    🚨 Heavy workload this week - {stats.thisWeek} tasks due
                </div>
            )}
        </Card>
    );
};

// Smart Recommendations Engine
const SmartRecommendations = ({ data }) => {
    const recommendations = useMemo(() => {
        const recs = [];
        const now = new Date();
        const weddingDate = data.weddingInfo?.weddingDate ? new Date(data.weddingInfo.weddingDate) : null;
        const daysUntilWedding = weddingDate ? Math.ceil((weddingDate - now) / (1000 * 60 * 60 * 24)) : 999;
        
        const overdueTasks = data.tasks?.filter(t => t.status === 'pending' && t.deadline && new Date(t.deadline) < now).length || 0;
        if (overdueTasks > 5 && daysUntilWedding < 30) {
            recs.push({ type: 'critical', message: `${overdueTasks} tasks overdue - prioritize completion immediately`, action: 'tasks' });
        }
        
        const pendingRsvp = data.guests?.filter(g => g.rsvpStatus === 'pending').length || 0;
        if (pendingRsvp > 50 && daysUntilWedding < 14) {
            recs.push({ type: 'critical', message: `${pendingRsvp} pending RSVPs with 2 weeks left - send reminders`, action: 'guests' });
        } else if (pendingRsvp > 20 && daysUntilWedding < 30) {
            recs.push({ type: 'warning', message: `${pendingRsvp} guests haven't responded - follow up needed`, action: 'guests' });
        }
        
        const pendingVendors = data.vendors?.filter(v => v.status === 'pending').length || 0;
        if (pendingVendors > 3) {
            recs.push({ type: 'warning', message: `${pendingVendors} vendors not confirmed - follow up this week`, action: 'vendors' });
        }
        
        const totalBudget = data.weddingInfo?.totalBudget || 0;
        const spent = data.budget?.reduce((sum, cat) => sum + (cat.actual || 0), 0) || 0;
        const budgetUtil = totalBudget > 0 ? (spent / totalBudget * 100) : 0;
        if (budgetUtil > 90) {
            recs.push({ type: 'critical', message: `Budget ${budgetUtil.toFixed(0)}% used - review pending expenses`, action: 'budget' });
        } else if (budgetUtil > 80) {
            recs.push({ type: 'warning', message: `Budget ${budgetUtil.toFixed(0)}% used - monitor spending closely`, action: 'budget' });
        }
        
        const jainGuests = data.guests?.reduce((sum, g) => {
            let count = g.dietary === 'jain' ? 1 : 0;
            if (g.type === 'family' && g.familyMembers) {
                count += g.familyMembers.filter(m => m.dietary === 'jain').length;
            }
            return sum + count;
        }, 0) || 0;
        if (jainGuests > 10) {
            recs.push({ type: 'info', message: `${jainGuests} Jain guests - ensure Jain menu options`, action: 'menus' });
        }
        
        return recs.sort((a, b) => {
            const order = { critical: 0, warning: 1, info: 2 };
            return order[a.type] - order[b.type];
        });
    }, [data]);
    
    return (
        <Card title="💡 Smart Recommendations">
            {recommendations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recommendations.map((rec, idx) => (
                        <div key={idx} style={{ 
                            padding: '12px', 
                            borderRadius: '8px',
                            background: rec.type === 'critical' ? 'rgba(220, 53, 69, 0.1)' : 
                                       rec.type === 'warning' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(13, 202, 240, 0.1)',
                            border: `1px solid ${rec.type === 'critical' ? 'var(--color-error)' : 
                                                rec.type === 'warning' ? 'var(--color-warning)' : 'var(--color-info)'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', flex: 1 }}>
                                    {rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️'} {rec.message}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>✅</div>
                    <p>Everything looks good!</p>
                    <p style={{ fontSize: '14px' }}>No critical actions needed right now</p>
                </div>
            )}
        </Card>
    );
};

// Summary Statistics Cards
const SummaryStats = ({ data }) => {
    const stats = useMemo(() => {
        const now = new Date();
        const weddingDate = data.weddingInfo?.weddingDate ? new Date(data.weddingInfo.weddingDate) : null;
        const daysToWedding = weddingDate ? Math.ceil((weddingDate - now) / (1000 * 60 * 60 * 24)) : 0;
        
        const totalTasks = data.tasks?.length || 0;
        const completedTasks = data.tasks?.filter(t => t.status === 'done').length || 0;
        const overdueTasks = data.tasks?.filter(t => t.status === 'pending' && t.deadline && new Date(t.deadline) < now).length || 0;
        const taskHealth = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(0) : 0;
        
        const confirmedGuests = data.guests?.filter(g => g.rsvpStatus === 'yes').length || 0;
        const pendingGuests = data.guests?.filter(g => g.rsvpStatus === 'pending').length || 0;
        
        const totalBudget = data.weddingInfo?.totalBudget || 0;
        const spent = data.budget?.reduce((sum, cat) => sum + (cat.actual || 0), 0) || 0;
        
        // Calculate linked actual
        let linkedActual = 0;
        data.vendors?.forEach(v => { if (v.budgetCategory) linkedActual += v.finalCost || 0; });
        data.menus?.forEach(m => {
            const eventTotal = m.items?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;
            if (m.budgetCategory) linkedActual += eventTotal;
            m.items?.forEach(item => { if (item.budgetCategory && item.budgetCategory !== m.budgetCategory) linkedActual += item.cost || 0; });
        });
        ['familyGifts', 'returnGifts', 'specialGifts'].forEach(giftType => {
            data.giftsAndFavors?.[giftType]?.forEach(g => {
                if (g.budgetCategory) {
                    const actual = giftType === 'returnGifts' ? (g.totalCost || 0) : (g.actualCost || g.cost || 0);
                    linkedActual += actual;
                }
            });
        });
        ['bride', 'groom', 'family'].forEach(shopType => {
            data.shopping?.[shopType]?.forEach(list => {
                list.items?.forEach(item => { if (item.budgetCategory) linkedActual += item.actualCost || 0; });
            });
        });
        data.travel?.transport?.forEach(t => { if (t.budgetCategory) linkedActual += t.totalPrice || 0; });
        
        const totalSpent = spent + linkedActual;
        const remaining = totalBudget - totalSpent;
        const budgetUtil = totalBudget > 0 ? (totalSpent / totalBudget * 100).toFixed(0) : 0;
        
        const ceremonies = [...(data.ritualsAndCustoms?.preWedding || []), ...(data.ritualsAndCustoms?.mainCeremonies || [])];
        const completedCeremonies = ceremonies.filter(c => c.completed).length;
        const avgReadiness = ceremonies.length > 0 ? (completedCeremonies / ceremonies.length * 100).toFixed(0) : 0;
        
        const criticalItems = overdueTasks + (pendingGuests > 20 ? 1 : 0) + (budgetUtil > 90 ? 1 : 0);
        
        return { daysToWedding, taskHealth, overdueTasks, confirmedGuests, 
                 spent, remaining, budgetUtil, avgReadiness, criticalItems };
    }, [data]);
    
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>📅 Days to Wedding</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.daysToWedding}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {stats.daysToWedding <= 7 ? '⚡ Final week!' : stats.daysToWedding <= 30 ? '📅 Final month' : '⏰ Planning phase'}
                </div>
            </div>
            
            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>✅ Task Health</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: stats.taskHealth < 50 ? 'var(--color-error)' : 'inherit' }}>{stats.taskHealth}%</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : 'On track'}
                </div>
            </div>
            
            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>👥 Guest Count</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{data.guests?.reduce((sum, g) => {
                    if (g.rsvpStatus === 'yes') {
                        if (g.type === 'family') return sum + 1 + (g.familyMembers?.length || 0);
                        return sum + 1;
                    }
                    return sum;
                }, 0) || 0}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {stats.confirmedGuests} entries ({data.guests?.filter(g => g.type === 'family' && g.rsvpStatus === 'yes').length || 0} families, {data.guests?.filter(g => g.type === 'single' && g.rsvpStatus === 'yes').length || 0} singles)
                </div>
            </div>
            
            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>💰 Budget</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: stats.budgetUtil > 90 ? 'var(--color-error)' : 'inherit' }}>{stats.budgetUtil}%</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {formatCurrency(stats.remaining)} left
                </div>
            </div>
            
            <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>🎯 Event Progress</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.avgReadiness}%</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Average readiness</div>
            </div>
            
            <div style={{ padding: '16px', background: stats.criticalItems > 0 ? 'rgba(220, 53, 69, 0.1)' : 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>⚠️ Critical Items</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: stats.criticalItems > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                    {stats.criticalItems}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {stats.criticalItems > 0 ? 'Need attention' : 'All good'}
                </div>
            </div>
        </div>
    );
};

// Weekly Progress Report
const WeeklyProgressReport = ({ data }) => {
    const stats = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const tasksCompletedThisWeek = data.tasks?.filter(t => 
            t.status === 'done' && t.completedDate && new Date(t.completedDate) >= weekAgo
        ).length || 0;
        
        const vendorsConfirmedThisWeek = data.vendors?.filter(v => 
            v.status === 'confirmed' && v.bookingDate && new Date(v.bookingDate) >= weekAgo
        ).length || 0;
        
        const guestsRsvpdThisWeek = data.guests?.filter(g => 
            g.rsvpStatus === 'yes' && g.rsvpDate && new Date(g.rsvpDate) >= weekAgo
        ).length || 0;
        
        const totalTasks = data.tasks?.filter(t => t.status === 'pending').length || 0;
        const momentum = tasksCompletedThisWeek >= 5 ? 'on-pace' : tasksCompletedThisWeek >= 3 ? 'steady' : 'behind';
        
        return { tasksCompletedThisWeek, vendorsConfirmedThisWeek, guestsRsvpdThisWeek, totalTasks, momentum };
    }, [data]);
    
    return (
        <Card title="📊 Weekly Progress Report">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.tasksCompletedThisWeek}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Tasks Completed</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.vendorsConfirmedThisWeek}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Vendors Confirmed</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.guestsRsvpdThisWeek}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>New RSVPs</div>
                </div>
            </div>
            
            <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Momentum</div>
                <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold',
                    color: stats.momentum === 'on-pace' ? 'var(--color-success)' : stats.momentum === 'steady' ? 'var(--color-warning)' : 'var(--color-error)'
                }}>
                    {stats.momentum === 'on-pace' ? '🚀 On Pace' : stats.momentum === 'steady' ? '⚡ Steady' : '🐌 Behind Schedule'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    {stats.totalTasks} tasks remaining
                </div>
            </div>
        </Card>
    );
};
