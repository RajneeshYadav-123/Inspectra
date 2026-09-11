const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Inspector = require('../models/Inspector');
const User = require('../models/User');
const Inspection = require('../models/Inspection');
const puppeteer = require('puppeteer');
const createBooking = async (req, res) => {
    try {
        const {
            customerName,
            customerPhone,
            vehicleDetails,
            service,
            address,
            visitDate,
            visitTime
        } = req.body;
        if (!customerName || !customerPhone || !service) {
            return res.status(400).json({
                success: false,
                message: 'Please provide customer name, phone and service ID'
            });
        }
        if (!vehicleDetails || !vehicleDetails.registrationNumber) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle details are required'
            });
        }
        if (!visitDate || !visitTime) {
            return res.status(400).json({
                success: false,
                message: 'Visit date and time are required'
            });
        }
        const existingService = await Service.findById(service);
        if (!existingService) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        const booking = await Booking.create({
            customerName,
            customerPhone,
            vehicleDetails,
            service,
            address,
            visitDate,
            visitTime,
            user: req.user._id
        });
        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const getBookings = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'customer') {
            query.user = req.user._id;
        } else if (req.user.role === 'inspector') {
            query.inspector = req.user._id;
        }
        const bookings = await Booking.find(query)
            .populate('service', 'name price')
            .populate('inspector', 'name phone location')
            .populate('user', 'name email');
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('service')
            .populate('inspector', 'name phone location')
            .populate('user', 'name email');
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
};
const assignInspector = async (req, res) => {
    try {
        const { inspectorId } = req.body;
        if (!inspectorId) {
            return res.status(400).json({
                success: false,
                message: 'Inspector ID is required'
            });
        }
        const inspector = await User.findById(inspectorId);
        if (!inspector || inspector.role !== 'inspector') {
            return res.status(404).json({
                success: false,
                message: 'Inspector not found or invalid user role'
            });
        }
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        if (booking.status === 'IN_PROGRESS') {
            return res.status(400).json({
                success: false,
                message: 'Cannot assign inspector to active booking'
            });
        }
        if (booking.assignmentStatus === 'ACCEPTED') {
            return res.status(400).json({
                success: false,
                message: 'Booking already assigned and accepted'
            });
        }
        booking.inspector = inspectorId;
        booking.assignmentStatus = 'PENDING';
        booking.status = 'BOOKED';
        await booking.save();
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const acceptAssignment = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        if (booking.assignmentStatus !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Booking is not in a state to be accepted'
            });
        }
        booking.assignmentStatus = 'ACCEPTED';
        booking.status = 'ASSIGNED';
        await booking.save();
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const rejectAssignment = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        if (booking.assignmentStatus !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Booking is not in a state to be rejected'
            });
        }
        booking.assignmentStatus = 'REJECTED';
        booking.inspector = null;
        booking.status = 'BOOKED';
        await booking.save();
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const startBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        if (booking.assignmentStatus !== 'ACCEPTED') {
            return res.status(400).json({
                success: false,
                message: 'Only accepted bookings can be started'
            });
        }
        if (booking.status !== 'ASSIGNED') {
            return res.status(400).json({
                success: false,
                message: 'Booking cannot be started'
            });
        }
        booking.status = 'IN_PROGRESS';
        await booking.save();
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const submitInspection = async (req, res) => {
    try {
        const bookingId = req.params.id;
        let answers = [];
        try {
            answers = JSON.parse(req.body.answers);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid answers JSON format' });
        }
        if (!Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: 'Answers array is required' });
        }
        const images = req.files || [];
        let imageIndex = 0;
        answers = answers.map(ans => {
            if (imageIndex < images.length) {
                ans.imageUrl = images[imageIndex].path;
                imageIndex++;
            }
            return ans;
        });
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        if (booking.status === 'COMPLETED' || booking.status === 'APPROVED') {
            return res.status(400).json({ success: false, message: 'Inspection already submitted' });
        }
        if (booking.status !== 'IN_PROGRESS') {
            return res.status(400).json({ success: false, message: 'Inspection can only be submitted for bookings in progress' });
        }
        const inspection = await Inspection.create({
            booking: bookingId,
            answers
        });
        booking.status = 'COMPLETED';
        await booking.save();
        res.status(200).json({
            success: true,
            message: 'Inspection submitted successfully',
            data: inspection
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const approveReport = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not found in request'
            });
        }
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        if (booking.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: `Only completed inspections can be approved (Current status: ${booking.status})`
            });
        }
        booking.status = 'APPROVED';
        booking.approvedBy = req.user._id;
        await booking.save();
        res.status(200).json({
            success: true,
            message: 'Report approved successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error in approveReport:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const { generateInspectionPDF } = require('../utils/pdfGenerator');
const getInspectionReport = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findById(bookingId)
            .populate('service')
            .populate('inspector')
            .populate('user')
            .populate('approvedBy');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        const userId = req.user._id.toString();
        const role = req.user.role;
        if (role === 'admin') {
        } else if (role === 'inspector') {
            if (booking.inspector && booking.inspector._id.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to access this report"
                });
            }
        } else if (role === 'customer') {
            if (booking.user && booking.user._id.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to access this report"
                });
            }
        }
        const inspection = await Inspection.findOne({ booking: bookingId });
        if (!inspection) {
            return res.status(404).json({ success: false, message: 'Inspection data not found' });
        }
        const pdfBuffer = await generateInspectionPDF(booking, inspection.answers);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=inspection-report-${bookingId}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        return res.status(200).send(pdfBuffer);
    } catch (error) {
        console.error("PDF Generation Error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: error.message || 'Error generating PDF report'
            });
        }
    }
};
module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    assignInspector,
    acceptAssignment,
    rejectAssignment,
    startBooking,
    submitInspection,
    approveReport,
    getInspectionReport
};
