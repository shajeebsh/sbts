const request = require('supertest');
const express = require('express');
const User = require('../src/models/User');
const Bus = require('../src/models/Bus');
const driverRoutes = require('../src/routes/drivers');

require('./setup');

const app = express();
app.use(express.json());
app.use('/api/drivers', driverRoutes);

describe('Driver Routes', () => {
  let adminToken, parentToken;

  beforeEach(async () => {
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = adminUser.getSignedJwtToken();

    const parentUser = await User.create({
      name: 'Parent',
      email: 'parent@test.com',
      password: 'password123',
      role: 'parent'
    });
    parentToken = parentUser.getSignedJwtToken();
  });

  describe('GET /api/drivers', () => {
    it('should get all drivers as admin', async () => {
      await User.create([
        { name: 'Driver 1', email: 'driver1@test.com', password: 'password123', role: 'driver' },
        { name: 'Driver 2', email: 'driver2@test.com', password: 'password123', role: 'driver' }
      ]);

      const res = await request(app)
        .get('/api/drivers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('should not allow parent to list drivers', async () => {
      const res = await request(app)
        .get('/api/drivers')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/drivers', () => {
    it('should create a new driver as admin', async () => {
      const res = await request(app)
        .post('/api/drivers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Driver',
          email: 'newdriver@test.com',
          password: 'password123',
          phone: '1234567890'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('New Driver');
      expect(res.body.data.role).toBe('driver');
    });

    it('should not create driver with existing email', async () => {
      await User.create({
        name: 'Existing Driver',
        email: 'existing@test.com',
        password: 'password123',
        role: 'driver'
      });

      const res = await request(app)
        .post('/api/drivers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Driver',
          email: 'existing@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/drivers/:id', () => {
    it('should get driver details with assigned bus', async () => {
      const driver = await User.create({
        name: 'Detail Driver',
        email: 'detail@test.com',
        password: 'password123',
        role: 'driver'
      });

      const bus = await Bus.create({
        busNumber: 'BUS-DRV',
        licensePlate: 'DRV123',
        capacity: 40,
        driver: driver._id
      });

      const res = await request(app)
        .get(`/api/drivers/${driver._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Detail Driver');
      expect(res.body.data.assignedBus).toBeDefined();
      expect(res.body.data.assignedBus.busNumber).toBe('BUS-DRV');
    });
  });

  describe('PUT /api/drivers/:id', () => {
    it('should update driver', async () => {
      const driver = await User.create({
        name: 'Update Driver',
        email: 'update@test.com',
        password: 'password123',
        role: 'driver'
      });

      const res = await request(app)
        .put(`/api/drivers/${driver._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
          phone: '9876543210'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.phone).toBe('9876543210');
    });
  });

  describe('DELETE /api/drivers/:id', () => {
    it('should deactivate driver and unassign from bus', async () => {
      const driver = await User.create({
        name: 'Delete Driver',
        email: 'delete@test.com',
        password: 'password123',
        role: 'driver'
      });

      const bus = await Bus.create({
        busNumber: 'BUS-DEL',
        licensePlate: 'DEL123',
        capacity: 40,
        driver: driver._id
      });

      const res = await request(app)
        .delete(`/api/drivers/${driver._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);

      const updatedDriver = await User.findById(driver._id);
      expect(updatedDriver.isActive).toBe(false);

      const updatedBus = await Bus.findById(bus._id);
      expect(updatedBus.driver).toBeUndefined();
    });
  });
});
