const Appointment = require('../models/Appointment');

// Create or update appointment slots for a given date
exports.createAppointment = async (req, res) => {
    const { date, timeSlots } = req.body;
    const userId = req.session.userId; // Get userId from session or request

    if (!Array.isArray(timeSlots) || !date) {
        return res.render('appointment', {
            isAuthenticated: req.session.userId ? true : false,
            userType: req.session.userType || null,
            addedSlots: [],
            message: 'Invalid input',
            error: null // Ensure error is defined
        });
    }

    try {
        // Check if any of the time slots are already booked
        const existingAppointments = await Appointment.find({ date, time: { $in: timeSlots } }).exec();
        if (existingAppointments.length > 0) {
            return res.render('appointment', {
                isAuthenticated: req.session.userId ? true : false,
                userType: req.session.userType || null,
                addedSlots: [],
                message: 'One or more time slots are already booked',
                error: null // Ensure error is defined
            });
        }

        // Add new appointment slots
        const appointments = timeSlots.map(timeSlot => ({
            date,
            time: timeSlot,
            isTimeSlotAvailable: true // Ensure new slots are available by default
        }));
        await Appointment.insertMany(appointments);

        res.render('appointment', {
            isAuthenticated: req.session.userId ? true : false,
            userType: req.session.userType || null,
            addedSlots: timeSlots,
            message: 'Slot published',
            error: null // Ensure error is defined
        });
    } catch (err) {
        console.error(err);
        res.render('appointment', {
            isAuthenticated: req.session.userId ? true : false,
            userType: req.session.userType || null,
            addedSlots: [],
            message: 'Error saving appointments',
            error: true // Set error to true if an error occurs
        });
    }
};

exports.disableTime = async (req, res) => {
    const date = req.params.date;

    try {
        const publishedAppointments = await Appointment.find({ date }).exec();
        const publishedSlots = publishedAppointments.map(appointment => appointment.time);
        res.json({ success: true, publishedSlots });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Error fetching published slots' });
    }
}