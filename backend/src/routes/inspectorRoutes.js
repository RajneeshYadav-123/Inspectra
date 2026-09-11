const express = require('express');
const router = express.Router();
const {
    addInspector,
    getInspectors
} = require('../controllers/inspectorController');
router.route('/')
    .post(addInspector)
    .get(getInspectors);
module.exports = router;
