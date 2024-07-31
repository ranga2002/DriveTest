const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.signup = async (req, res) => {
    const { username, password, repeatPassword, userType } = req.body;

    // Validate passwords match
    if (password !== repeatPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/signup');
    }

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            req.flash('error', 'Username already exists.');
            return res.redirect('/signup');
        }

        // Create new user with default values
        const newUser = new User({
            username,
            password,  // Password is hashed in User model
            userType
        });

        // Save user
        await newUser.save();
        req.flash('success', 'Signup successful. Please login.');
        res.redirect('/login');
    } catch (err) {
        console.error("Error signing up:", err);
        req.flash('error', 'Error signing up.');
        res.redirect('/signup');
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            req.flash('error', 'Invalid credentials.');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            req.flash('error', 'Invalid credentials.');
            return res.redirect('/login');
        }

        // Set user session data
        req.session.userId = user._id;
        req.session.userType = user.userType;

        // Redirect based on user type
        if (user.userType === 'Driver') {
            req.flash('success', 'Login successful.');
            res.redirect('/gtest');
        } else if (user.userType === 'Admin') {
            req.flash('success', 'Login successful.');
            res.redirect('/appointment');
        } else {
            req.flash('success', 'Login successful.');
            res.redirect('/');
        }
    } catch (err) {
        console.error("Error logging in:", err);
        req.flash('error', 'Error logging in.');
        res.redirect('/login');
    }
};


exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Error logging out.");
        }
        res.redirect('/login');
    });
};
