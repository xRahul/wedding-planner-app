// ==================== DATA STRUCTURE & STORAGE ====================

const DEFAULT_DATA = {
    weddingInfo: {
        brideName: "",
        groomName: "",
        weddingDate: "",
        location: "",
        totalBudget: 0,
        brideBudget: 0,
        groomBudget: 0
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

/**
 * Validates wedding information
 * @param {Object} info - Wedding info object
 * @param {string} info.brideName - Bride's name
 * @param {string} info.groomName - Groom's name
 * @returns {Object|null} Validation errors or null if valid
 */
const validateWeddingInfo = (info) => {
    const errors = {};
    if (!info.brideName?.trim()) errors.brideName = 'Bride name is required';
    if (!info.groomName?.trim()) errors.groomName = 'Groom name is required';
    if (info.brideBudget && !window.securityUtils?.isValidNumber(info.brideBudget)) errors.brideBudget = 'Invalid bride budget';
    if (info.groomBudget && !window.securityUtils?.isValidNumber(info.groomBudget)) errors.groomBudget = 'Invalid groom budget';
    return Object.keys(errors).length ? errors : null;
};

/**
 * Validates guest data with security checks
 * @param {Object} guest - Guest object
 * @returns {Object|null} Validation errors or null if valid
 */
const validateGuest = (guest) => {
    try {
        if (!guest || typeof guest !== 'object') return { error: 'Invalid guest data' };
        const errors = {};
        if (!guest.name?.trim()) errors.name = 'Name is required';
        else if (guest.name.length > 100) errors.name = 'Name too long (max 100 characters)';
        if (!guest.category) errors.category = 'Category is required';
        if (!guest.side) errors.side = 'Bride/Groom side must be specified';
        if (!guest.relation) errors.relation = 'Relation is required';
        if (guest.phone && !window.securityUtils?.isValidPhone(guest.phone)) errors.phone = 'Invalid phone number';
        if (guest.email && !window.securityUtils?.isValidEmail(guest.email)) errors.email = 'Invalid email';
        if (guest.giftAmount && !window.securityUtils?.isValidNumber(guest.giftAmount)) errors.giftAmount = 'Invalid gift amount';
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

/**
 * Validates vendor data
 * @param {Object} vendor - Vendor object
 * @returns {Object|null} Validation errors or null if valid
 */
const validateVendor = (vendor) => {
    try {
        if (!vendor || typeof vendor !== 'object') return { error: 'Invalid vendor data' };
        const errors = {};
        if (!vendor.name?.trim()) errors.name = 'Name is required';
        else if (vendor.name.length > 100) errors.name = 'Name too long (max 100 characters)';
        if (!vendor.type) errors.type = 'Vendor type is required';
        if (vendor.email && !window.securityUtils?.isValidEmail(vendor.email)) errors.email = 'Invalid email';
        if (vendor.phone && !window.securityUtils?.isValidPhone(vendor.phone)) errors.phone = 'Invalid phone';
        if (vendor.estimatedCost && !window.securityUtils?.isValidNumber(vendor.estimatedCost)) errors.estimatedCost = 'Invalid cost';
        if (vendor.finalCost && !window.securityUtils?.isValidNumber(vendor.finalCost)) errors.finalCost = 'Invalid cost';
        if (vendor.advancePaid && !window.securityUtils?.isValidNumber(vendor.advancePaid)) errors.advancePaid = 'Invalid amount';
        if (vendor.paymentResponsibility && !['bride', 'groom', 'split'].includes(vendor.paymentResponsibility)) errors.paymentResponsibility = 'Invalid payment responsibility';
        if (vendor.paidBy && !['bride', 'groom', 'split', 'pending'].includes(vendor.paidBy)) errors.paidBy = 'Invalid paid by value';
        return Object.keys(errors).length ? errors : null;
    } catch (error) {
        console.error('Validation error:', error);
        return { error: 'Validation failed' };
    }
};

const validateTimelineEvent = (event) => {
    try {
        if (!event || typeof event !== 'object') return { error: 'Invalid event data' };
        const errors = {};
        if (!event.ceremony?.trim()) errors.ceremony = 'Ceremony name is required';
        else if (event.ceremony.length > 100) errors.ceremony = 'Ceremony name too long';
        if (event.date && !isValidDate(event.date)) errors.date = 'Invalid date';
        return Object.keys(errors).length ? errors : null;
    } catch (error) {
        console.error('Validation error:', error);
        return { error: 'Validation failed' };
    }
};

const validateMenuItem = (item) => {
    try {
        if (!item || typeof item !== 'object') return { error: 'Invalid menu item data' };
        const errors = {};
        if (!item.name?.trim()) errors.name = 'Item name is required';
        else if (item.name.length > 100) errors.name = 'Item name too long';
        if (item.cost && !window.securityUtils?.isValidNumber(item.cost)) errors.cost = 'Invalid cost';
        return Object.keys(errors).length ? errors : null;
    } catch (error) {
        console.error('Validation error:', error);
        return { error: 'Validation failed' };
    }
};

const validateTravelItem = (item) => {
    try {
        if (!item || typeof item !== 'object') return { error: 'Invalid travel item data' };
        const errors = {};
        if (!item.vehicleType?.trim()) errors.vehicleType = 'Vehicle type is required';
        if (!item.fromDate) errors.fromDate = 'From date is required';
        else if (!isValidDate(item.fromDate)) errors.fromDate = 'Invalid from date';
        if (!item.toDate) errors.toDate = 'To date is required';
        else if (!isValidDate(item.toDate)) errors.toDate = 'Invalid to date';
        if (item.fromDate && item.toDate && new Date(item.fromDate) > new Date(item.toDate)) {
            errors.toDate = 'To date must be after from date';
        }
        if (!item.seats || item.seats <= 0) errors.seats = 'Valid number of seats is required';
        if (item.totalPrice && !window.securityUtils?.isValidNumber(item.totalPrice)) errors.totalPrice = 'Invalid price';
        return Object.keys(errors).length ? errors : null;
    } catch (error) {
        console.error('Validation error:', error);
        return { error: 'Validation failed' };
    }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generates unique ID for data objects
 * @returns {string} Unique identifier
 */
const generateId = () => {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Formats date string for display
 * @param {string} dateString - ISO date string
 * @param {boolean} withTime - Include time in output
 * @returns {string} Formatted date string
 */
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

/**
 * Formats number as Indian currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
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
