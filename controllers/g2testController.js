const User = require('../models/User');
const Appointment = require('../models/Appointment');

module.exports = {
    renderG2Test: async (req, res) => {
        try {
            const user = await User.findById(req.session.userId).populate('appointments');
            res.render('g2test', { user, successMessage: req.flash('success'), errorMessage: req.flash('error') });
        } catch (error) {
            console.error('Error rendering G2 Test page:', error);
            req.flash('error', 'Error rendering G2 Test page');
            res.redirect('/?errorMessage=Error rendering G2 Test page');
        }
    },

    updateUserDetails: async (req, res) => {
        const { firstName, lastName, encryptedLicenseNumber, age, dob, carMake, carModel, carYear, carPlate } = req.body;
        try {
            const user = await User.findById(req.session.userId);
            if (!user) {
                req.flash('error', 'User not found');
                return res.redirect('/g2test');
            }
            user.firstName = firstName;
            user.lastName = lastName;
            user.encryptedLicenseNumber = encryptedLicenseNumber;
            user.age = age;
            user.dob = dob;
            user.carDetails = { carMake, carModel, carYear, carPlate };
            await user.save();
            req.flash('success', 'Details updated successfully');
            res.redirect('/g2test');
        } catch (error) {
            console.error('Error updating details:', error);
            req.flash('error', 'Error updating details');
            res.redirect('/g2test');
        }
    },

    getAvailableSlots: async (req, res) => {
        const { date } = req.query;
        try {
            const appointments = await Appointment.find({ date, isTimeSlotAvailable: true });
            res.json(appointments);
        } catch (error) {
            console.error('Error fetching available slots:', error);
            res.status(500).json({ error: 'Error fetching available slots' });
        }
    },

    bookAppointment: async (req, res) => {
        const { appointmentDate, selectedTimeSlot } = req.body;
        try {
            const appointment = await Appointment.findOne({ date: appointmentDate, time: selectedTimeSlot, isTimeSlotAvailable: true });
            if (!appointment) {
                req.flash('error', 'Selected time slot is no longer available');
                return res.redirect('/g2test');
            }
            appointment.isTimeSlotAvailable = false;
            appointment.userId = req.session.userId;
            await appointment.save();

            const user = await User.findById(req.session.userId);
            if (!user) {
                req.flash('error', 'User not found');
                return res.redirect('/g2test');
            }
            user.appointments.push(appointment._id);
            await user.save();

            req.flash('success', 'Appointment booked successfully');
            res.redirect('/g2test');
        } catch (error) {
            console.error('Error booking appointment:', error);
            req.flash('error', 'Error booking appointment');
            res.redirect('/g2test');
        }
    }
};
