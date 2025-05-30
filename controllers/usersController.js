const pool = require('../db');
const bcrypt = require('bcrypt');

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, created_at FROM lm_users ORDER BY created_at DESC');
        res.render('users/index', {
            user: req.session.user,
            title: 'Manage Users',
            req: req,
            users: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Show new user form
exports.getNewUser = (req, res) => {
    res.render('users/form', {
        user: req.session.user,
        title: 'Add New User',
        req: req
    });
};

// Create new user
exports.createUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if user already exists
        const userExists = await pool.query('SELECT * FROM lm_users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.render('users/form', {
                user: req.session.user,
                title: 'Add New User',
                req: req,
                error: 'Email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        await pool.query(
            'INSERT INTO lm_users (name, email, password, created_by) VALUES ($1, $2, $3, $4)',
            [name, email, hashedPassword, req.session.user.id]
        );

        res.redirect('/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Show edit user form
exports.getEditUser = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email FROM lm_users WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        res.render('users/form', {
            user: req.session.user,
            title: 'Edit User',
            req: req,
            editUser: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Update user
exports.updateUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if email exists for other users
        const emailExists = await pool.query(
            'SELECT * FROM lm_users WHERE email = $1 AND id != $2',
            [email, req.params.id]
        );
        if (emailExists.rows.length > 0) {
            return res.render('users/form', {
                user: req.session.user,
                title: 'Edit User',
                req: req,
                editUser: { id: req.params.id, name, email },
                error: 'Email already exists'
            });
        }

        if (password) {
            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            await pool.query(
                'UPDATE lm_users SET name = $1, email = $2, password = $3, updated_at = NOW() WHERE id = $4',
                [name, email, hashedPassword, req.params.id]
            );
        } else {
            await pool.query(
                'UPDATE lm_users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3',
                [name, email, req.params.id]
            );
        }

        res.redirect('/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        // Don't allow deleting own account
        if (req.params.id === req.session.user.id) {
            return res.status(400).send('Cannot delete your own account');
        }

        await pool.query('DELETE FROM lm_users WHERE id = $1', [req.params.id]);
        res.redirect('/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}; 