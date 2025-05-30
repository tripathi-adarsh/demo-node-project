const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Dashboard route
router.get('/dashboard', isAuthenticated, dashboardController.getDashboard);

module.exports = router; 