const pool = require('../db');
const bcrypt = require('bcrypt');

class User {
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await pool.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            throw new Error('Database error while finding user');
        }
    }

    static async validateLogin(email, password) {
        try {
            const user = await this.findByEmail(email);
            
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (!isValidPassword) {
                return { success: false, message: 'Invalid password' };
            }

            return { 
                success: true, 
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            };
        } catch (error) {
            throw new Error('Error validating login credentials');
        }
    }
}

module.exports = User; 