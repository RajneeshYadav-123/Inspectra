const Inspector = require('../models/Inspector');
const addInspector = async (req, res) => {
    try {
        const { name, phone, location, isAvailable } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Inspector name is required"
            });
        }
        const inspector = await Inspector.create({
            name,
            phone,
            location,
            isAvailable
        });
        res.status(201).json({
            success: true,
            data: inspector
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const getInspectors = async (req, res) => {
    try {
        const inspectors = await Inspector.find();
        res.status(200).json({
            success: true,
            count: inspectors.length,
            data: inspectors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
module.exports = {
    addInspector,
    getInspectors
};
