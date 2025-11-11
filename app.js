const { useState, useEffect, useMemo } = React;

// ==================== MAIN APP COMPONENT ====================

const WeddingPlannerApp = () => {
    const [data, setData] = useState(DEFAULT_DATA);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            const newData = { ...data, [key]: value };
            setData(newData);
            setError(null);
        } catch (err) {
            console.error('Failed to update data:', err);
            setError('Failed to update data. Please try again.');
        }
    };

    return (
        <div>
            <Header weddingInfo={data.weddingInfo} />
            {error && (
                <div className="error-banner">
                    <div className="error-message">
                        <span>⚠️ {error}</span>
                        <button className="btn btn-small" onClick={() => setError(null)}>&times;</button>
                    </div>
                </div>
            )}
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="container">
                {activeTab === 'dashboard' && <Dashboard data={data} />}
                {activeTab === 'timeline' && <Timeline timeline={data.timeline} updateData={updateData} weddingDate={data.weddingInfo.weddingDate} />}
                {activeTab === 'guests' && <Guests guests={data.guests} updateData={updateData} data={data} />}
                {activeTab === 'vendors' && <Vendors vendors={data.vendors} updateData={updateData} />}
                {activeTab === 'budget' && <Budget budget={data.budget} updateData={updateData} totalBudget={data.weddingInfo.totalBudget} />}
                {activeTab === 'tasks' && <Tasks tasks={data.tasks} updateData={updateData} />}
                {activeTab === 'menus' && <Menus menus={data.menus} updateData={updateData} />}
                {activeTab === 'shopping' && <Shopping shopping={data.shopping} updateData={updateData} />}
                {activeTab === 'rituals' && <Rituals ritualsAndCustoms={data.ritualsAndCustoms} traditions={data.traditions} updateData={updateData} />}
                {activeTab === 'gifts' && <Gifts giftsAndFavors={data.giftsAndFavors} updateData={updateData} />}
                {activeTab === 'travel' && <Travel travel={data.travel} updateData={updateData} />}
                {activeTab === 'settings' && <Settings weddingInfo={data.weddingInfo} updateData={updateData} allData={data} setData={setData} />}
            </div>
        </div>
    );
};

// ==================== RENDER APP ====================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<WeddingPlannerApp />);
