const mongoose = require('mongoose');
const Service = require('./src/models/Service');
const Booking = require('./src/models/Booking');
const comprehensiveChecklist = require('./src/utils/comprehensiveChecklist');

async function runMigration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/inspectionMech');
    console.log('Connected.');

    // Update Services
    console.log('Updating Services...');
    const services = await Service.find({});
    for (let service of services) {
      service.checklist = comprehensiveChecklist;
      await service.save();
    }
    console.log(`Updated ${services.length} services.`);

    // Update Bookings
    console.log('Updating Bookings...');
    const bookings = await Booking.find({});
    for (let booking of bookings) {
      if (booking.service) {
        booking.service.checklist = comprehensiveChecklist;
        await booking.save();
      }
    }
    console.log(`Updated ${bookings.length} bookings.`);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
