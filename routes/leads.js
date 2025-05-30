const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const leadsController = require('../controllers/leadsController');

// Leads routes
router.get('/leads', isAuthenticated, leadsController.getLeads);
router.get('/leads/new', isAuthenticated, leadsController.getNewLead);
router.post('/leads', isAuthenticated, leadsController.createLead);
router.get('/leads/:id/edit', isAuthenticated, leadsController.getEditLead);
router.post('/leads/:id', isAuthenticated, leadsController.updateLead);
router.post('/leads/:id/delete', isAuthenticated, leadsController.deleteLead);

module.exports = router; 