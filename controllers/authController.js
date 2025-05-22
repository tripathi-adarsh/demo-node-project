const path = require('path');
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Show login page or redirect to dashboard if logged in
exports.showHome = (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, '../views/login.html'));
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email) {
    errors.email = 'Please enter email';
  }

  if (!password) {
    errors.password = 'Please enter password';
  }

  if (Object.keys(errors).length > 0) {
    return res.render('login', { errors, email, password });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    // Optionally: set session or cookie
    req.session.user = user;

    // Redirect to dashboard
    return res.redirect('/dashboard');

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Middleware to check if user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/');
};

// Show dashboard page
// exports.showDashboard = (req, res) => {
//   res.sendFile(path.join(__dirname, '../views/dashboard.ejs'));
// };
exports.showDashboard = (req, res) => {
  res.render('dashboard');  // dashboard.ejs jo views folder me hai, use render karo
};

// Logout handler
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
};