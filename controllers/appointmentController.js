const User = require('../models/User');
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

// List Pass/Fail candidates with their comments
exports.listCandidates = async (req, res) => {
    try {
        // Fetch only drivers who have a pass/fail status
        const users = await User.find({ userType: 'Driver', passFailStatus: { $ne: null } })
            .populate('comments.examiner', 'firstName lastName')
            .exec(); // Populate examiner details in comments
        res.render('passFailCandidates', {
            users,
            isAuthenticated: req.session.userId ? true : false,
            userType: req.session.userType || null, // Pass userType to the view
            message: req.flash('message'),
            error: req.flash('error')
        });
    } catch (error) {
        console.error(error);
        res.render('passFailCandidates', {
            isAuthenticated: req.session.userId ? true : false,
            userType: req.session.userType || null, // Pass userType to the view
            users: [], // Pass an empty array if there's an error
            message: req.flash('message'),
            error: 'Unable to fetch users'
        });
    }
};


// Verify Comments and Pass/Fail Status as a Driver
exports.verifyStatus = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId).exec();
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('verifyStatus', {
            isAuthenticated: req.session.userId ? true : false,
            userType: req.session.userType || null,
            user: user,
            message: null,
            error: null
        });
    } catch (err) {
        console.error(err);
        res.render('verifyStatus', {
            isAuthenticated: req.session.userId ? true : false,
            userType: req.session.userType || null,
            user: null,
            message: 'Error fetching user status',
            error: true
        });
    }
};