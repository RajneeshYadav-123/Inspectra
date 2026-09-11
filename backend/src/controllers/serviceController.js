const Service = require('../models/Service');
const xlsx = require('xlsx');
const fs = require('fs');
const createService = async (req, res) => {
    try {
        const { name, price, description, checklist } = req.body;
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: "Name and price are required"
            });
        }
        if (checklist && !Array.isArray(checklist)) {
            return res.status(400).json({
                success: false,
                message: "Checklist must be an array if provided"
            });
        }
        const service = await Service.create({
            name,
            price,
            description: description || '',
            checklist: checklist || []
        });
        res.status(201).json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
};
const updateService = async (req, res) => {
    try {
        const { name, price, description, checklist } = req.body;
        let service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        service = await Service.findByIdAndUpdate(req.params.id, {
            name,
            price,
            description,
            checklist
        }, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating service'
        });
    }
};
const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        await service.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error deleting service'
        });
    }
};
const { parseExcelFile } = require('../utils/excelParser');
const uploadExcelConverter = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        const checklist = parseExcelFile(req.file.buffer);
        res.status(200).json({
            success: true,
            checklist
        });
    } catch (error) {
        console.error('Excel parse error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing Excel file',
            error: error.message
        });
    }
};
module.exports = {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
    uploadExcelConverter
};
