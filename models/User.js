// models/User.js
const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  // add other fields as necessary
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
