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

    async saveData(data) {
        // Save to local storage
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
        
        // Save to database
        try {
            await window.dbManager.saveData(data);
        } catch (error) {
            console.error('Failed to save to database:', error);
        }
        
        this.notifyListeners(data);
    }

    async loadData() {
        try {
            // Try to load from database first
            const dbData = await window.dbManager.loadData();
            if (dbData) {
                // Update local storage with database data
                localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(dbData));
                return dbData;
            }
        } catch (error) {
            console.error('Failed to load from database:', error);
        }

        // Fall back to local storage
        const localData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        return localData ? JSON.parse(localData) : null;
    }

    async init() {
        try {
            // Test database connection
            const connected = await window.dbManager.connect();
            if (connected) {
                console.log('Database connection established');
                
                // Try to load initial data from database
                const dbData = await this.loadData();
                if (dbData) {
                    this.notifyListeners(dbData);
                }
            }
        } catch (error) {
            console.error('Failed to initialize database connection:', error);
        }
    }
}

// Create global instance
window.storageManager = StorageManager.getInstance();

// Initialize storage manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.storageManager.init();
});