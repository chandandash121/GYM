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

// Set up EJS
app.set('view engine', 'ejs');

// Require routes
const authRoutes = require('./routes/auth'); // Assuming login is defined in auth.js

// Use routes
app.use('/auth', authRoutes);
const subscriptionRoute = require('./routes/subscription');
app.use('/subscription', subscriptionRoute);
const paymentRoutes = require('./routes/payment'); // Adjust the path if needed
app.use('/payment', paymentRoutes);



// Dashboard Route
app.get('/dashboard', async (req, res) => {
    // Check if the user is authenticated
    if (!req.session.userId) {
        return res.redirect('/auth/login'); // Redirect to login if not authenticated
    }

    try {
        // Retrieve user data from the database
        const user = await User.findById(req.session.userId); // Make sure user ID is valid
        if (!user) {
            return res.redirect('/auth/login'); // Redirect if user not found
        }
        // Render the dashboard view and pass user data
        res.render('dashboard', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get('/', (req, res) => res.render('register')); // Redirects to register page
app.post('/payment', (req, res, next) => {
    if (!req.user) {
      return res.status(401).send('User not authenticated');
    }
  
    const userId = req.user._id;  // Safe to access _id now
    // Continue with the payment logic
  });
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
