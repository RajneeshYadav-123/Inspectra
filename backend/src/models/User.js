const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
            select: false 
        },
        phone: {
            type: String,
            trim: true
        },
        location: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            enum: ['admin', 'inspector', 'customer'],
            default: 'customer'
        }
    },
    {
        timestamps: true
    }
);
module.exports = mongoose.model('User', userSchema);
