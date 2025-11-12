const { useState, useEffect, useMemo } = React;

// ==================== MAIN APP COMPONENT ====================

const WeddingPlannerApp = () => {
    const [data, setData] = useState(DEFAULT_DATA);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { notification, showNotification, closeNotification } = useNotification();

    // Load initial data
    useEffect(() => {
        const initData = async () => {
            try {
                const loadedData = await loadData();
                setData(loadedData);
            } catch (error) {
                setError('Failed to load data: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    // Save data whenever it changes
    useEffect(() => {
        const saveDataAsync = async () => {
            try {
                await saveData(data);
                setError(null);
            } catch (err) {
                console.error('Failed to save data:', err);
                setError('Failed to save data. Please try exporting your data as a backup.');
            }
        };
        if (!loading) {
            saveDataAsync();
        }
    }, [data, loading]);

    const updateData = (key, value) => {
        try {
            if (!key) throw new Error('Invalid key');
            if (value === undefined) throw new Error('Invalid value');
            const newData = { ...data, [key]: value };
            setData(newData);
            setError(null);
        } catch (err) {
            console.error('Failed to update data:', err);
            setError('Failed to update data. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <Header weddingInfo={data.weddingInfo} />
            {error && (
                <div className="error-banner" role="alert">
                    <div className="error-message">
                        <span>⚠️ {error}</span>
                        <button className="btn btn-small" onClick={() => setError(null)} aria-label="Dismiss error">&times;</button>
                    </div>
                </div>
            )}
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={closeNotification} 
                />
            )}
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <main id="main-content" className="container">
                {activeTab === 'dashboard' && <Dashboard data={data} />}
                {activeTab === 'timeline' && <Timeline timeline={data.timeline} updateData={updateData} weddingDate={data.weddingInfo.weddingDate} />}
                {activeTab === 'guests' && <Guests guests={data.guests} updateData={updateData} data={data} />}
                {activeTab === 'vendors' && <Vendors vendors={data.vendors} updateData={updateData} budget={data.budget} />}
                {activeTab === 'budget' && <Budget budget={data.budget} updateData={updateData} totalBudget={data.weddingInfo.totalBudget} allData={data} />}
                {activeTab === 'tasks' && <Tasks tasks={data.tasks} updateData={updateData} />}
                {activeTab === 'menus' && <Menus menus={data.menus} updateData={updateData} budget={data.budget} />}
                {activeTab === 'shopping' && <Shopping shopping={data.shopping} updateData={updateData} budget={data.budget} />}
                {activeTab === 'rituals' && <Rituals ritualsAndCustoms={data.ritualsAndCustoms} traditions={data.traditions} updateData={updateData} />}
                {activeTab === 'gifts' && <Gifts giftsAndFavors={data.giftsAndFavors} updateData={updateData} budget={data.budget} />}
                {activeTab === 'travel' && <Travel travel={data.travel} updateData={updateData} budget={data.budget} />}
                {activeTab === 'settings' && <Settings weddingInfo={data.weddingInfo} updateData={updateData} allData={data} setData={setData} showNotification={showNotification} />}
            </main>
        </div>
    );
};

// ==================== RENDER APP ====================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary onReset={() => window.location.reload()}>
        <WeddingPlannerApp />
    </ErrorBoundary>
);
