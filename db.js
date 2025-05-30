require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'wscubestaging',
  host: 'wscubetech-staging.cd0cisqwq1ta.ap-south-1.rds.amazonaws.com',
  database: 'crm_staging_new',
  password: 'TKJkEjBkQzggab9',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;