const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Lead Management Routes
router.post('/', authenticateToken, leadController.createLead);
router.get('/', authenticateToken, leadController.getAllLeads);
router.get('/:id', authenticateToken, leadController.getLeadById);
router.put('/:id', authenticateToken, leadController.updateLead);
router.delete('/:id', authenticateToken, leadController.deleteLead);
router.get('/status/:status', authenticateToken, leadController.getLeadsByStatus);
router.put('/:id/status', authenticateToken, leadController.updateLeadStatus);

module.exports = router; 