const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this is the correct path
const bcrypt = require('bcrypt');

// Render registration page
router.get('/register', (req, res) => {
    res.render('register'); // Make sure this corresponds to a valid EJS file
});

// Handle registration
router.post('/register', async (req, res) => {
    const { name, username, password, email } = req.body;

    // Check if the username is already taken
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
        return res.status(400).send('User already exists.');
    }

    // Proceed to create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        name,
        username: username.toLowerCase(),
        password: hashedPassword,
        email: email || null // Default to null if no email is provided
    });

    await newUser.save()
        .then(() => res.redirect('/auth/login'))
        .catch(err => {
            console.error(err);
            res.status(500).send('Server error');
        });
});

// Render login page
router.get('/login', (req, res) => {
    res.render('login'); // Ensure this corresponds to a valid EJS file
});

// Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
        return res.status(400).send('Invalid username or password.');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('Invalid username or password.');
    }

    // Set session userId (make sure to set up sessions in your app.js)
    req.session.userId = user._id; // Store user ID in session
    res.redirect('/dashboard'); // Redirect to the dashboard or desired page
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/'); // Redirect to the registration page after logout
    });
});

module.exports = router;
