require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Bus, Route, Student } = require('../models');

const sampleData = {
  users: [
    {
      name: 'Admin User',
      email: 'admin@sbts.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890'
    },
    {
      name: 'John Driver',
      email: 'driver1@sbts.com',
      password: 'driver123',
      role: 'driver',
      phone: '2345678901'
    },
    {
      name: 'Jane Driver',
      email: 'driver2@sbts.com',
      password: 'driver123',
      role: 'driver',
      phone: '3456789012'
    },
    {
      name: 'Parent Smith',
      email: 'parent1@sbts.com',
      password: 'parent123',
      role: 'parent',
      phone: '4567890123'
    },
    {
      name: 'Parent Johnson',
      email: 'parent2@sbts.com',
      password: 'parent123',
      role: 'parent',
      phone: '5678901234'
    }
  ],
  routes: [
    {
      name: 'North Route',
      description: 'Covers northern residential areas to Lincoln Elementary',
      waypoints: [
        { name: 'Oak Street Stop', location: { type: 'Point', coordinates: [-73.9857, 40.7484] }, order: 1, type: 'pickup', estimatedArrival: '7:15 AM' },
        { name: 'Maple Avenue Stop', location: { type: 'Point', coordinates: [-73.9800, 40.7520] }, order: 2, type: 'pickup', estimatedArrival: '7:25 AM' },
        { name: 'Pine Street Stop', location: { type: 'Point', coordinates: [-73.9750, 40.7550] }, order: 3, type: 'pickup', estimatedArrival: '7:35 AM' },
        { name: 'Lincoln Elementary', location: { type: 'Point', coordinates: [-73.9700, 40.7600] }, order: 4, type: 'school', estimatedArrival: '7:50 AM' }
      ],
      startPoint: { name: 'Bus Depot', location: { type: 'Point', coordinates: [-73.9900, 40.7450] } },
      endPoint: { name: 'Lincoln Elementary', location: { type: 'Point', coordinates: [-73.9700, 40.7600] } },
      distance: 8.5,
      estimatedDuration: 45,
      schedule: { morningDeparture: '7:00 AM', afternoonDeparture: '3:00 PM' }
    },
    {
      name: 'South Route',
      description: 'Covers southern areas to Washington Middle School',
      waypoints: [
        { name: 'Main Street Stop', location: { type: 'Point', coordinates: [-73.9850, 40.7400] }, order: 1, type: 'pickup', estimatedArrival: '7:20 AM' },
        { name: 'Cedar Lane Stop', location: { type: 'Point', coordinates: [-73.9820, 40.7350] }, order: 2, type: 'pickup', estimatedArrival: '7:30 AM' },
        { name: 'Elm Court Stop', location: { type: 'Point', coordinates: [-73.9780, 40.7300] }, order: 3, type: 'pickup', estimatedArrival: '7:40 AM' },
        { name: 'Washington Middle School', location: { type: 'Point', coordinates: [-73.9720, 40.7250] }, order: 4, type: 'school', estimatedArrival: '7:55 AM' }
      ],
      startPoint: { name: 'Bus Depot', location: { type: 'Point', coordinates: [-73.9900, 40.7450] } },
      endPoint: { name: 'Washington Middle School', location: { type: 'Point', coordinates: [-73.9720, 40.7250] } },
      distance: 10.2,
      estimatedDuration: 50,
      schedule: { morningDeparture: '7:05 AM', afternoonDeparture: '3:15 PM' }
    }
  ],
  buses: [
    { busNumber: 'BUS-001', licensePlate: 'ABC1234', capacity: 40, status: 'active' },
    { busNumber: 'BUS-002', licensePlate: 'DEF5678', capacity: 35, status: 'active' },
    { busNumber: 'BUS-003', licensePlate: 'GHI9012', capacity: 45, status: 'maintenance' }
  ],
  students: [
    { name: 'Tommy Smith', studentId: 'STU001', grade: '3rd', school: 'Lincoln Elementary' },
    { name: 'Sarah Smith', studentId: 'STU002', grade: '5th', school: 'Lincoln Elementary' },
    { name: 'Mike Johnson', studentId: 'STU003', grade: '7th', school: 'Washington Middle School' },
    { name: 'Emily Johnson', studentId: 'STU004', grade: '6th', school: 'Washington Middle School' }
  ]
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sbts');
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await Student.deleteMany({});
    console.log('Cleared existing data');

    const createdUsers = await User.create(sampleData.users);
    console.log(`Created ${createdUsers.length} users`);

    const adminUser = createdUsers.find(u => u.role === 'admin');
    const drivers = createdUsers.filter(u => u.role === 'driver');
    const parents = createdUsers.filter(u => u.role === 'parent');

    const createdRoutes = await Route.create(sampleData.routes);
    console.log(`Created ${createdRoutes.length} routes`);

    const busesWithAssignments = sampleData.buses.map((bus, index) => ({
      ...bus,
      driver: drivers[index % drivers.length]?._id,
      route: createdRoutes[index % createdRoutes.length]?._id,
      currentLocation: {
        type: 'Point',
        coordinates: [-73.9857 + (index * 0.005), 40.7484 + (index * 0.005)]
      }
    }));

    const createdBuses = await Bus.create(busesWithAssignments);
    console.log(`Created ${createdBuses.length} buses`);

    const studentsWithAssignments = sampleData.students.map((student, index) => ({
      ...student,
      parent: parents[index % parents.length]._id,
      bus: createdBuses[index % createdBuses.length]._id,
      route: createdRoutes[index % createdRoutes.length]._id,
      pickupPoint: {
        name: `Stop ${index + 1}`,
        location: {
          type: 'Point',
          coordinates: [-73.9857 + (index * 0.003), 40.7484 + (index * 0.003)]
        }
      }
    }));

    const createdStudents = await Student.create(studentsWithAssignments);
    console.log(`Created ${createdStudents.length} students`);

    for (const parent of parents) {
      const parentStudents = createdStudents.filter(
        s => s.parent.toString() === parent._id.toString()
      );
      await User.findByIdAndUpdate(parent._id, {
        students: parentStudents.map(s => s._id)
      });
    }

    console.log('\n=== Seed Complete ===');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@sbts.com / admin123');
    console.log('Driver: driver1@sbts.com / driver123');
    console.log('Parent: parent1@sbts.com / parent123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
