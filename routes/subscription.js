const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust if needed

// Render subscription page
router.get('/pay-subscription', (req, res) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    res.render('pay-subscription'); // This should be the payment page view
});

// Route for handling payment submission
router.post('/pay-subscription', async (req, res) => {
    try {
        const { duration } = req.body; // Get subscription duration from form data

        const user = req.user; // Get the authenticated user
        
        // Calculate subscription end date based on the selected duration
        let subscriptionEndDate = new Date();
        if (duration == '1') {
            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // Add 1 month
        } else if (duration == '3') {
            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3); // Add 3 months
        } else if (duration == '12') {
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // Add 1 year
        }

        // Update user's subscription status
        user.subscriptionStatus = true;
        user.subscriptionDate = subscriptionEndDate;
        await user.save();

        // Redirect to dashboard after successful payment
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing subscription.');
    }
});


module.exports = router;
