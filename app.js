require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const leadsRoutes = require('./routes/leads');
const usersRoutes = require('./routes/users');
const menuMiddleware = require('./middleware/menu');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.json()); // for JSON requests
app.use(express.urlencoded({ extended: true })); // for HTML form data

// Session setup
app.use(session({
  secret: 'your-secret-key', // change to a strong secret, can come from .env
  resave: false,
  saveUninitialized: false,
}));

// Menu middleware
app.use(menuMiddleware);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', leadsRoutes);
app.use('/', usersRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});