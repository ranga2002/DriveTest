const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Render Examiner Page
exports.getExaminerPage = async (req, res) => {
    try {
        const testType = req.query.testType;
        const filter = testType ? { testType } : {};
        const users = await User.find({ userType: 'Driver', ...filter });
        res.render('examiner', { users, successMessage: req.flash('success'), errorMessage: req.flash('error') });
    } catch (error) {
        console.error('Error fetching drivers:', error);
        req.flash('error', 'Error fetching drivers');
        res.redirect('/examiner');
    }
};

// Add comment to a user's appointment
exports.addComment = async (req, res) => {
    const { userId, comment } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/examiner');
        }

        user.comments.push({ examiner: req.session.userId, comment });
        await user.save();

        req.flash('success', 'Comment added successfully.');
        res.redirect('/examiner');
    } catch (error) {
        req.flash('error', 'Unable to add comment.');
        res.redirect('/examiner');
    }
};

// Update pass/fail status
exports.updatePassFailStatus = async (req, res) => {
    const { userId, passFail } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/examiner');
        }

        user.passFailStatus = passFail === 'true';
        await user.save();

        req.flash('success', 'Pass/Fail status updated successfully.');
        res.redirect('/examiner');
    } catch (error) {
        req.flash('error', 'Unable to update pass/fail status.');
        res.redirect('/examiner');
    }
};