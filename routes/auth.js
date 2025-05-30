const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Home route
router.get('/', authController.showHome);

// Login routes
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Forgot password routes
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authController.forgotPassword);

// Reset password routes
router.get('/reset-password/:token', authController.showResetPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Dashboard route
router.get('/dashboard', authController.ensureAuthenticated, authController.showDashboard);

// Logout route
router.get('/logout', authController.logout);

module.exports = router; 