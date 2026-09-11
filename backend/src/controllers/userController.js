const User = require('../models/User');
const getInspectors = async (req, res) => {
    try {
        const inspectors = await User.find({ role: { $in: ['inspector', 'INSPECTOR'] } })
            .select('name location phone');
        res.status(200).json({
            success: true,
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
    getInspectors
};
