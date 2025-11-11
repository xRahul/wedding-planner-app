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
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
        this.notifyListeners(data);
    }

    loadData() {
        const localData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        return localData ? JSON.parse(localData) : null;
    }


}

// Create global instance
window.storageManager = StorageManager.getInstance();