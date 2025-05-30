const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Show login page or redirect to dashboard if logged in
exports.showHome = (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  } else {
    return res.redirect('/login');
  }
};
//------------------------------------------------------

// login and redirect
exports.login = async (req, res) => {
  const { email, password, remember } = req.body;
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
      return res.render('login', { error: 'These credentials do not match our records.' });
    }

    const user = result.rows[0];
    
    // Convert $2y$ to $2b$ for comparison
    const storedHash = user.password;
    const normalizedHash = storedHash.replace('$2y$', '$2b$');
    
    const isMatch = await bcrypt.compare(password, normalizedHash);

    if (!isMatch) {
      return res.render('login', { error: 'These credentials do not match our records.' });
    }
    
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    // Handle remember me
    if (remember) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Store token in database
      await pool.query(
        'INSERT INTO remember_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, expires]
      );

      // Set cookie
      res.cookie('remember_token', token, {
        expires: expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }

    return res.redirect('/dashboard');

  } catch (err) {
    console.error('Login error:', err);
    return res.render('login', { error: 'An error occurred during login' });
  }
};
// ------------------

// Show forgot password page
exports.showForgotPassword = (req, res) => {
  res.render('forgot-password', { error: null, success: null });
};

// Handle forgot password request
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.render('forgot-password', { 
        error: 'If an account exists with this email, you will receive a password reset link.',
        success: null 
      });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store reset token
    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expires]
    );

    // Send email
    const resetLink = `${process.env.APP_URL}/reset-password/${token}`;

    // Create transporter with Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD // Use App Password here
      }
    });

    try {
      // Verify transporter configuration
      await transporter.verify();

      const info = await transporter.sendMail({
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });

      return res.render('forgot-password', { 
        success: 'If an account exists with this email, you will receive a password reset link.',
        error: null 
      });
    } catch (sendError) {
      console.error('Error sending email:', sendError);
      throw sendError;
    }

  } catch (err) {
    console.error('Detailed forgot password error:', err);
    return res.render('forgot-password', { 
      error: 'An error occurred. Please try again later.',
      success: null 
    });
  }
};

// Middleware to check if user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/');
};
//--------------------------------------------

// Show dashboard page
exports.showDashboard = (req, res) => {
  res.render('dashboard', {
    user: req.session.user,
    req: req
  });
};
//-------------------

// Show Login page
exports.showLogin = (req, res) => {
  res.render('login', { error: null });
};
//---------------

// Logout handler
exports.logout = (req, res) => {
  // Clear remember me token if exists
  if (req.cookies && req.cookies.remember_token) {
    res.clearCookie('remember_token');
  }
  
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
};
//----------------

// Show reset password page
exports.showResetPassword = async (req, res) => {
  const { token } = req.params;

  try {
    // Check if token exists and is valid
    const result = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.render('reset-password', {
        error: 'Invalid or expired password reset link.',
        token: null
      });
    }

    res.render('reset-password', {
      error: null,
      token: token
    });
  } catch (err) {
    console.error('Error checking reset token:', err);
    res.render('reset-password', {
      error: 'An error occurred. Please try again.',
      token: null
    });
  }
};

// Handle password reset
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirm_password } = req.body;

  try {
    // Validate passwords
    if (!password || !confirm_password) {
      return res.render('reset-password', {
        error: 'Please enter both password fields.',
        token: token
      });
    }

    if (password !== confirm_password) {
      return res.render('reset-password', {
        error: 'Passwords do not match.',
        token: token
      });
    }

    if (password.length < 6) {
      return res.render('reset-password', {
        error: 'Password must be at least 6 characters long.',
        token: token
      });
    }

    // Check if token exists and is valid
    const resetResult = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (resetResult.rows.length === 0) {
      return res.render('reset-password', {
        error: 'Invalid or expired password reset link.',
        token: null
      });
    }

    const reset = resetResult.rows[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, reset.user_id]
    );

    // Delete the used reset token
    await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);

    // Redirect to login with success message
    res.redirect('/login?message=Password has been reset successfully. Please login with your new password.');
  } catch (err) {
    console.error('Error resetting password:', err);
    res.render('reset-password', {
      error: 'An error occurred while resetting your password. Please try again.',
      token: token
    });
  }
};
