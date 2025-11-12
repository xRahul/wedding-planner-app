const Header = ({ weddingInfo, data = {} }) => {
    const daysUntilWedding = Math.ceil((new Date(weddingInfo.weddingDate) - new Date()) / (1000 * 60 * 60 * 24));
    const totalTasks = data.tasks?.length || 0;
    const completedTasks = data.tasks?.filter(t => t.status === 'done').length || 0;
    const confirmedGuests = data.guests?.filter(g => g.rsvpStatus === 'yes').length || 0;
    const totalGuests = data.guests?.length || 0;
    const budgetUsed = data.budget?.reduce((sum, b) => sum + (b.actual || 0), 0) || 0;
    const totalBudget = weddingInfo.totalBudget || 1;
    
    const getCountdownMessage = () => {
        if (daysUntilWedding <= 0) return '🎉 Wedding Day!';
        if (daysUntilWedding === 1) return '⏰ Tomorrow!';
        if (daysUntilWedding <= 7) return `⚡ ${daysUntilWedding} days left`;
        if (daysUntilWedding <= 30) return `📅 ${daysUntilWedding} days to go`;
        return `🗓️ ${daysUntilWedding} days remaining`;
    };

    return (
        <div className="header">
            <div className="header-main">
                <h1>🪔 {weddingInfo.brideName} & {weddingInfo.groomName}</h1>
                <div className="header-subtitle">
                    <span>📅 {formatDate(weddingInfo.weddingDate)}</span>
                    <span>📍 {weddingInfo.location}</span>
                    <span className={`countdown ${daysUntilWedding <= 7 ? 'urgent' : ''}`}>
                        {getCountdownMessage()}
                    </span>
                </div>
            </div>

        </div>
    );
};