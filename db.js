// Neon Postgres Database Integration
const DB_CONFIG = {
    host: window.ENV?.NEON_DB_HOST || '',
    database: window.ENV?.NEON_DB_NAME || '',
    username: window.ENV?.NEON_DB_USER || '',
    password: window.ENV?.NEON_DB_PASSWORD || '',
};

class DatabaseManager {
    static instance = null;
    
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    async connect() {
        try {
            const response = await fetch(`https://${DB_CONFIG.host}/sql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`${DB_CONFIG.username}:${DB_CONFIG.password}`)}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: 'SELECT 1'
                })
            });
            
            if (!response.ok) {
                throw new Error('Database connection failed');
            }
            
            console.log('Database connected successfully');
            return true;
        } catch (error) {
            console.error('Database connection error:', error);
            return false;
        }
    }

    async saveData(data) {
        try {
            const response = await fetch(`https://${DB_CONFIG.host}/sql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`${DB_CONFIG.username}:${DB_CONFIG.password}`)}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        INSERT INTO wedding_data (data, updated_at)
                        VALUES ($1, NOW())
                        ON CONFLICT (id)
                        DO UPDATE SET data = $1, updated_at = NOW()
                        RETURNING id;
                    `,
                    params: [JSON.stringify(data)]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save data');
            }

            const result = await response.json();
            console.log('Data saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    async loadData() {
        try {
            const response = await fetch(`https://${DB_CONFIG.host}/sql`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`${DB_CONFIG.username}:${DB_CONFIG.password}`)}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        SELECT data
                        FROM wedding_data
                        ORDER BY updated_at DESC
                        LIMIT 1;
                    `
                })
            });

            if (!response.ok) {
                throw new Error('Failed to load data');
            }

            const result = await response.json();
            if (result.rows && result.rows.length > 0) {
                return JSON.parse(result.rows[0].data);
            }
            return null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }
}

window.dbManager = DatabaseManager.getInstance();