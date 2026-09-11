const mongoose = require('mongoose');
const inspectorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Inspector name is required'],
        trim: true
    },
    phone: {
        type: String,
        unique: true,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
const Inspector = mongoose.model('Inspector', inspectorSchema);
module.exports = Inspector;
