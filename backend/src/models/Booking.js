const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    customerPhone: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Please use a valid 10-digit phone number'],
        trim: true
    },
    vehicleDetails: {
        registrationNumber: { type: String, trim: true },
        vehicleType: { type: String, trim: true },
        model: { type: String, trim: true },
        year: { type: Number },
        variant: { type: String, trim: true },
        engineNumber: { type: String, trim: true }
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Service is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
        trim: true
    },
    visitDate: {
        type: Date
    },
    visitTime: {
        type: String,
        trim: true
    },
    inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignmentStatus: {
        type: String,
        enum: ['NOT_ASSIGNED', 'PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'NOT_ASSIGNED'
    },
    status: {
        type: String,
        enum: ['BOOKED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'CANCELLED'],
        default: 'BOOKED'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
