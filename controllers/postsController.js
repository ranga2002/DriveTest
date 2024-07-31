const User = require('../models/User');

exports.storeUserData = async (req, res) => {
    const userId = req.session.userId;

    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user data based on form input
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.licenseNumber = req.body.licenseNumber;
        user.age = req.body.age;
        user.dob = req.body.dob;
        user.car_details.carMake = req.body.carMake;
        user.car_details.carModel = req.body.carModel;
        user.car_details.carYear = req.body.carYear;
        user.car_details.carPlate = req.body.carPlate;

        // Save updated user data
        await user.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
