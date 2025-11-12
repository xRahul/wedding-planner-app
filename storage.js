// Storage Manager for Wedding Planner App
class StorageManager {
    static instance = null;
    
    static getInstance() {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }

    constructor() {
        this.LOCAL_STORAGE_KEY = 'weddingPlannerData';
        this.listeners = new Set();
    }

    addChangeListener(listener) {
        this.listeners.add(listener);
    }

    removeChangeListener(listener) {
        this.listeners.delete(listener);
    }

    notifyListeners(data) {
        this.listeners.forEach(listener => listener(data));
    }

    /**
     * Saves data to localStorage with sanitization
     * @param {Object} data - Wedding planner data
     * @returns {Promise<boolean>} Success status
     */
    async saveData(data) {
        try {
            if (!data) throw new Error('No data to save');
            const sanitized = window.securityUtils?.sanitizeObject(data) || data;
            const serialized = JSON.stringify(sanitized);
            localStorage.setItem(this.LOCAL_STORAGE_KEY, serialized);
            this.notifyListeners(sanitized);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded');
                throw new Error('Storage full. Please export and clear old data.');
            }
            console.error('Failed to save data:', error);
            throw error;
        }
    }

    /**
     * Loads data from localStorage
     * @returns {Promise<Object|null>} Wedding planner data or null
     */
    async loadData() {
        try {
            const localData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            if (!localData) return null;
            return JSON.parse(localData);
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    /**
     * Clears all data from localStorage
     * @returns {Promise<boolean>} Success status
     */
    async clearAllData() {
        try {
            localStorage.removeItem(this.LOCAL_STORAGE_KEY);
            this.notifyListeners(null);
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    }


}

// Create global instance
window.storageManager = StorageManager.getInstance();