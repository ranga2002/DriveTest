const User = require('../models/User');
const Appointment = require('../models/Appointment');

exports.renderGTest = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('appointments');
        res.render('gtest', {
            user,
            successMessage: req.flash('success'),
            errorMessage: req.flash('error'),
            comments: user.comments,
            passFailStatus: user.passFailStatus
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        req.flash('error', 'Error rendering G Test page');
        res.redirect('/?errorMessage=Error rendering G Test page');
    }
};

exports.updateGTestData = async (req, res) => {
    const { firstName, lastName, age, dob, carMake, carModel, carYear, carPlate } = req.body;

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.age = age;
        user.dob = dob;
        user.carDetails.carMake = carMake;
        user.carDetails.carModel = carModel;
        user.carDetails.carYear = carYear;
        user.carDetails.carPlate = carPlate;
        user.testType = 'G'; // Set testType to 'G'

        await user.save();
        res.redirect('/gtest');
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAvailableSlots = async (req, res) => {
    const { date } = req.query;
    try {
        const appointments = await Appointment.find({ date, isTimeSlotAvailable: true });
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: 'Error fetching available slots' });
    }
};

exports.bookAppointment = async (req, res) => {
    const { appointmentDate, selectedTimeSlot, testType } = req.body; // Added testType
    try {
        const appointment = await Appointment.findOne({ date: appointmentDate, time: selectedTimeSlot, isTimeSlotAvailable: true });
        if (!appointment) {
            req.flash('error', 'Selected time slot is no longer available');
            return res.redirect('/gtest');
        }
        appointment.isTimeSlotAvailable = false;
        appointment.userId = req.session.userId;
        appointment.testType = testType; // Save testType
        await appointment.save();

        const user = await User.findById(req.session.userId);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/gtest');
        }
        user.appointments.push(appointment._id);
        await user.save();

        req.flash('success', 'Appointment booked successfully');
        res.redirect('/gtest');
    } catch (error) {
        console.error('Error booking appointment:', error);
        req.flash('error', 'Error booking appointment');
        res.redirect('/gtest');
    }
};