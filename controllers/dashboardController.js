const pool = require('../db');

// Get dashboard
exports.getDashboard = async (req, res) => {
    try {
        // Get total leads count
        const leadsCount = await pool.query('SELECT COUNT(*) FROM lm_leads');
        
        // Get leads by status
        const leadsByStatus = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM lm_leads 
            GROUP BY status
        `);

        // Get recent leads
        const recentLeads = await pool.query(`
            SELECT * FROM lm_leads 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        res.render('dashboard', {
            user: req.session.user,
            title: 'Dashboard',
            req: req,
            stats: {
                totalLeads: leadsCount.rows[0].count,
                leadsByStatus: leadsByStatus.rows,
                recentLeads: recentLeads.rows
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}; 