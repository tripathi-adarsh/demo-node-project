require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Middleware
app.use(express.json()); // for JSON requests
app.use(express.urlencoded({ extended: true })); // for HTML form data

// Session setup
app.use(session({
  secret: 'your-secret-key', // change to a strong secret, can come from .env
  resave: false,
  saveUninitialized: false,
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', authRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});