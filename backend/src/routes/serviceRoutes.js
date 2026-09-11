const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
    uploadExcelConverter
} = require('../controllers/serviceController');
router.route('/upload-excel')
    .post(upload.single('file'), uploadExcelConverter);
router.route('/')
    .post(createService)
    .get(getServices);
router.route('/:id')
    .get(getServiceById)
    .put(updateService)
    .delete(deleteService);
module.exports = router;
