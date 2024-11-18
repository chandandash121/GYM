const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const User = require('./models/User'); // Import User model

// Database Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'mySimpleSecret', // Simple hard-coded secret for development
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
}));
app.use(express.static('public'));

// Middleware to check if the user is authenticated
// function isAuthenticated(req, res, next) {
//     if (req.session && req.session.user) {
//         req.user = req.session.user; // Make `req.user` available if authenticated
//         return next();
//     } else {
//         return res.redirect('/auth/login'); // Redirect to login if not authenticated
//     }
// }

// Set up EJS
app.set('view engine', 'ejs');

// Require routes
const authRoutes = require('./routes/auth'); // Assuming login is defined in auth.js
app.use('/auth', authRoutes);

const subscriptionRoute = require('./routes/subscription');
app.use('/subscription', subscriptionRoute);

const paymentRoutes = require('./routes/payment');
app.use('/payment', paymentRoutes);

// Dashboard Route
app.get('/dashboard',(req, res) => {
    res.render('dashboard', { user: req.user });
});

// Default Route: If the user is logged in, redirect to dashboard; otherwise, render register page
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('register');
    }
});

// Payment route (POST) - Handles dummy payment processing
app.post('/payment',(req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send('User not authenticated');
    }
    
    // Payment processing logic
    // For demonstration, we assume payment is successful and update subscription details
    User.findByIdAndUpdate(user._id, {
        subscriptionStatus: true,
        subscriptionDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 month from now
    }, { new: true }, (err, updatedUser) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error processing subscription.');
        }
        req.session.user = updatedUser; // Update session with new user data
        res.redirect('/dashboard');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
