const express = require('express');
const router = express.Router();
const { getInspectors } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
router.get('/inspectors', protect, getInspectors);
module.exports = router;
