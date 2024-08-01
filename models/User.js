const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// Define UserSchema with necessary fields and default values
const UserSchema = new Schema({
    firstName: { type: String, default: 'default' },
    lastName: { type: String, default: 'default' },
    licenseNumber: { type: String},
    age: { type: Number, default: 0 },
    dob: { type: Date, default: Date.now },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['Driver', 'Examiner', 'Admin'], default: 'Driver' },
    carDetails: {
        carMake: { type: String, default: 'default' },
        carModel: { type: String, default: 'default' },
        carYear: { type: Number, default: 0 },
        carPlate: { type: String, default: 'default' }
    },
    testType: { type: String, enum: ['G', 'G2'] },
    comments: [{ examiner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, comment: String }],
    passFailStatus: { type: Boolean, default: null },
    appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }]
});

// Pre-save hook to hash password and licenseNumber before saving
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    if (this.isModified('licenseNumber')) {
        const salt = await bcrypt.genSalt(10);
        this.licenseNumber = await bcrypt.hash(this.licenseNumber, salt);
    }
    next();
});

// Export User model
const User = mongoose.model('User', UserSchema);

module.exports = User;