const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });
const migrateRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for migration...');
        const users = await User.find({});
        console.log(`Found ${users.length} users to check.`);
        let updatedCount = 0;
        for (const user of users) {
            const lowerRole = user.role.toLowerCase();
            if (user.role !== lowerRole) {
                user.role = lowerRole;
                await user.save();
                updatedCount++;
            }
        }
        console.log(`Migration complete. Updated ${updatedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};
migrateRoles();
