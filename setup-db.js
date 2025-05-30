const pool = require('./db');

async function setupDatabase() {
    try {
        // Create remember_tokens table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS remember_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(255) NOT NULL UNIQUE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Drop existing password_resets table if it exists
        await pool.query('DROP TABLE IF EXISTS password_resets CASCADE');

        // Create password_resets table with correct column names
        await pool.query(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(255) NOT NULL UNIQUE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes
        await pool.query('CREATE INDEX IF NOT EXISTS idx_remember_tokens_token ON remember_tokens(token)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token)');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        pool.end();
    }
}

setupDatabase(); 