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

    saveData(data) {
        try {
            if (!data) throw new Error('No data to save');
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.LOCAL_STORAGE_KEY, serialized);
            this.notifyListeners(data);
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

    loadData() {
        try {
            const localData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            if (!localData) return null;
            return JSON.parse(localData);
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }


}

// Create global instance
window.storageManager = StorageManager.getInstance();