        const { useState, useEffect, useMemo } = React;

        // ==================== DATA STRUCTURE & STORAGE ====================
        
        const DEFAULT_DATA = {
            weddingInfo: {
                brideName: "Priya",
                groomName: "Rahul",
                weddingDate: "2025-12-15",
                location: "Bangalore",
                totalBudget: 2000000
            },
            timeline: [
                {
                    dayOffset: -2,
                    date: "2025-12-13",
                    events: [
                        { time: "18:00", ceremony: "Mehendi", description: "Mehendi ceremony at bride's home", vendors: ["mehendi_artist", "decorator"] }
                    ]
                },
                {
                    dayOffset: -1,
                    date: "2025-12-14",
                    events: [
                        { time: "19:00", ceremony: "Sangeet", description: "Sangeet night with music and dance", vendors: ["dj", "decorator", "caterer"] },
                        { time: "10:00", ceremony: "Haldi", description: "Haldi ceremony", vendors: ["decorator"] }
                    ]
                },
                {
                    dayOffset: 0,
                    date: "2025-12-15",
                    events: [
                        { time: "09:00", ceremony: "Shaadi", description: "Wedding ceremony", vendors: ["photographer", "videographer", "decorator", "caterer", "florist"] },
                        { time: "20:00", ceremony: "Reception", description: "Evening reception", vendors: ["dj", "caterer", "photographer"] }
                    ]
                },
                {
                    dayOffset: 1,
                    date: "2025-12-16",
                    events: [
                        { time: "11:00", ceremony: "Vidai", description: "Bride's farewell", vendors: ["photographer"] }
                    ]
                }
            ],
            guests: [
                { 
                    id: "g1", 
                    name: "Amit Sharma", 
                    category: "family", 
                    relation: "paternal_uncle",
                    side: "groom",
                    gotra: "Kashyap",
                    phone: "+91-9876543210", 
                    dietary: "veg", 
                    rsvpStatus: "yes",
                    familySize: 4,
                    arrival: "2025-12-13",
                    departure: "2025-12-16",
                    needsAccommodation: true,
                    needsTransport: true,
                    specialRequests: "Ground floor room preferred",
                    ritualsAttending: ["mehendi", "haldi", "wedding", "reception"],
                    notes: "Uncle from Delhi"
                },
                { 
                    id: "g2", 
                    name: "Neha Gupta", 
                    category: "friends", 
                    relation: "college_friend",
                    side: "bride",
                    phone: "+91-9876543211", 
                    dietary: "non_veg", 
                    rsvpStatus: "yes",
                    familySize: 2,
                    arrival: "2025-12-14",
                    departure: "2025-12-16",
                    needsAccommodation: false,
                    needsTransport: true,
                    ritualsAttending: ["sangeet", "wedding", "reception"],
                    notes: "College friend"
                },
                { 
                    id: "g3", 
                    name: "Rajesh Kumar", 
                    category: "family", 
                    relation: "maternal_cousin",
                    side: "bride",
                    gotra: "Bharadwaj",
                    phone: "+91-9876543212", 
                    dietary: "veg", 
                    rsvpStatus: "pending",
                    familySize: 3,
                    needsAccommodation: true,
                    needsTransport: true,
                    ritualsAttending: ["mehendi", "sangeet", "haldi", "wedding", "reception"],
                    notes: "Cousin from mother's side"
                }
            ],
            vendors: [
                { id: "v1", type: "photographer", name: "Capture Moments Studio", contact: "+91-9988776655", email: "info@capturemoments.com", cost: 150000, status: "confirmed", notes: "Top-rated photographer" },
                { id: "v2", type: "caterer", name: "Royal Caterers", contact: "+91-9988776656", email: "contact@royalcaterers.com", cost: 500000, status: "confirmed", notes: "Specializes in North Indian cuisine" },
                { id: "v3", type: "decorator", name: "Dream Decor", contact: "+91-9988776657", email: "hello@dreamdecor.com", cost: 300000, status: "booked", notes: "Floral specialist" }
            ],
            budget: [
                { category: "venue", planned: 400000, actual: 400000, subcategories: ["mandap", "ceremony_hall", "dining_area"] },
                { category: "catering", planned: 500000, actual: 500000, subcategories: ["breakfast", "lunch", "dinner", "snacks", "beverages"] },
                { category: "decor", planned: 300000, actual: 300000, subcategories: ["flowers", "lighting", "stage", "entrance"] },
                { category: "bride", planned: 300000, actual: 250000, subcategories: ["lehenga", "jewelry", "makeup", "mehendi"] },
                { category: "groom", planned: 200000, actual: 150000, subcategories: ["sherwani", "accessories", "grooming"] },
                { category: "pandit_and_rituals", planned: 100000, actual: 80000, subcategories: ["pandit_services", "havan_samagri", "ritual_items"] },
                { category: "entertainment", planned: 250000, actual: 200000, subcategories: ["dj", "band", "sangeet_performers", "dancers"] },
                { category: "photography", planned: 300000, actual: 250000, subcategories: ["photos", "videos", "drone", "album"] },
                { category: "invitations", planned: 100000, actual: 80000, subcategories: ["cards", "boxes", "favors"] },
                { category: "gifts", planned: 200000, actual: 150000, subcategories: ["family_gifts", "guest_favors", "return_gifts"] },
                { category: "transport", planned: 150000, actual: 100000, subcategories: ["guest_transport", "baraat", "bride_car"] },
                { category: "accommodation", planned: 200000, actual: 150000, subcategories: ["family_stay", "guest_rooms", "bride_suite"] },
                { category: "other", planned: 300000, actual: 200000, subcategories: ["insurance", "permits", "contingency"] }
            ],
            tasks: [
                { id: "t1", description: "Book wedding venue", deadline: "2025-11-01", assignedTo: "Rahul", status: "done", priority: "high" },
                { id: "t2", description: "Send wedding invitations", deadline: "2025-11-15", assignedTo: "Priya", status: "done", priority: "high" },
                { id: "t3", description: "Finalize guest list", deadline: "2025-11-20", assignedTo: "Both", status: "pending", priority: "high" },
                { id: "t4", description: "Book honeymoon tickets", deadline: "2025-12-01", assignedTo: "Rahul", status: "pending", priority: "medium" }
            ],
            menus: [
                {
                    event: "Mehendi",
                    items: [
                        { name: "Samosa", quantity: 200 },
                        { name: "Chai", quantity: 150 },
                        { name: "Pakoras", quantity: 150 }
                    ]
                },
                {
                    event: "Sangeet",
                    items: [
                        { name: "Paneer Tikka", quantity: 200 },
                        { name: "Chicken Tikka", quantity: 150 },
                        { name: "Veg Biryani", quantity: 200 },
                        { name: "Ice Cream", quantity: 200 }
                    ]
                },
                {
                    event: "Shaadi",
                    items: [
                        { name: "Paneer Butter Masala", quantity: 300 },
                        { name: "Dal Makhani", quantity: 300 },
                        { name: "Naan", quantity: 600 },
                        { name: "Biryani", quantity: 300 },
                        { name: "Gulab Jamun", quantity: 300 },
                        { name: "Rasgulla", quantity: 300 }
                    ]
                },
                {
                    event: "Reception",
                    items: [
                        { name: "Welcome Drinks Counter", quantity: 300 },
                        { name: "Live Chaat Counter", quantity: 250 },
                        { name: "Pani Puri Counter", quantity: 250 },
                        { name: "Dosa Counter", quantity: 200 },
                        { name: "Indian Street Food Station", quantity: 250 },
                        { name: "Live Grill Counter", quantity: 200 },
                        { name: "North Indian Main Course", quantity: 300 },
                        { name: "South Indian Main Course", quantity: 200 },
                        { name: "Live Tandoor Station", quantity: 250 },
                        { name: "Oriental Station", quantity: 200 },
                        { name: "Dessert Bar", quantity: 300 },
                        { name: "Ice Cream Counter", quantity: 300 },
                        { name: "Paan Counter", quantity: 300 }
                    ]
                }
            ],
            travel: {
                accommodations: [
                    { hotel: "Grand Palace Hotel", checkIn: "2025-12-13", checkOut: "2025-12-17", guests: ["Amit Sharma", "Family"] },
                    { hotel: "Comfort Inn", checkIn: "2025-12-14", checkOut: "2025-12-16", guests: ["Out-of-town friends"] }
                ],
                transport: [
                    { type: "flight", details: "Delhi to Bangalore - AI 502", date: "2025-12-13" },
                    { type: "car", details: "Wedding venue shuttle service", date: "2025-12-15" }
                ]
            },
            ritualsAndCustoms: {
                preWedding: [
                    {
                        name: "Roka",
                        description: "The unofficial engagement ceremony",
                        items: ["Coconut", "Sweets", "Dry Fruits", "Gifts for Exchange"],
                        participants: ["Bride", "Groom", "Immediate Family"],
                        status: "completed",
                        date: "2025-10-15"
                    }
                ],
                mainCeremonies: [
                    {
                        name: "Ganesh Puja",
                        items: ["Ganesh Idol", "Red Cloth", "Flowers", "Sweets", "Puja Items"],
                        pandits: ["Main Pandit"],
                        status: "pending",
                        date: "2025-12-13"
                    }
                ],
                customs: [
                    {
                        name: "Joota Chupai",
                        side: "bride",
                        participants: ["Bride's Sisters", "Cousins"],
                        negotiatedAmount: 11000,
                        status: "planned"
                    }
                ]
            },
            giftsAndFavors: {
                familyGifts: [
                    {
                        relation: "maternal_uncle",
                        traditional: "Pagdi, Shawl",
                        modern: "Watch",
                        budget: 25000,
                        quantity: 2,
                        status: "pending"
                    }
                ],
                returnGifts: [
                    {
                        event: "Reception",
                        item: "Silver Coin with Box",
                        quantity: 200,
                        cost: 1000,
                        status: "ordered"
                    }
                ],
                specialGifts: [
                    {
                        for: "Parents",
                        items: ["Gold Chain", "Silk Saree", "Watch"],
                        budget: 200000,
                        status: "planning"
                    }
                ]
            },
            shopping: {
                bride: [
                    {
                        event: "Wedding",
                        items: [
                            { item: "Bridal Lehenga", budget: 200000, status: "pending", notes: "Red color preferred" },
                            { item: "Jewelry Set", budget: 500000, status: "pending", notes: "Kundan set" },
                            { item: "Footwear", budget: 10000, status: "pending" },
                            { item: "Clutch", budget: 15000, status: "pending" }
                        ]
                    }
                ],
                groom: [
                    {
                        event: "Wedding",
                        items: [
                            { item: "Sherwani", budget: 100000, status: "pending", notes: "Cream or Beige" },
                            { item: "Safa", budget: 10000, status: "pending" },
                            { item: "Jewelry", budget: 50000, status: "pending", notes: "Including kalgi" }
                        ]
                    }
                ],
                family: [
                    {
                        for: "Mother of Bride",
                        items: [
                            { item: "Silk Saree", budget: 50000, status: "pending", notes: "For wedding" },
                            { item: "Jewelry", budget: 100000, status: "pending" }
                        ]
                    }
                ]
            },
            traditions: {
                preWedding: [
                    {
                        name: "Kalash Purchase",
                        description: "Buying auspicious items for puja",
                        requiredItems: [
                            "Copper/Bronze Kalash",
                            "Coconut",
                            "Mango Leaves",
                            "Red Thread",
                            "Rice",
                            "Coins"
                        ],
                        responsible: "Bride's Mother",
                        status: "pending"
                    }
                ],
                ritual_items: [
                    {
                        ceremony: "Wedding",
                        items: [
                            { item: "Mangalsutra", budget: 100000, status: "pending" },
                            { item: "Sindoor", budget: 1000, status: "pending" },
                            { item: "Wedding Garlands", budget: 20000, status: "pending" },
                            { item: "Havan Samagri", budget: 10000, status: "pending" }
                        ]
                    }
                ]
            }
        };

        // Storage implementation with database sync
        const loadData = async () => {
            try {
                const data = await window.storageManager.loadData();
                if (!data) {
                    return { ...DEFAULT_DATA };
                }
                
                // Validate data structure
                const requiredKeys = ['weddingInfo', 'timeline', 'guests', 'vendors', 'budget', 'tasks', 'menus', 'travel'];
                const missingKeys = requiredKeys.filter(key => !data[key]);
                
                if (missingKeys.length > 0) {
                    console.warn('Missing required keys in saved data:', missingKeys);
                    return { ...DEFAULT_DATA };
                }
                
                // Merge with default data to ensure any new fields are included
                return {
                    ...DEFAULT_DATA,
                    ...data,
                    weddingInfo: { ...DEFAULT_DATA.weddingInfo, ...data.weddingInfo }
                };
            } catch (error) {
                console.error('Error loading data:', error);
                return { ...DEFAULT_DATA };
            }
        };

        const saveData = async (data) => {
            try {
                // Validate data before saving
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid data format');
                }
                
                // Ensure all required fields are present
                const requiredKeys = ['weddingInfo', 'timeline', 'guests', 'vendors', 'budget', 'tasks', 'menus', 'travel'];
                const missingKeys = requiredKeys.filter(key => !data[key]);
                
                if (missingKeys.length > 0) {
                    throw new Error(`Missing required keys: ${missingKeys.join(', ')}`);
                }
                
                await window.storageManager.saveData(data);
                console.log('Data saved successfully to database and local storage');
            } catch (error) {
                console.error('Error saving data:', error);
                throw error; // Re-throw to handle in UI
            }
        };

        // ==================== UTILITY FUNCTIONS ====================

        // Validation functions
        const validateWeddingInfo = (info) => {
            const errors = {};
            if (!info.brideName?.trim()) errors.brideName = 'Bride name is required';
            if (!info.groomName?.trim()) errors.groomName = 'Groom name is required';
            if (!info.weddingDate) errors.weddingDate = 'Wedding date is required';
            if (!info.location?.trim()) errors.location = 'Location is required';
            if (!info.totalBudget || info.totalBudget <= 0) errors.totalBudget = 'Valid total budget is required';
            return Object.keys(errors).length ? errors : null;
        };

        const validateGuest = (guest) => {
            const errors = {};
            if (!guest.name?.trim()) errors.name = 'Name is required';
            if (!guest.category) errors.category = 'Category is required';
            if (!guest.side) errors.side = 'Bride/Groom side must be specified';
            if (!guest.relation) errors.relation = 'Relation is required';
            if (guest.phone && !/^[\d\s+()-]+$/.test(guest.phone)) errors.phone = 'Invalid phone number';
            if (guest.familySize && (isNaN(guest.familySize) || guest.familySize < 1)) errors.familySize = 'Valid family size is required';
            if (guest.arrival && !isValidDate(guest.arrival)) errors.arrival = 'Valid arrival date is required';
            if (guest.departure && !isValidDate(guest.departure)) errors.departure = 'Valid departure date is required';
            if (guest.departure && guest.arrival && new Date(guest.departure) < new Date(guest.arrival)) {
                errors.departure = 'Departure date cannot be before arrival date';
            }
            if (!guest.ritualsAttending || guest.ritualsAttending.length === 0) errors.ritualsAttending = 'Please select at least one ritual to attend';
            return Object.keys(errors).length ? errors : null;
        };

        const isValidDate = (dateString) => {
            const date = new Date(dateString);
            return date instanceof Date && !isNaN(date);
        };

        const validateVendor = (vendor) => {
            const errors = {};
            if (!vendor.name?.trim()) errors.name = 'Name is required';
            if (!vendor.type) errors.type = 'Vendor type is required';
            if (!vendor.cost || vendor.cost < 0) errors.cost = 'Valid cost is required';
            if (vendor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendor.email)) errors.email = 'Invalid email';
            return Object.keys(errors).length ? errors : null;
        };

        const validateTimelineEvent = (event) => {
            const errors = {};
            if (!event.ceremony?.trim()) errors.ceremony = 'Ceremony name is required';
            if (!event.time?.trim()) errors.time = 'Event time is required';
            if (!event.description?.trim()) errors.description = 'Event description is required';
            return Object.keys(errors).length ? errors : null;
        };

        const validateMenuItem = (item) => {
            const errors = {};
            if (!item.name?.trim()) errors.name = 'Item name is required';
            if (!item.quantity || item.quantity <= 0) errors.quantity = 'Valid quantity is required';
            return Object.keys(errors).length ? errors : null;
        };

        const validateTravelItem = (item, type) => {
            const errors = {};
            if (type === 'accommodation') {
                if (!item.hotel?.trim()) errors.hotel = 'Hotel name is required';
                if (!item.checkIn) errors.checkIn = 'Check-in date is required';
                if (!item.checkOut) errors.checkOut = 'Check-out date is required';
                if (!item.guests?.length) errors.guests = 'At least one guest must be assigned';
            } else if (type === 'transport') {
                if (!item.type?.trim()) errors.type = 'Transport type is required';
                if (!item.details?.trim()) errors.details = 'Transport details are required';
                if (!item.date) errors.date = 'Date is required';
            }
            return Object.keys(errors).length ? errors : null;
        };

        const generateId = () => {
            return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        };

        const formatDate = (dateString, withTime = false) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
            };
            return date.toLocaleDateString('en-IN', options);
        };

        const isDatePassed = (dateString) => {
            const date = new Date(dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
        };

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(amount);
        };

        const getDayLabel = (offset) => {
            if (offset === 0) return "Wedding Day";
            if (offset < 0) return `${Math.abs(offset)} Day${Math.abs(offset) > 1 ? 's' : ''} Before`;
            return `${offset} Day${offset > 1 ? 's' : ''} After`;
        };

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
                        setError(null); // Clear any previous errors
                    } catch (err) {
                        console.error('Failed to save data:', err);
                        setError('Failed to save data. Please try exporting your data as a backup.');
                    }
                };
                if (!loading) { // Only save if not in initial loading state
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
                        {activeTab === 'guests' && <Guests guests={data.guests} updateData={updateData} />}
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

        // ==================== HEADER COMPONENT ====================

        const Header = ({ weddingInfo }) => {
            return (
                <div className="header">
                    <h1>💒 {weddingInfo.brideName} &amp; {weddingInfo.groomName}'s Wedding</h1>
                    <p>{formatDate(weddingInfo.weddingDate)} • {weddingInfo.location}</p>
                </div>
            );
        };

        // ==================== TABS COMPONENT ====================

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

        // ==================== DASHBOARD COMPONENT ====================

        const Dashboard = ({ data }) => {
            const stats = useMemo(() => {
                const totalGuests = data.guests.length;
                const confirmedGuests = data.guests.filter(g => g.rsvpStatus === 'yes').length;
                const totalBudgetSpent = data.budget.reduce((sum, cat) => sum + cat.actual, 0);
                const pendingTasks = data.tasks.filter(t => t.status === 'pending').length;
                const daysUntilWedding = Math.ceil((new Date(data.weddingInfo.weddingDate) - new Date()) / (1000 * 60 * 60 * 24));
                const budgetPercentage = (totalBudgetSpent / data.weddingInfo.totalBudget * 100).toFixed(1);

                return { totalGuests, confirmedGuests, totalBudgetSpent, pendingTasks, daysUntilWedding, budgetPercentage };
            }, [data]);

            return (
                <div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{stats.daysUntilWedding}</div>
                            <div className="stat-label">Days Until Wedding</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.confirmedGuests}/{stats.totalGuests}</div>
                            <div className="stat-label">Confirmed Guests</div>
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
                        {data.budget.map(cat => {
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
                        <h2 className="card-title">Upcoming High Priority Tasks</h2>
                        {data.tasks.filter(t => t.status === 'pending' && t.priority === 'high').length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {data.tasks.filter(t => t.status === 'pending' && t.priority === 'high').map(task => (
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

        // ==================== TIMELINE COMPONENT ====================

        const Timeline = ({ timeline, updateData, weddingDate }) => {
            const [editingEvent, setEditingEvent] = useState(null);
            const [showModal, setShowModal] = useState(false);

            const sortedTimeline = useMemo(() => {
                return [...timeline].sort((a, b) => a.dayOffset - b.dayOffset);
            }, [timeline]);

            const handleAddEvent = (dayOffset) => {
                setEditingEvent({
                    dayOffset,
                    time: '10:00',
                    ceremony: 'Mehendi',
                    description: '',
                    vendors: []
                });
                setShowModal(true);
            };

            const handleSaveEvent = (event) => {
                const updatedTimeline = [...timeline];
                const dayIndex = updatedTimeline.findIndex(d => d.dayOffset === event.dayOffset);
                
                if (dayIndex >= 0) {
                    if (!updatedTimeline[dayIndex].events) {
                        updatedTimeline[dayIndex].events = [];
                    }
                    updatedTimeline[dayIndex].events.push({
                        time: event.time,
                        ceremony: event.ceremony,
                        description: event.description,
                        vendors: event.vendors
                    });
                } else {
                    const weddingDateObj = new Date(weddingDate);
                    const eventDate = new Date(weddingDateObj);
                    eventDate.setDate(eventDate.getDate() + event.dayOffset);
                    
                    updatedTimeline.push({
                        dayOffset: event.dayOffset,
                        date: eventDate.toISOString().split('T')[0],
                        events: [{
                            time: event.time,
                            ceremony: event.ceremony,
                            description: event.description,
                            vendors: event.vendors
                        }]
                    });
                }
                
                updateData('timeline', updatedTimeline);
                setShowModal(false);
                setEditingEvent(null);
            };

            const handleDeleteEvent = (dayOffset, eventIndex) => {
                if (confirm('Delete this event?')) {
                    const updatedTimeline = [...timeline];
                    const dayIndex = updatedTimeline.findIndex(d => d.dayOffset === dayOffset);
                    if (dayIndex >= 0) {
                        updatedTimeline[dayIndex].events.splice(eventIndex, 1);
                        if (updatedTimeline[dayIndex].events.length === 0) {
                            updatedTimeline.splice(dayIndex, 1);
                        }
                        updateData('timeline', updatedTimeline);
                    }
                }
            };

            return (
                <div>
                    <div className="card">
                        <div className="flex-between">
                            <h2 className="card-title">Wedding Timeline</h2>
                            <button className="btn btn-primary" onClick={() => handleAddEvent(0)}>Add Event</button>
                        </div>
                    </div>

                    <div className="timeline-grid">
                        {sortedTimeline.map(day => (
                            <div key={day.dayOffset} className="timeline-day">
                                <div className="timeline-day-header">
                                    {getDayLabel(day.dayOffset)} - {formatDate(day.date)}
                                </div>
                                {day.events && day.events.length > 0 ? (
                                    day.events.map((event, idx) => (
                                        <div key={idx} className="timeline-event">
                                            <div className="flex-between">
                                                <div>
                                                    <strong style={{ fontSize: '16px' }}>{event.ceremony}</strong>
                                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                                        🕐 {event.time}
                                                    </div>
                                                </div>
                                                <button 
                                                    className="btn btn-danger btn-small"
                                                    onClick={() => handleDeleteEvent(day.dayOffset, idx)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            {event.description && (
                                                <p style={{ margin: '8px 0', fontSize: '14px' }}>{event.description}</p>
                                            )}
                                            {event.vendors && event.vendors.length > 0 && (
                                                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                                                    <strong>Vendors:</strong> {event.vendors.map(v => v.replace('_', ' ')).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                        No events scheduled
                                    </div>
                                )}
                                <button 
                                    className="btn btn-outline btn-small mt-lg"
                                    onClick={() => handleAddEvent(day.dayOffset)}
                                    style={{ width: '100%' }}
                                >
                                    Add Event to This Day
                                </button>
                            </div>
                        ))}
                    </div>

                    {showModal && (
                        <TimelineEventModal
                            event={editingEvent}
                            onSave={handleSaveEvent}
                            onClose={() => { setShowModal(false); setEditingEvent(null); }}
                        />
                    )}
                </div>
            );
        };

        const TimelineEventModal = ({ event, onSave, onClose }) => {
            const [formData, setFormData] = useState(event);

            const ceremonies = [
                'Roka', 'Sagan', 'Tilak', 
                'Mehendi', 'Sangeet', 'Haldi', 
                'Ganesh Puja', 'Mandap Muhurat', 'Kalash Sthapna',
                'Baraat', 'Jaimala', 'Pheras', 
                'Vidai', 'Reception', 'Grih Pravesh'
            ];
            const vendorTypes = [
                'pandit_ji', 'decorator', 'caterer', 'dj', 
                'photographer', 'videographer', 'florist', 
                'mehendi_artist', 'makeup_artist', 'choreographer',
                'band_baja', 'dhol_players', 'light_setup',
                'wedding_planner', 'invitation_cards', 'transport',
                'tent_house', 'sound_system', 'fireworks',
                'stage_setup', 'varmala_setup', 'luxury_car_rental'
            ];

            const handleVendorToggle = (vendor) => {
                const vendors = formData.vendors || [];
                const newVendors = vendors.includes(vendor)
                    ? vendors.filter(v => v !== vendor)
                    : [...vendors, vendor];
                setFormData({ ...formData, vendors: newVendors });
            };

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add Event</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Ceremony</label>
                                <select 
                                    className="form-select"
                                    value={formData.ceremony}
                                    onChange={e => setFormData({ ...formData, ceremony: e.target.value })}
                                >
                                    {ceremonies.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Time</label>
                                <input 
                                    type="time"
                                    className="form-input"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea 
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Vendors Assigned</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                    {vendorTypes.map(vendor => (
                                        <label key={vendor} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                            <input
                                                type="checkbox"
                                                checked={(formData.vendors || []).includes(vendor)}
                                                onChange={() => handleVendorToggle(vendor)}
                                            />
                                            {vendor.replace('_', ' ')}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button className="btn btn-primary" onClick={() => onSave(formData)}>Save Event</button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== GUESTS COMPONENT ====================

        const Guests = ({ guests, updateData }) => {
            const [showModal, setShowModal] = useState(false);
            const [editingGuest, setEditingGuest] = useState(null);
            const [filter, setFilter] = useState('all');

            const filteredGuests = useMemo(() => {
                if (filter === 'all') return guests;
                return guests.filter(g => g.category === filter || g.rsvpStatus === filter);
            }, [guests, filter]);

            const handleAdd = () => {
                setEditingGuest({
                    id: generateId(),
                    name: '',
                    category: 'family',
                    phone: '',
                    dietary: 'veg',
                    rsvpStatus: 'pending',
                    notes: ''
                });
                setShowModal(true);
            };

            const handleEdit = (guest) => {
                setEditingGuest({ ...guest });
                setShowModal(true);
            };

            const handleSave = (guest) => {
                const index = guests.findIndex(g => g.id === guest.id);
                let updatedGuests;
                if (index >= 0) {
                    updatedGuests = [...guests];
                    updatedGuests[index] = guest;
                } else {
                    updatedGuests = [...guests, guest];
                }
                updateData('guests', updatedGuests);
                setShowModal(false);
                setEditingGuest(null);
            };

            const handleDelete = (id) => {
                if (confirm('Delete this guest?')) {
                    updateData('guests', guests.filter(g => g.id !== id));
                }
            };

            const stats = useMemo(() => {
                return {
                    total: guests.length,
                    confirmed: guests.filter(g => g.rsvpStatus === 'yes').length,
                    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
                    declined: guests.filter(g => g.rsvpStatus === 'no').length
                };
            }, [guests]);

            return (
                <div>
                    <div className="card">
                        <div className="flex-between">
                            <h2 className="card-title">Guest List ({stats.total} total)</h2>
                            <button className="btn btn-primary" onClick={handleAdd}>Add Guest</button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                            <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter('all')}>All</button>
                            <button className={`btn ${filter === 'family' ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter('family')}>Family</button>
                            <button className={`btn ${filter === 'friends' ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter('friends')}>Friends</button>
                            <button className={`btn ${filter === 'yes' ? 'btn-success' : 'btn-outline'} btn-small`} onClick={() => setFilter('yes')}>Confirmed ({stats.confirmed})</button>
                            <button className={`btn ${filter === 'pending' ? 'btn-outline' : 'btn-outline'} btn-small`} onClick={() => setFilter('pending')}>Pending ({stats.pending})</button>
                        </div>
                    </div>

                    <div className="card">
                        {filteredGuests.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Phone</th>
                                            <th>Dietary</th>
                                            <th>RSVP</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGuests.map(guest => (
                                            <tr key={guest.id}>
                                                <td><strong>{guest.name}</strong></td>
                                                <td style={{ textTransform: 'capitalize' }}>{guest.category}</td>
                                                <td>{guest.phone}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{guest.dietary.replace('_', ' ')}</td>
                                                <td>
                                                    <span className={`badge ${guest.rsvpStatus === 'yes' ? 'badge-success' : guest.rsvpStatus === 'no' ? 'badge-error' : 'badge-warning'}`}>
                                                        {guest.rsvpStatus === 'yes' ? 'Confirmed' : guest.rsvpStatus === 'no' ? 'Declined' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '12px' }}>{guest.notes}</td>
                                                <td>
                                                    <button className="btn btn-outline btn-small" onClick={() => handleEdit(guest)}>Edit</button>
                                                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(guest.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">👥</div>
                                <p>No guests found</p>
                            </div>
                        )}
                    </div>

                    {showModal && (
                        <GuestModal
                            guest={editingGuest}
                            onSave={handleSave}
                            onClose={() => { setShowModal(false); setEditingGuest(null); }}
                        />
                    )}
                </div>
            );
        };

        const GuestModal = ({ guest, onSave, onClose }) => {
            const [formData, setFormData] = useState(guest);

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{guest.name ? 'Edit Guest' : 'Add Guest'}</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Name *</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select 
                                    className="form-select"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="family">Family</option>
                                    <option value="friends">Friends</option>
                                    <option value="relatives">Relatives</option>
                                    <option value="family_friends">Family Friends</option>
                                    <option value="colleagues">Colleagues</option>
                                    <option value="vendors">Vendors</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Side</label>
                                <select 
                                    className="form-select"
                                    value={formData.side}
                                    onChange={e => setFormData({ ...formData, side: e.target.value })}
                                >
                                    <option value="bride">Bride's Side</option>
                                    <option value="groom">Groom's Side</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Relation</label>
                                <select 
                                    className="form-select"
                                    value={formData.relation}
                                    onChange={e => setFormData({ ...formData, relation: e.target.value })}
                                >
                                    <optgroup label="Family">
                                        <option value="maternal_uncle">Maternal Uncle (Mama)</option>
                                        <option value="maternal_aunt">Maternal Aunt (Mami)</option>
                                        <option value="paternal_uncle">Paternal Uncle (Chacha)</option>
                                        <option value="paternal_aunt">Paternal Aunt (Chachi)</option>
                                        <option value="father_sister">Father's Sister (Bua)</option>
                                        <option value="mother_sister">Mother's Sister (Mausi)</option>
                                        <option value="cousin">Cousin</option>
                                    </optgroup>
                                    <optgroup label="Others">
                                        <option value="family_friend">Family Friend</option>
                                        <option value="college_friend">College Friend</option>
                                        <option value="work_colleague">Work Colleague</option>
                                        <option value="neighbor">Neighbor</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gotra (if applicable)</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.gotra || ''}
                                    onChange={e => setFormData({ ...formData, gotra: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input 
                                    type="tel"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dietary Preference</label>
                                <select 
                                    className="form-select"
                                    value={formData.dietary}
                                    onChange={e => setFormData({ ...formData, dietary: e.target.value })}
                                >
                                    <option value="veg">Veg</option>
                                    <option value="non_veg">Non-Veg</option>
                                    <option value="vegan">Vegan</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">RSVP Status</label>
                                <select 
                                    className="form-select"
                                    value={formData.rsvpStatus}
                                    onChange={e => setFormData({ ...formData, rsvpStatus: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="yes">Confirmed</option>
                                    <option value="no">Declined</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea 
                                    className="form-textarea"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => onSave(formData)}
                                disabled={!formData.name}
                            >
                                Save Guest
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== VENDORS COMPONENT ====================

        const Vendors = ({ vendors, updateData }) => {
            const [showModal, setShowModal] = useState(false);
            const [editingVendor, setEditingVendor] = useState(null);
            const [filter, setFilter] = useState('all');

            const filteredVendors = useMemo(() => {
                if (filter === 'all') return vendors;
                return vendors.filter(v => v.type === filter || v.status === filter);
            }, [vendors, filter]);

            const handleAdd = () => {
                setEditingVendor({
                    id: generateId(),
                    type: 'decorator',
                    name: '',
                    contact: '',
                    email: '',
                    cost: 0,
                    status: 'pending',
                    notes: ''
                });
                setShowModal(true);
            };

            const handleEdit = (vendor) => {
                setEditingVendor({ ...vendor });
                setShowModal(true);
            };

            const handleSave = (vendor) => {
                const index = vendors.findIndex(v => v.id === vendor.id);
                let updatedVendors;
                if (index >= 0) {
                    updatedVendors = [...vendors];
                    updatedVendors[index] = vendor;
                } else {
                    updatedVendors = [...vendors, vendor];
                }
                updateData('vendors', updatedVendors);
                setShowModal(false);
                setEditingVendor(null);
            };

            const handleDelete = (id) => {
                if (confirm('Delete this vendor?')) {
                    updateData('vendors', vendors.filter(v => v.id !== id));
                }
            };

            const totalCost = useMemo(() => {
                return vendors.reduce((sum, v) => sum + (v.cost || 0), 0);
            }, [vendors]);

            return (
                <div>
                    <div className="card">
                        <div className="flex-between">
                            <h2 className="card-title">Vendors ({vendors.length} total)</h2>
                            <button className="btn btn-primary" onClick={handleAdd}>Add Vendor</button>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <strong>Total Vendor Cost: {formatCurrency(totalCost)}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                            <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter('all')}>All</button>
                            <button className={`btn ${filter === 'confirmed' ? 'btn-success' : 'btn-outline'} btn-small`} onClick={() => setFilter('confirmed')}>Confirmed</button>
                            <button className={`btn ${filter === 'booked' ? 'btn-outline' : 'btn-outline'} btn-small`} onClick={() => setFilter('booked')}>Booked</button>
                            <button className={`btn ${filter === 'pending' ? 'btn-outline' : 'btn-outline'} btn-small`} onClick={() => setFilter('pending')}>Pending</button>
                        </div>
                    </div>

                    <div className="card">
                        {filteredVendors.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Name</th>
                                            <th>Contact</th>
                                            <th>Email</th>
                                            <th>Cost</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVendors.map(vendor => (
                                            <tr key={vendor.id}>
                                                <td style={{ textTransform: 'capitalize' }}>{vendor.type.replace('_', ' ')}</td>
                                                <td><strong>{vendor.name}</strong></td>
                                                <td>{vendor.contact}</td>
                                                <td style={{ fontSize: '12px' }}>{vendor.email}</td>
                                                <td>{formatCurrency(vendor.cost)}</td>
                                                <td>
                                                    <span className={`badge ${vendor.status === 'confirmed' ? 'badge-success' : vendor.status === 'booked' ? 'badge-info' : 'badge-warning'}`}>
                                                        {vendor.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-outline btn-small" onClick={() => handleEdit(vendor)}>Edit</button>
                                                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(vendor.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🤝</div>
                                <p>No vendors found</p>
                            </div>
                        )}
                    </div>

                    {showModal && (
                        <VendorModal
                            vendor={editingVendor}
                            onSave={handleSave}
                            onClose={() => { setShowModal(false); setEditingVendor(null); }}
                        />
                    )}
                </div>
            );
        };

        const VendorModal = ({ vendor, onSave, onClose }) => {
            const [formData, setFormData] = useState(vendor);

            const vendorTypes = [
                'pandit_ji', 'decorator', 'caterer', 'dj', 
                'photographer', 'videographer', 'florist', 
                'mehendi_artist', 'makeup_artist', 'choreographer',
                'band_baja', 'dhol_players', 'light_setup',
                'wedding_planner', 'invitation_cards', 'transport',
                'tent_house', 'sound_system', 'fireworks',
                'stage_setup', 'varmala_setup', 'luxury_car_rental'
            ];

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{vendor.name ? 'Edit Vendor' : 'Add Vendor'}</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Vendor Type</label>
                                <select 
                                    className="form-select"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {vendorTypes.map(type => (
                                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Name *</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contact Number</label>
                                <input 
                                    type="tel"
                                    className="form-input"
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input 
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cost (₹)</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={formData.cost}
                                    onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Booking Status</label>
                                <select 
                                    className="form-select"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="booked">Booked</option>
                                    <option value="confirmed">Confirmed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea 
                                    className="form-textarea"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => onSave(formData)}
                                disabled={!formData.name}
                            >
                                Save Vendor
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== BUDGET COMPONENT ====================

        const Budget = ({ budget, updateData, totalBudget }) => {
            const [editingCategory, setEditingCategory] = useState(null);

            const handleUpdate = (category, field, value) => {
                const updatedBudget = budget.map(cat => 
                    cat.category === category ? { ...cat, [field]: parseFloat(value) || 0 } : cat
                );
                updateData('budget', updatedBudget);
                setEditingCategory(null);
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
                        <h2 className="card-title">Budget Tracker</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{formatCurrency(totalBudget)}</div>
                                <div className="stat-label">Total Budget</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{formatCurrency(totals.totalActual)}</div>
                                <div className="stat-label">Spent</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value" style={{ color: totals.remaining >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                    {formatCurrency(totals.remaining)}
                                </div>
                                <div className="stat-label">Remaining</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{((totals.totalActual / totalBudget) * 100).toFixed(1)}%</div>
                                <div className="stat-label">Budget Used</div>
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
                                onClick={() => {
                                    onSave(category.category, 'planned', planned);
                                    onSave(category.category, 'actual', actual);
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== TASKS COMPONENT ====================

        const Tasks = ({ tasks, updateData }) => {
            const [showModal, setShowModal] = useState(false);
            const [editingTask, setEditingTask] = useState(null);
            const [filter, setFilter] = useState('all');

            const filteredTasks = useMemo(() => {
                if (filter === 'all') return tasks;
                return tasks.filter(t => t.status === filter || t.priority === filter);
            }, [tasks, filter]);

            const handleAdd = () => {
                setEditingTask({
                    id: generateId(),
                    description: '',
                    deadline: '',
                    assignedTo: '',
                    status: 'pending',
                    priority: 'medium'
                });
                setShowModal(true);
            };

            const handleEdit = (task) => {
                setEditingTask({ ...task });
                setShowModal(true);
            };

            const handleSave = (task) => {
                const index = tasks.findIndex(t => t.id === task.id);
                let updatedTasks;
                if (index >= 0) {
                    updatedTasks = [...tasks];
                    updatedTasks[index] = task;
                } else {
                    updatedTasks = [...tasks, task];
                }
                updateData('tasks', updatedTasks);
                setShowModal(false);
                setEditingTask(null);
            };

            const handleDelete = (id) => {
                if (confirm('Delete this task?')) {
                    updateData('tasks', tasks.filter(t => t.id !== id));
                }
            };

            const handleToggleStatus = (id) => {
                const updatedTasks = tasks.map(t => 
                    t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t
                );
                updateData('tasks', updatedTasks);
            };

            const stats = useMemo(() => {
                return {
                    total: tasks.length,
                    done: tasks.filter(t => t.status === 'done').length,
                    pending: tasks.filter(t => t.status === 'pending').length,
                    high: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length
                };
            }, [tasks]);

            return (
                <div>
                    <div className="card">
                        <div className="flex-between">
                            <h2 className="card-title">Tasks Checklist ({stats.done}/{stats.total} completed)</h2>
                            <button className="btn btn-primary" onClick={handleAdd}>Add Task</button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                            <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter('all')}>All</button>
                            <button className={`btn ${filter === 'pending' ? 'btn-outline' : 'btn-outline'} btn-small`} onClick={() => setFilter('pending')}>Pending ({stats.pending})</button>
                            <button className={`btn ${filter === 'done' ? 'btn-success' : 'btn-outline'} btn-small`} onClick={() => setFilter('done')}>Done ({stats.done})</button>
                            <button className={`btn ${filter === 'high' ? 'btn-secondary' : 'btn-outline'} btn-small`} onClick={() => setFilter('high')}>High Priority ({stats.high})</button>
                        </div>
                    </div>

                    <div className="card">
                        {filteredTasks.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '50px' }}>Done</th>
                                            <th>Task</th>
                                            <th>Deadline</th>
                                            <th>Assigned To</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTasks.map(task => (
                                            <tr key={task.id} style={{ opacity: task.status === 'done' ? 0.6 : 1 }}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={task.status === 'done'}
                                                        onChange={() => handleToggleStatus(task.id)}
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                    />
                                                </td>
                                                <td>
                                                    <strong style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                                                        {task.description}
                                                    </strong>
                                                </td>
                                                <td>{formatDate(task.deadline)}</td>
                                                <td>{task.assignedTo}</td>
                                                <td>
                                                    <span className={`badge ${task.priority === 'high' ? 'badge-error' : task.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${task.status === 'done' ? 'badge-success' : 'badge-warning'}`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-outline btn-small" onClick={() => handleEdit(task)}>Edit</button>
                                                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(task.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">✅</div>
                                <p>No tasks found</p>
                            </div>
                        )}
                    </div>

                    {showModal && (
                        <TaskModal
                            task={editingTask}
                            onSave={handleSave}
                            onClose={() => { setShowModal(false); setEditingTask(null); }}
                        />
                    )}
                </div>
            );
        };

        const TaskModal = ({ task, onSave, onClose }) => {
            const [formData, setFormData] = useState(task);

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{task.description ? 'Edit Task' : 'Add Task'}</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Task Description *</label>
                                <textarea 
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Deadline</label>
                                <input 
                                    type="date"
                                    className="form-input"
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Assigned To</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.assignedTo}
                                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select 
                                    className="form-select"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select 
                                    className="form-select"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => onSave(formData)}
                                disabled={!formData.description}
                            >
                                Save Task
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== MENUS COMPONENT ====================

        const Menus = ({ menus, updateData }) => {
            const [selectedEvent, setSelectedEvent] = useState(menus[0]?.event || 'Mehendi');
            const [showModal, setShowModal] = useState(false);
            const [editingItem, setEditingItem] = useState(null);

            const currentMenu = useMemo(() => {
                return menus.find(m => m.event === selectedEvent) || { event: selectedEvent, items: [] };
            }, [menus, selectedEvent]);

            const handleAddItem = () => {
                setEditingItem({ name: '', quantity: 0 });
                setShowModal(true);
            };

            const handleSaveItem = (item) => {
                const updatedMenus = [...menus];
                const menuIndex = updatedMenus.findIndex(m => m.event === selectedEvent);
                
                if (menuIndex >= 0) {
                    updatedMenus[menuIndex].items.push(item);
                } else {
                    updatedMenus.push({ event: selectedEvent, items: [item] });
                }
                
                updateData('menus', updatedMenus);
                setShowModal(false);
                setEditingItem(null);
            };

            const handleDeleteItem = (itemIndex) => {
                if (confirm('Delete this menu item?')) {
                    const updatedMenus = [...menus];
                    const menuIndex = updatedMenus.findIndex(m => m.event === selectedEvent);
                    if (menuIndex >= 0) {
                        updatedMenus[menuIndex].items.splice(itemIndex, 1);
                        updateData('menus', updatedMenus);
                    }
                }
            };

            const ceremonies = ['Mehendi', 'Sangeet', 'Haldi', 'Shaadi', 'Reception', 'Vidai'];

            return (
                <div>
                    <div className="card">
                        <h2 className="card-title">Event Menus</h2>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                            {ceremonies.map(ceremony => (
                                <button
                                    key={ceremony}
                                    className={`btn ${selectedEvent === ceremony ? 'btn-primary' : 'btn-outline'} btn-small`}
                                    onClick={() => setSelectedEvent(ceremony)}
                                >
                                    {ceremony}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex-between">
                            <h3 className="card-title">{selectedEvent} Menu</h3>
                            <button className="btn btn-primary" onClick={handleAddItem}>Add Item</button>
                        </div>
                        
                        {currentMenu.items && currentMenu.items.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Item Name</th>
                                            <th>Quantity</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentMenu.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td><strong>{item.name}</strong></td>
                                                <td>{item.quantity} servings</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-danger btn-small"
                                                        onClick={() => handleDeleteItem(idx)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🍽️</div>
                                <p>No menu items added for {selectedEvent}</p>
                            </div>
                        )}
                    </div>

                    {showModal && (
                        <MenuItemModal
                            item={editingItem}
                            onSave={handleSaveItem}
                            onClose={() => { setShowModal(false); setEditingItem(null); }}
                        />
                    )}
                </div>
            );
        };

        const MenuItemModal = ({ item, onSave, onClose }) => {
            const [formData, setFormData] = useState(item);

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add Menu Item</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Item Name *</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Paneer Tikka"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Quantity (servings)</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => onSave(formData)}
                                disabled={!formData.name}
                            >
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== TRAVEL COMPONENT ====================

        const Travel = ({ travel, updateData }) => {
            const [activeSection, setActiveSection] = useState('accommodations');
            const [showModal, setShowModal] = useState(false);
            const [editingItem, setEditingItem] = useState(null);

            const handleAddAccommodation = () => {
                setEditingItem({ type: 'accommodation', hotel: '', checkIn: '', checkOut: '', guests: [] });
                setShowModal(true);
            };

            const handleAddTransport = () => {
                setEditingItem({ type: 'transport', transportType: 'flight', details: '', date: '' });
                setShowModal(true);
            };

            const handleSave = (item) => {
                const updatedTravel = { ...travel };
                
                if (item.type === 'accommodation') {
                    updatedTravel.accommodations = [...(updatedTravel.accommodations || []), {
                        hotel: item.hotel,
                        checkIn: item.checkIn,
                        checkOut: item.checkOut,
                        guests: item.guests
                    }];
                } else {
                    updatedTravel.transport = [...(updatedTravel.transport || []), {
                        type: item.transportType,
                        details: item.details,
                        date: item.date
                    }];
                }
                
                updateData('travel', updatedTravel);
                setShowModal(false);
                setEditingItem(null);
            };

            const handleDeleteAccommodation = (index) => {
                if (confirm('Delete this accommodation?')) {
                    const updatedTravel = { ...travel };
                    updatedTravel.accommodations.splice(index, 1);
                    updateData('travel', updatedTravel);
                }
            };

            const handleDeleteTransport = (index) => {
                if (confirm('Delete this transport arrangement?')) {
                    const updatedTravel = { ...travel };
                    updatedTravel.transport.splice(index, 1);
                    updateData('travel', updatedTravel);
                }
            };

            return (
                <div>
                    <div className="card">
                        <h2 className="card-title">Travel &amp; Accommodations</h2>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <button
                                className={`btn ${activeSection === 'accommodations' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveSection('accommodations')}
                            >
                                🏨 Accommodations
                            </button>
                            <button
                                className={`btn ${activeSection === 'transport' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveSection('transport')}
                            >
                                ✈️ Transport
                            </button>
                        </div>
                    </div>

                    {activeSection === 'accommodations' && (
                        <div className="card">
                            <div className="flex-between">
                                <h3 className="card-title">Guest Accommodations</h3>
                                <button className="btn btn-primary" onClick={handleAddAccommodation}>Add Accommodation</button>
                            </div>
                            
                            {travel.accommodations && travel.accommodations.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Hotel</th>
                                                <th>Check-In</th>
                                                <th>Check-Out</th>
                                                <th>Guests</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {travel.accommodations.map((acc, idx) => (
                                                <tr key={idx}>
                                                    <td><strong>{acc.hotel}</strong></td>
                                                    <td>{formatDate(acc.checkIn)}</td>
                                                    <td>{formatDate(acc.checkOut)}</td>
                                                    <td style={{ fontSize: '12px' }}>{acc.guests.join(', ')}</td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-danger btn-small"
                                                            onClick={() => handleDeleteAccommodation(idx)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">🏨</div>
                                    <p>No accommodations added</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'transport' && (
                        <div className="card">
                            <div className="flex-between">
                                <h3 className="card-title">Transport Arrangements</h3>
                                <button className="btn btn-primary" onClick={handleAddTransport}>Add Transport</button>
                            </div>
                            
                            {travel.transport && travel.transport.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Details</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {travel.transport.map((trans, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ textTransform: 'capitalize' }}>
                                                        <span className="badge badge-info">{trans.type}</span>
                                                    </td>
                                                    <td><strong>{trans.details}</strong></td>
                                                    <td>{formatDate(trans.date)}</td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-danger btn-small"
                                                            onClick={() => handleDeleteTransport(idx)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">✈️</div>
                                    <p>No transport arrangements added</p>
                                </div>
                            )}
                        </div>
                    )}

                    {showModal && (
                        <TravelModal
                            item={editingItem}
                            onSave={handleSave}
                            onClose={() => { setShowModal(false); setEditingItem(null); }}
                        />
                    )}
                </div>
            );
        };

        const TravelModal = ({ item, onSave, onClose }) => {
            const [formData, setFormData] = useState(item);
            const [guestInput, setGuestInput] = useState('');

            const handleAddGuest = () => {
                if (guestInput.trim()) {
                    setFormData({
                        ...formData,
                        guests: [...(formData.guests || []), guestInput.trim()]
                    });
                    setGuestInput('');
                }
            };

            const handleRemoveGuest = (index) => {
                const newGuests = [...formData.guests];
                newGuests.splice(index, 1);
                setFormData({ ...formData, guests: newGuests });
            };

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {item.type === 'accommodation' ? 'Add Accommodation' : 'Add Transport'}
                            </h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {item.type === 'accommodation' ? (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Hotel Name *</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={formData.hotel}
                                            onChange={e => setFormData({ ...formData, hotel: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Check-In Date</label>
                                        <input 
                                            type="date"
                                            className="form-input"
                                            value={formData.checkIn}
                                            onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Check-Out Date</label>
                                        <input 
                                            type="date"
                                            className="form-input"
                                            value={formData.checkOut}
                                            onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Guests</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input 
                                                type="text"
                                                className="form-input"
                                                value={guestInput}
                                                onChange={e => setGuestInput(e.target.value)}
                                                placeholder="Guest name"
                                                onKeyPress={e => e.key === 'Enter' && handleAddGuest()}
                                            />
                                            <button className="btn btn-primary" onClick={handleAddGuest}>Add</button>
                                        </div>
                                        {formData.guests && formData.guests.length > 0 && (
                                            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {formData.guests.map((guest, idx) => (
                                                    <span key={idx} className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {guest}
                                                        <button 
                                                            onClick={() => handleRemoveGuest(idx)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Transport Type</label>
                                        <select 
                                            className="form-select"
                                            value={formData.transportType}
                                            onChange={e => setFormData({ ...formData, transportType: e.target.value })}
                                        >
                                            <option value="flight">Flight</option>
                                            <option value="train">Train</option>
                                            <option value="car">Car</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Details *</label>
                                        <textarea 
                                            className="form-textarea"
                                            value={formData.details}
                                            onChange={e => setFormData({ ...formData, details: e.target.value })}
                                            placeholder="e.g., Flight AI 502, Delhi to Bangalore"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Date</label>
                                        <input 
                                            type="date"
                                            className="form-input"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => onSave(formData)}
                                disabled={item.type === 'accommodation' ? !formData.hotel : !formData.details}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== SHOPPING COMPONENT ====================

        const Shopping = ({ shopping, updateData }) => {
            const [activeCategory, setActiveCategory] = useState('bride');
            const [showModal, setShowModal] = useState(false);
            const [editingItem, setEditingItem] = useState(null);
            const [editingEvent, setEditingEvent] = useState(null);

            const handleAddItem = (category, event) => {
                setEditingItem(null);
                setEditingEvent(event);
                setActiveCategory(category);
                setShowModal(true);
            };

            const handleEditItem = (item, category, event) => {
                setEditingItem(item);
                setEditingEvent(event);
                setActiveCategory(category);
                setShowModal(true);
            };

            const handleSave = (item) => {
                const newShopping = { ...shopping };
                const categoryItems = newShopping[activeCategory].find(e => e.event === editingEvent);
                
                if (editingItem) {
                    const index = categoryItems.items.findIndex(i => i.item === editingItem.item);
                    categoryItems.items[index] = item;
                } else {
                    categoryItems.items.push(item);
                }
                
                updateData('shopping', newShopping);
                setShowModal(false);
            };

            const totalBudget = Object.values(shopping).reduce((sum, category) => 
                sum + category.reduce((catSum, event) => 
                    catSum + event.items.reduce((eventSum, item) => eventSum + (item.budget || 0), 0), 0), 0);

            return (
                <div>
                    <div className="card">
                        <h2 className="card-title">Shopping List</h2>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <button 
                                className={`btn ${activeCategory === 'bride' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveCategory('bride')}
                            >
                                👰 Bride
                            </button>
                            <button 
                                className={`btn ${activeCategory === 'groom' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveCategory('groom')}
                            >
                                🤵 Groom
                            </button>
                            <button 
                                className={`btn ${activeCategory === 'family' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveCategory('family')}
                            >
                                👨‍👩‍👧‍👦 Family
                            </button>
                        </div>
                        <p><strong>Total Budget:</strong> {formatCurrency(totalBudget)}</p>
                    </div>

                    {shopping[activeCategory].map(event => (
                        <div key={event.event} className="card">
                            <div className="flex-between">
                                <h3>{event.event}</h3>
                                <button 
                                    className="btn btn-primary btn-small"
                                    onClick={() => handleAddItem(activeCategory, event.event)}
                                >
                                    Add Item
                                </button>
                            </div>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Budget</th>
                                            <th>Status</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {event.items.map(item => (
                                            <tr key={item.item}>
                                                <td>{item.item}</td>
                                                <td>{formatCurrency(item.budget)}</td>
                                                <td>
                                                    <span className={`badge badge-${item.status === 'completed' ? 'success' : item.status === 'pending' ? 'warning' : 'info'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td>{item.notes}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-outline btn-small"
                                                        onClick={() => handleEditItem(item, activeCategory, event.event)}
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {showModal && (
                        <ShoppingItemModal
                            item={editingItem}
                            onSave={handleSave}
                            onClose={() => setShowModal(false)}
                            category={activeCategory}
                        />
                    )}
                </div>
            );
        };

        const ShoppingItemModal = ({ item, onSave, onClose, category }) => {
            const [formData, setFormData] = useState(item || {
                item: '',
                budget: 0,
                status: 'pending',
                notes: ''
            });

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{item ? 'Edit Item' : 'Add Item'}</h3>
                            <button className="modal-close" onClick={onClose}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Item Name *</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    value={formData.item}
                                    onChange={e => setFormData({ ...formData, item: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Budget</label>
                                <input 
                                    type="number"
                                    className="form-input"
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="ordered">Ordered</option>
                                    <option value="received">Received</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary"
                                onClick={() => onSave(formData)}
                                disabled={!formData.item}
                            >
                                Save Item
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // ==================== RITUALS COMPONENT ====================

        const Rituals = ({ ritualsAndCustoms, traditions, updateData }) => {
            const [activeTab, setActiveTab] = useState('pre');
            const [showModal, setShowModal] = useState(false);
            const [editingItem, setEditingItem] = useState(null);
            const [editingType, setEditingType] = useState(null);

            return (
                <div>
                    <div className="card">
                        <h2 className="card-title">Rituals & Customs</h2>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <button 
                                className={`btn ${activeTab === 'pre' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab('pre')}
                            >
                                Pre-Wedding
                            </button>
                            <button 
                                className={`btn ${activeTab === 'main' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab('main')}
                            >
                                Main Ceremonies
                            </button>
                            <button 
                                className={`btn ${activeTab === 'customs' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab('customs')}
                            >
                                Customs
                            </button>
                            <button 
                                className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab('items')}
                            >
                                Ritual Items
                            </button>
                        </div>
                    </div>

                    {/* Content based on active tab */}
                    {activeTab === 'pre' && (
                        <div className="card">
                            <div className="flex-between">
                                <h3>Pre-Wedding Rituals</h3>
                                <button className="btn btn-primary btn-small">Add Ritual</button>
                            </div>
                            {/* Pre-wedding rituals list */}
                        </div>
                    )}
                    
                    {/* Additional tab content */}
                </div>
            );
        };

        // ==================== GIFTS COMPONENT ====================

        const Gifts = ({ giftsAndFavors, updateData }) => {
            const [activeTab, setActiveTab] = useState('family');
            const [showModal, setShowModal] = useState(false);
            const [editingItem, setEditingItem] = useState(null);

            return (
                <div>
                    <div className="card">
                        <h2 className="card-title">Gifts & Favors</h2>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <button 
                                className={`btn ${activeTab === 'family' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab('family')}
                            >
                                Family Gifts
                            </button>
                            <button 
                                className={`btn ${activeTab === 'return' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab('return')}
                            >
                                Return Gifts
                            </button>
                            <button 
                                className={`btn ${activeTab === 'special' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab('special')}
                            >
                                Special Gifts
                            </button>
                        </div>
                    </div>

                    {/* Content based on active tab */}
                    {activeTab === 'family' && (
                        <div className="card">
                            <div className="flex-between">
                                <h3>Family Gifts</h3>
                                <button className="btn btn-primary btn-small">Add Gift</button>
                            </div>
                            {/* Family gifts list */}
                        </div>
                    )}
                    
                    {/* Additional tab content */}
                </div>
            );
        };

        // ==================== SETTINGS COMPONENT ====================

        const Settings = ({ weddingInfo, updateData, allData, setData }) => {
            const [editMode, setEditMode] = useState(false);
            const [formData, setFormData] = useState(weddingInfo);



            const [formErrors, setFormErrors] = useState({});

            const handleSave = () => {
                const errors = validateWeddingInfo(formData);
                if (errors) {
                    setFormErrors(errors);
                    return;
                }
                updateData('weddingInfo', formData);
                setEditMode(false);
                setFormErrors({});
            };

            const handleExport = () => {
                const dataStr = JSON.stringify(allData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `wedding-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
            };

            const handleImport = (event) => {
                const file = event.target.files[0];
                if (!file) return;

                if (!confirm('This will replace all current data. Are you sure?')) {
                    event.target.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        setData(importedData);
                        alert('Data imported successfully!');
                    } catch (error) {
                        alert('Error importing data. Please check the file format.');
                        console.error('Import error:', error);
                    }
                    event.target.value = '';
                };
                reader.readAsText(file);
            };

            const handleReset = () => {
                if (confirm('This will reset all data to default values. This action cannot be undone. Are you sure?')) {
                    setData(DEFAULT_DATA);
                    alert('Data has been reset to defaults.');
                }
            };

            return (
                <div>
                    <div className="card">
                        <h2 className="card-title">Wedding Information</h2>
                        {!editMode ? (
                            <>
                                <div className="grid-2" style={{ marginBottom: '16px' }}>
                                    <div>
                                        <p><strong>Bride's Name:</strong> {weddingInfo.brideName}</p>
                                        <p><strong>Groom's Name:</strong> {weddingInfo.groomName}</p>
                                    </div>
                                    <div>
                                        <p><strong>Wedding Date:</strong> {formatDate(weddingInfo.weddingDate)}</p>
                                        <p><strong>Location:</strong> {weddingInfo.location}</p>
                                        <p><strong>Total Budget:</strong> {formatCurrency(weddingInfo.totalBudget)}</p>
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Information</button>
                            </>
                        ) : (
                            <>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Bride's Name</label>
                                        <input 
                                            type="text"
                                            className={`form-input ${formErrors.brideName ? 'error' : ''}`}
                                            value={formData.brideName}
                                            onChange={e => {
                                                setFormData({ ...formData, brideName: e.target.value });
                                                if (formErrors.brideName) {
                                                    setFormErrors({ ...formErrors, brideName: null });
                                                }
                                            }}
                                        />
                                        {formErrors.brideName && <div className="error-message">{formErrors.brideName}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Groom's Name</label>
                                        <input 
                                            type="text"
                                            className={`form-input ${formErrors.groomName ? 'error' : ''}`}
                                            value={formData.groomName}
                                            onChange={e => {
                                                setFormData({ ...formData, groomName: e.target.value });
                                                if (formErrors.groomName) {
                                                    setFormErrors({ ...formErrors, groomName: null });
                                                }
                                            }}
                                        />
                                        {formErrors.groomName && <div className="error-message">{formErrors.groomName}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Wedding Date</label>
                                        <input 
                                            type="date"
                                            className={`form-input ${formErrors.weddingDate ? 'error' : ''}`}
                                            value={formData.weddingDate}
                                            onChange={e => {
                                                setFormData({ ...formData, weddingDate: e.target.value });
                                                if (formErrors.weddingDate) {
                                                    setFormErrors({ ...formErrors, weddingDate: null });
                                                }
                                            }}
                                        />
                                        {formErrors.weddingDate && <div className="error-message">{formErrors.weddingDate}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input 
                                            type="text"
                                            className={`form-input ${formErrors.location ? 'error' : ''}`}
                                            value={formData.location}
                                            onChange={e => {
                                                setFormData({ ...formData, location: e.target.value });
                                                if (formErrors.location) {
                                                    setFormErrors({ ...formErrors, location: null });
                                                }
                                            }}
                                        />
                                        {formErrors.location && <div className="error-message">{formErrors.location}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Total Budget (₹)</label>
                                        <input 
                                            type="number"
                                            className={`form-input ${formErrors.totalBudget ? 'error' : ''}`}
                                            value={formData.totalBudget}
                                            onChange={e => {
                                                setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 });
                                                if (formErrors.totalBudget) {
                                                    setFormErrors({ ...formErrors, totalBudget: null });
                                                }
                                            }}
                                        />
                                        {formErrors.totalBudget && <div className="error-message">{formErrors.totalBudget}</div>}
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                                    <button className="btn btn-outline" onClick={() => { setEditMode(false); setFormData(weddingInfo); }}>Cancel</button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="card">
                        <h2 className="card-title">Data Management</h2>
                        <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                            Export your wedding data as a JSON backup file, or import previously saved data.
                        </p>
                        <div>
                            <button className="btn btn-success" onClick={handleExport}>
                                📥 Export Data (Backup)
                            </button>
                            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                📤 Import Data
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    onChange={handleImport}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <button className="btn btn-danger" onClick={handleReset}>
                                🔄 Reset to Default Data
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="card-title">About This App</h2>
                        <p style={{ marginBottom: '8px' }}>
                            <strong>Wedding Planner</strong> - A complete wedding management solution
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            This application stores all data in memory during your session. 
                            Make sure to export your data regularly as a backup to save your progress. 
                            Use the Export/Import feature to backup and restore your data.
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                            <strong>Features:</strong> Dashboard, Timeline Management, Guest List, Vendor Management, 
                            Budget Tracking, Tasks Checklist, Event Menus, Travel &amp; Accommodations, Data Export/Import
                        </p>
                    </div>
                </div>
            );
        };

        // ==================== RENDER APP ====================

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<WeddingPlannerApp />);