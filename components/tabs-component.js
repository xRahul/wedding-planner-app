const Tabs = ({ activeTab, setActiveTab, data = {} }) => {
    const getTabStats = (tabId) => {
        switch (tabId) {
            case 'guests':
                const totalGuests = data.guests?.length || 0;
                const confirmedGuests = data.guests?.filter(g => g.rsvpStatus === 'yes').length || 0;
                return totalGuests > 0 ? `${confirmedGuests}/${totalGuests}` : null;
            case 'vendors':
                const totalVendors = data.vendors?.length || 0;
                const confirmedVendors = data.vendors?.filter(v => ['confirmed', 'booked'].includes(v.status)).length || 0;
                return totalVendors > 0 ? `${confirmedVendors}/${totalVendors}` : null;
            case 'tasks':
                const totalTasks = data.tasks?.length || 0;
                const completedTasks = data.tasks?.filter(t => t.status === 'done').length || 0;
                return totalTasks > 0 ? `${completedTasks}/${totalTasks}` : null;
            case 'budget':
                const totalBudget = data.weddingInfo?.totalBudget || 1;
                const spentBudget = data.budget?.reduce((sum, b) => sum + (b.actual || 0), 0) || 0;
                return `${((spentBudget / totalBudget) * 100).toFixed(0)}%`;
            case 'rituals':
                const totalRituals = (data.ritualsAndCustoms?.preWedding?.length || 0) + (data.ritualsAndCustoms?.mainCeremonies?.length || 0);
                const completedRituals = (data.ritualsAndCustoms?.preWedding?.filter(r => r.completed).length || 0) + 
                                       (data.ritualsAndCustoms?.mainCeremonies?.filter(r => r.completed).length || 0);
                return totalRituals > 0 ? `${completedRituals}/${totalRituals}` : null;
            default:
                return null;
        }
    };

    const tabs = [
        { id: 'dashboard', label: '📊 Dashboard', group: 'overview' },
        { id: 'timeline', label: '📅 Timeline', group: 'planning' },
        { id: 'guests', label: '👥 Guests', group: 'planning' },
        { id: 'vendors', label: '🤝 Vendors', group: 'planning' },
        { id: 'budget', label: '💰 Budget', group: 'planning' },
        { id: 'tasks', label: '✅ Tasks', group: 'planning' },
        { id: 'rituals', label: '🪔 Rituals', group: 'ceremonies' },
        { id: 'menus', label: '🍽️ Menus', group: 'ceremonies' },
        { id: 'gifts', label: '🎁 Gifts', group: 'ceremonies' },
        { id: 'shopping', label: '🛍️ Shopping', group: 'logistics' },
        { id: 'travel', label: '🚌 Travel', group: 'logistics' },
        { id: 'settings', label: '⚙️ Settings', group: 'system' }
    ];

    return (
        <div className="tabs">
            {tabs.map(tab => {
                const stats = getTabStats(tab.id);
                const hasAlert = tab.id === 'tasks' && data.tasks?.filter(t => t.status === 'pending' && t.priority === 'high').length > 0;
                
                return (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''} ${hasAlert ? 'has-alert' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        title={`${tab.label}${stats ? ` (${stats})` : ''}`}
                    >
                        <span className="tab-label">{tab.label}</span>
                        {stats && <span className="tab-stats">{stats}</span>}
                        {hasAlert && <span className="tab-alert">!</span>}
                    </button>
                );
            })}
        </div>
    );
};