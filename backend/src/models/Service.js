const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        default: [],
        validate: [arr => arr.length > 0, 'Options required']
    }
});
const sectionSchema = new mongoose.Schema({
    sectionName: {
        type: String
    },
    questions: [questionSchema]
});
const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    checklist: [sectionSchema]
}, {
    timestamps: true
});
const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
