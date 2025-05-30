const pool = require('../db');

// Get all leads
exports.getLeads = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM lm_leads ORDER BY created_at DESC');
        res.render('leads/index', {
            user: req.session.user,
            title: 'Manage Leads',
            req: req,
            leads: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Show new lead form
exports.getNewLead = (req, res) => {
    res.render('leads/new', {
        user: req.session.user,
        title: 'Add New Lead',
        req: req
    });
};

// Create new lead
exports.createLead = async (req, res) => {
    const { name, email, phone, company, status, notes } = req.body;
    try {
        await pool.query(
            'INSERT INTO lm_leads (name, email, phone, company, status, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [name, email, phone, company, status, notes, req.session.user.id]
        );
        res.redirect('/leads');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Show edit lead form
exports.getEditLead = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM lm_leads WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Lead not found');
        }
        res.render('leads/edit', {
            user: req.session.user,
            title: 'Edit Lead',
            req: req,
            lead: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Update lead
exports.updateLead = async (req, res) => {
    const { name, email, phone, company, status, notes } = req.body;
    try {
        await pool.query(
            'UPDATE lm_leads SET name = $1, email = $2, phone = $3, company = $4, status = $5, notes = $6, updated_at = NOW() WHERE id = $7',
            [name, email, phone, company, status, notes, req.params.id]
        );
        res.redirect('/leads');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Delete lead
exports.deleteLead = async (req, res) => {
    try {
        await pool.query('DELETE FROM lm_leads WHERE id = $1', [req.params.id]);
        res.redirect('/leads');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}; 