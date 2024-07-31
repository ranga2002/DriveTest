const express = require('express');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');

const User = require('./models/User.js');
const Appointment = require('./models/Appointment');

// Require controllers
const postsController = require('./controllers/postsController');
const gtestController = require('./controllers/gtestController');
const g2testController = require('./controllers/g2testController');
const authController = require('./controllers/authController');
const appointmentController = require('./controllers/appointmentController');

const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

// Database connection
mongoose.connect('mongodb+srv://chakilamsriranga:QZptvEyeERLvTm0q@cluster0.tjbvb2q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true });

// Middlewares
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session && req.session.userId ? true : false;
    res.locals.userType = req.session.userType || null; // Pass userType to the view
    next();
});

app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});

// Global middleware to set active route for navigation highlighting
app.use((req, res, next) => {
    res.locals.activeRoute = req.path;
    next();
});

// Middleware to protect Admin-only routes
authMiddleware.requireAdmin = (req, res, next) => {
    if (req.session.userType !== 'Admin') {
        return res.status(403).send('Access denied.');
    }
    next();
};

// Middleware to protect logged-in routes
authMiddleware.requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// Middleware to protect driver-only routes
authMiddleware.requireDriver = (req, res, next) => {
    if (req.session.userType !== 'Driver') {
        return res.status(403).send('Access denied.');
    }
    next();
};

// Listen on port 4000
app.listen(4000, () => {
    console.log('App listening on port 4000');
});

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        isAuthenticated: req.session.userId ? true : false,
        userType: req.session.userType || null // Pass userType to the view
    });
});

// Login routes
app.get('/login', (req, res) => {
    res.render('login', { formType: 'login', error: null });
});

app.post('/login', authController.login);

// Signup routes
app.get('/signup', (req, res) => {
    res.render('signup', { formType: 'signup', error: null });
});

app.post('/signup', authController.signup);

// Logout route
app.get('/logout', authController.logout);

// G Test Page route
app.get('/gtest', authMiddleware.requireLogin, authMiddleware.requireDriver, gtestController.renderGTest);
app.post('/gtest/update', authMiddleware.requireLogin, authMiddleware.requireDriver, gtestController.updateGTestData);

// G2 Test Page routes
app.get('/g2test', authMiddleware.requireLogin, authMiddleware.requireDriver, g2testController.renderG2Test);
app.post('/g2test/update', authMiddleware.requireLogin, authMiddleware.requireDriver, g2testController.updateUserDetails);
app.get('/g2test/available-slots', g2testController.getAvailableSlots);
app.post('/g2test/book', authMiddleware.requireLogin, authMiddleware.requireDriver, g2testController.bookAppointment);

// Appointment page route
app.get('/appointment', authMiddleware.requireLogin, authMiddleware.requireAdmin, async (req, res) => {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const appointments = await Appointment.find({ date }).exec();
    const addedSlots = appointments.map(appointment => appointment.time);

    res.render('appointment', {
        isAuthenticated: req.session.userId ? true : false,
        userType: req.session.userType || null, // Pass userType to the view
        addedSlots,
        error: null // Initialize error as null
    });
});

// Handle the appointment creation form submission
app.get('/appointments/slots/:date', authMiddleware.requireLogin, authMiddleware.requireAdmin, appointmentController.disableTime)
app.post('/appointments', authMiddleware.requireLogin, authMiddleware.requireAdmin, appointmentController.createAppointment);


// Catch-all route for unknown paths
app.get('*', (req, res) => {
    res.render('404');
});
