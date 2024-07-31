const User = require('../models/User');

// Render G Test Page
exports.renderGTest = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.render('gtest', {
            isAuthenticated: req.session.userId ? true : false,
            userType: req.session.userType || null,
            user: user || null,
            error: req.query.error || null // Pass error if present
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.render('gtest', {
            isAuthenticated: req.session.userId ? true : false,
            userType: req.session.userType || null,
            user: null,
            error: "Error retrieving information."
        });
    }
};

exports.updateGTestData = async (req, res) => {
    const { firstName, lastName, age, dob, carMake, carModel, carYear, carPlate } = req.body;

    try {
        // Fetch user data based on session userId
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user data with form inputs
        user.firstName = firstName;
        user.lastName = lastName;
        user.age = age;
        user.dob = dob;
        user.carDetails.carMake = carMake;
        user.carDetails.carModel = carModel;
        user.carDetails.carYear = carYear;
        user.carDetails.carPlate = carPlate;

        // Save updated user data
        await user.save();
        res.redirect('/gtest');
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};