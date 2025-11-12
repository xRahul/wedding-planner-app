// ==================== DATA STRUCTURE & STORAGE ====================

const DEFAULT_DATA = {
    weddingInfo: {
        brideName: "",
        groomName: "",
        weddingDate: "",
        location: "",
        totalBudget: 0
    },
    savedGuestCategories: ['family', 'friends', 'relatives', 'family_friends', 'colleagues', 'vendors'],
    savedGuestRelations: ['maternal_uncle', 'maternal_aunt', 'paternal_uncle', 'paternal_aunt', 'father_sister', 'mother_sister', 'cousin', 'family_friend', 'college_friend', 'work_colleague', 'neighbor'],
    savedDietaryPreferences: ['veg', 'jain'],
    savedFamilyRelations: ['spouse', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'grandfather', 'grandmother', 'grandson', 'granddaughter'],
    customCeremonies: [],
    customGiftEvents: [],
    customVendorTypes: [],
    timeline: [],
    guests: [],
    vendors: [],
    budget: [
        { category: "venue", planned: 0, actual: 0, subcategories: [] },
        { category: "catering", planned: 0, actual: 0, subcategories: [] },
        { category: "decor", planned: 0, actual: 0, subcategories: [] },
        { category: "bride", planned: 0, actual: 0, subcategories: [] },
        { category: "groom", planned: 0, actual: 0, subcategories: [] },
        { category: "pandit_and_rituals", planned: 0, actual: 0, subcategories: [] },
        { category: "entertainment", planned: 0, actual: 0, subcategories: [] },
        { category: "photography", planned: 0, actual: 0, subcategories: [] },
        { category: "invitations", planned: 0, actual: 0, subcategories: [] },
        { category: "gifts", planned: 0, actual: 0, subcategories: [] },
        { category: "transport", planned: 0, actual: 0, subcategories: [] },
        { category: "other", planned: 0, actual: 0, subcategories: [] }
    ],
    tasks: [],
    menus: [],
    travel: {
        transport: []
    },
    ritualsAndCustoms: {
        preWedding: [],
        mainCeremonies: [],
        customs: []
    },
    giftsAndFavors: {
        familyGifts: [],
        returnGifts: [],
        specialGifts: []
    },
    shopping: {
        bride: [{ event: "Wedding", items: [] }],
        groom: [{ event: "Wedding", items: [] }],
        family: [{ for: "Family", items: [] }]
    },
    traditions: {
        preWedding: [],
        ritual_items: []
    }
};

const loadData = async () => {
    try {
        const data = await window.storageManager.loadData();
        if (!data) {
            return { ...DEFAULT_DATA };
        }
        
        const requiredKeys = ['weddingInfo', 'timeline', 'guests', 'vendors', 'budget', 'tasks', 'menus', 'travel'];
        const missingKeys = requiredKeys.filter(key => !data[key]);
        
        if (missingKeys.length > 0) {
            console.warn('Missing required keys in saved data:', missingKeys);
            return { ...DEFAULT_DATA };
        }
        
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
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }
        
        const requiredKeys = ['weddingInfo', 'timeline', 'guests', 'vendors', 'budget', 'tasks', 'menus', 'travel'];
        const missingKeys = requiredKeys.filter(key => !data[key]);
        
        if (missingKeys.length > 0) {
            throw new Error(`Missing required keys: ${missingKeys.join(', ')}`);
        }
        
        await window.storageManager.saveData(data);
        console.log('Data saved successfully to database and local storage');
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
};

// ==================== VALIDATION FUNCTIONS ====================

const validateWeddingInfo = (info) => {
    const errors = {};
    if (!info.brideName?.trim()) errors.brideName = 'Bride name is required';
    if (!info.groomName?.trim()) errors.groomName = 'Groom name is required';
    return Object.keys(errors).length ? errors : null;
};

const validateGuest = (guest) => {
    try {
        if (!guest || typeof guest !== 'object') return { error: 'Invalid guest data' };
        const errors = {};
        if (!guest.name?.trim()) errors.name = 'Name is required';
        if (!guest.category) errors.category = 'Category is required';
        if (!guest.side) errors.side = 'Bride/Groom side must be specified';
        if (!guest.relation) errors.relation = 'Relation is required';
        if (guest.phone && !/^[\d\s+()-]+$/.test(guest.phone)) errors.phone = 'Invalid phone number';
        return Object.keys(errors).length ? errors : null;
    } catch (error) {
        console.error('Validation error:', error);
        return { error: 'Validation failed' };
    }
};

const isValidDate = (dateString) => {
    try {
        if (!dateString) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    } catch (error) {
        return false;
    }
};

const validateVendor = (vendor) => {
    const errors = {};
    if (!vendor.name?.trim()) errors.name = 'Name is required';
    if (!vendor.type) errors.type = 'Vendor type is required';
    if (vendor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendor.email)) errors.email = 'Invalid email';
    return Object.keys(errors).length ? errors : null;
};

const validateTimelineEvent = (event) => {
    const errors = {};
    if (!event.ceremony?.trim()) errors.ceremony = 'Ceremony name is required';
    return Object.keys(errors).length ? errors : null;
};

const validateMenuItem = (item) => {
    const errors = {};
    if (!item.name?.trim()) errors.name = 'Item name is required';
    return Object.keys(errors).length ? errors : null;
};

const validateTravelItem = (item) => {
    const errors = {};
    if (!item.vehicleType?.trim()) errors.vehicleType = 'Vehicle type is required';
    if (!item.fromDate) errors.fromDate = 'From date is required';
    if (!item.toDate) errors.toDate = 'To date is required';
    if (!item.seats || item.seats <= 0) errors.seats = 'Valid number of seats is required';
    return Object.keys(errors).length ? errors : null;
};

// ==================== UTILITY FUNCTIONS ====================

const generateId = () => {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const formatDate = (dateString, withTime = false) => {
    try {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date string:', dateString);
            return '';
        }
        const options = { 
            weekday: 'short',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
        };
        return date.toLocaleDateString('en-IN', options);
    } catch (error) {
        console.error('Date formatting error:', error);
        return '';
    }
};

const isDatePassed = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
};

const formatCurrency = (amount) => {
    try {
        const num = Number(amount);
        if (isNaN(num)) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    } catch (error) {
        console.error('Currency formatting error:', error);
        return '₹0';
    }
};

const getDayLabel = (offset) => {
    if (offset === 0) return "Wedding Day";
    if (offset < 0) return `${Math.abs(offset)} Day${Math.abs(offset) > 1 ? 's' : ''} Before`;
    return `${offset} Day${offset > 1 ? 's' : ''} After`;
};
