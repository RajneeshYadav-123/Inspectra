const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .post(protect, createBooking)
    .get(protect, getBookings);
router.route('/:id')
    .get(protect, getBookingById);
router.route('/:id/assign')
    .post(assignInspector);
router.route('/:id/accept')
    .post(acceptAssignment);
router.route('/:id/reject')
    .post(rejectAssignment);
router.route('/:id/start')
    .post(startBooking);
const { upload } = require('../config/cloudinary');
router.route('/:id/submit-inspection')
    .post(upload.array('images'), submitInspection);
router.route('/:id/approve')
    .post(protect, authorize('admin'), approveReport);
router.route('/:id/report')
    .get(protect, authorize('admin', 'inspector', 'customer'), getInspectionReport);
module.exports = router;
