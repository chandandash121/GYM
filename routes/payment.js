const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure the path is correct
const user = { _id: '672bcaf8d3ed72eaeca971a0-id', username: 'dash' };
// Route to display the payment page
router.get('/pay-subscription', (req, res) => {
    res.render('pay-subscription', { user: req.user });
});

// Route to handle subscription activation (without real payment)
router.post('/pay-subscription', async (req, res) => {
    try {
        // Assuming you have a Mongoose model named User
User.findById(req.username, (err, user) => {
    if (err || !user) {
      return res.status(404).send('User not found');
    }
  
    // Modify the user document
    user.subscription = 'new_subscription_value'; // for example
  
    // Save the modified user document
    user.save((saveErr) => {
      if (saveErr) {
        return res.status(500).send('Error saving user');
      }
      return res.send('Subscription updated');
    });
  });
  
        // Redirect to a confirmation page
        res.redirect('/dashboard'); // Customize as needed
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing subscription.");
    }
});

module.exports = router;
