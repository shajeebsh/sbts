require('dotenv').config();
const mongoose = require('mongoose');
const { io } = require('socket.io-client');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const jwt = require('jsonwebtoken');

class GPSSimulator {
  constructor() {
    this.socket = null;
    this.buses = [];
    this.intervalId = null;
    this.updateInterval = 3000;
  }

  async connect() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sbts');
    console.log('Connected to MongoDB');

    const token = jwt.sign(
      { id: 'simulator', role: 'admin' },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '24h' }
    );

    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  async loadBuses() {
    this.buses = await Bus.find({ isActive: true, status: { $ne: 'maintenance' } })
      .populate('route');

    console.log(`Loaded ${this.buses.length} buses for simulation`);

    this.buses = this.buses.map(bus => ({
      id: bus._id.toString(),
      busNumber: bus.busNumber,
      currentLocation: bus.currentLocation?.coordinates || [-73.9857, 40.7484],
      route: bus.route,
      waypointIndex: 0,
      direction: 1,
      speed: 25 + Math.random() * 15
    }));
  }

  calculateNextPosition(bus) {
    if (!bus.route || !bus.route.waypoints || bus.route.waypoints.length === 0) {
      const randomOffset = () => (Math.random() - 0.5) * 0.001;
      return [
        bus.currentLocation[0] + randomOffset(),
        bus.currentLocation[1] + randomOffset()
      ];
    }

    const waypoints = bus.route.waypoints;
    const targetWaypoint = waypoints[bus.waypointIndex];
    const targetCoords = targetWaypoint.location.coordinates;

    const dx = targetCoords[0] - bus.currentLocation[0];
    const dy = targetCoords[1] - bus.currentLocation[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    const speedFactor = 0.0001 * (bus.speed / 30);

    if (distance < 0.0005) {
      bus.waypointIndex += bus.direction;

      if (bus.waypointIndex >= waypoints.length) {
        bus.direction = -1;
        bus.waypointIndex = waypoints.length - 2;
      } else if (bus.waypointIndex < 0) {
        bus.direction = 1;
        bus.waypointIndex = 1;
      }

      return bus.currentLocation;
    }

    const newLon = bus.currentLocation[0] + (dx / distance) * speedFactor;
    const newLat = bus.currentLocation[1] + (dy / distance) * speedFactor;

    return [newLon, newLat];
  }

  calculateHeading(oldPos, newPos) {
    const dx = newPos[0] - oldPos[0];
    const dy = newPos[1] - oldPos[1];
    let heading = Math.atan2(dx, dy) * (180 / Math.PI);
    if (heading < 0) heading += 360;
    return Math.round(heading);
  }

  simulateMovement() {
    this.buses.forEach(bus => {
      const oldPosition = [...bus.currentLocation];
      const newPosition = this.calculateNextPosition(bus);
      bus.currentLocation = newPosition;

      const heading = this.calculateHeading(oldPosition, newPosition);
      const speed = bus.speed + (Math.random() - 0.5) * 5;

      if (this.socket && this.socket.connected) {
        this.socket.emit('update:location', {
          busId: bus.id,
          coordinates: newPosition,
          speed: Math.max(0, speed),
          heading
        });
      }

      console.log(`Bus ${bus.busNumber}: [${newPosition[0].toFixed(6)}, ${newPosition[1].toFixed(6)}] @ ${speed.toFixed(1)} mph`);
    });
  }

  start() {
    console.log(`Starting GPS simulation (update every ${this.updateInterval}ms)`);
    this.intervalId = setInterval(() => this.simulateMovement(), this.updateInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.socket) {
      this.socket.disconnect();
    }
    console.log('GPS simulation stopped');
  }
}

const runSimulator = async () => {
  const simulator = new GPSSimulator();

  try {
    await simulator.connect();
    await simulator.loadBuses();

    if (simulator.buses.length === 0) {
      console.log('No buses found. Please run seed script first: npm run seed');
      process.exit(1);
    }

    simulator.start();

    process.on('SIGINT', () => {
      console.log('\nShutting down simulator...');
      simulator.stop();
      mongoose.connection.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Simulator error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runSimulator();
}

module.exports = GPSSimulator;
