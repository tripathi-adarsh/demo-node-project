const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const usersController = require('../controllers/usersController');

// Users routes
router.get('/users', isAuthenticated, usersController.getUsers);
router.get('/users/new', isAuthenticated, usersController.getNewUser);
router.post('/users', isAuthenticated, usersController.createUser);
router.get('/users/:id/edit', isAuthenticated, usersController.getEditUser);
router.post('/users/:id', isAuthenticated, usersController.updateUser);
router.post('/users/:id/delete', isAuthenticated, usersController.deleteUser);

module.exports = router; 