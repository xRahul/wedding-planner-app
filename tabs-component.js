const Tabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'dashboard', label: '📊 Dashboard' },
        { id: 'timeline', label: '📅 Timeline' },
        { id: 'guests', label: '👥 Guests' },
        { id: 'vendors', label: '🤝 Vendors' },
        { id: 'budget', label: '💰 Budget' },
        { id: 'tasks', label: '✅ Tasks' },
        { id: 'menus', label: '🍽️ Menus' },
        { id: 'shopping', label: '🛍️ Shopping' },
        { id: 'rituals', label: '🪔 Rituals' },
        { id: 'gifts', label: '🎁 Gifts' },
        { id: 'travel', label: '✈️ Travel' },
        { id: 'settings', label: '⚙️ Settings' }
    ];

    return (
        <div className="tabs">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};