const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidation } = require('../middlewares/validators'); // for express-validator
const customValidator = require('../middlewares/customValidator'); // for pure JS

router.get('/', authController.showHome); // Default route - show login page or redirect to dashboard
router.post('/login', loginValidation, authController.login); // Login POST request
router.get('/dashboard', authController.ensureAuthenticated, authController.showDashboard); // Dashboard route (protected)
router.get('/logout', authController.logout); // Logout

module.exports = router;