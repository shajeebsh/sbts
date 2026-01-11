const request = require('supertest');
const express = require('express');
const User = require('../src/models/User');
const Bus = require('../src/models/Bus');
const busRoutes = require('../src/routes/buses');

require('./setup');

const app = express();
app.use(express.json());
app.use('/api/buses', busRoutes);

describe('Bus Routes', () => {
  let adminToken, parentToken, adminUser;

  beforeEach(async () => {
    adminUser = await User.create({
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

  describe('GET /api/buses', () => {
    it('should get all buses', async () => {
      await Bus.create([
        { busNumber: 'BUS-001', licensePlate: 'ABC123', capacity: 40 },
        { busNumber: 'BUS-002', licensePlate: 'DEF456', capacity: 35 }
      ]);

      const res = await request(app)
        .get('/api/buses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/buses');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/buses', () => {
    it('should create a new bus as admin', async () => {
      const res = await request(app)
        .post('/api/buses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          busNumber: 'BUS-NEW',
          licensePlate: 'NEW123',
          capacity: 45
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.busNumber).toBe('BUS-NEW');
    });

    it('should not allow parent to create bus', async () => {
      const res = await request(app)
        .post('/api/buses')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          busNumber: 'BUS-NEW',
          licensePlate: 'NEW123',
          capacity: 45
        });

      expect(res.statusCode).toBe(403);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/buses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          busNumber: 'BUS-NEW'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should not create duplicate bus number', async () => {
      await Bus.create({
        busNumber: 'BUS-DUP',
        licensePlate: 'DUP123',
        capacity: 40
      });

      const res = await request(app)
        .post('/api/buses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          busNumber: 'BUS-DUP',
          licensePlate: 'DUP456',
          capacity: 40
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/buses/:id', () => {
    it('should get a single bus', async () => {
      const bus = await Bus.create({
        busNumber: 'BUS-SINGLE',
        licensePlate: 'SNG123',
        capacity: 40
      });

      const res = await request(app)
        .get(`/api/buses/${bus._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.busNumber).toBe('BUS-SINGLE');
    });

    it('should return 404 for non-existent bus', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const res = await request(app)
        .get(`/api/buses/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/buses/:id', () => {
    it('should update a bus', async () => {
      const bus = await Bus.create({
        busNumber: 'BUS-UPD',
        licensePlate: 'UPD123',
        capacity: 40
      });

      const res = await request(app)
        .put(`/api/buses/${bus._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ capacity: 50 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.capacity).toBe(50);
    });
  });

  describe('DELETE /api/buses/:id', () => {
    it('should deactivate a bus', async () => {
      const bus = await Bus.create({
        busNumber: 'BUS-DEL',
        licensePlate: 'DEL123',
        capacity: 40
      });

      const res = await request(app)
        .delete(`/api/buses/${bus._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);

      const updatedBus = await Bus.findById(bus._id);
      expect(updatedBus.isActive).toBe(false);
    });
  });

  describe('PUT /api/buses/:id/location', () => {
    it('should update bus location', async () => {
      const bus = await Bus.create({
        busNumber: 'BUS-LOC',
        licensePlate: 'LOC123',
        capacity: 40
      });

      const res = await request(app)
        .put(`/api/buses/${bus._id}/location`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          coordinates: [-73.9857, 40.7484],
          speed: 30,
          heading: 90
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.currentLocation.coordinates).toEqual([-73.9857, 40.7484]);
      expect(res.body.data.speed).toBe(30);
    });
  });
});
