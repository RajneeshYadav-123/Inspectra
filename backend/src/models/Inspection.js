const mongoose = require('mongoose');
const inspectionSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    answers: [{
        questionText: {
            type: String,
            required: true,
            trim: true
        },
        selectedOption: {
            type: String,
            required: true,
            trim: true
        },
        remark: {
            type: String,
            trim: true
        },
        imageUrl: {
            type: String,
            trim: true
        }
    }]
}, {
    timestamps: true
});
const Inspection = mongoose.model('Inspection', inspectionSchema);
module.exports = Inspection;
