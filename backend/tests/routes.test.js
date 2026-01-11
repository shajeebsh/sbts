const request = require('supertest');
const express = require('express');
const User = require('../src/models/User');
const Route = require('../src/models/Route');
const routeRoutes = require('../src/routes/routes');

require('./setup');

const app = express();
app.use(express.json());
app.use('/api/routes', routeRoutes);

describe('Route Routes', () => {
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

  describe('GET /api/routes', () => {
    it('should get all routes', async () => {
      await Route.create([
        { name: 'North Route', description: 'Northern area' },
        { name: 'South Route', description: 'Southern area' }
      ]);

      const res = await request(app)
        .get('/api/routes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2);
    });
  });

  describe('POST /api/routes', () => {
    it('should create a new route as admin', async () => {
      const res = await request(app)
        .post('/api/routes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Route',
          description: 'Test route',
          waypoints: [
            {
              name: 'Stop 1',
              location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
              order: 1,
              type: 'pickup'
            }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('New Route');
    });

    it('should not allow parent to create route', async () => {
      const res = await request(app)
        .post('/api/routes')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          name: 'New Route'
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/routes/:id/waypoints', () => {
    it('should add waypoint to route', async () => {
      const route = await Route.create({
        name: 'Waypoint Route',
        waypoints: []
      });

      const res = await request(app)
        .post(`/api/routes/${route._id}/waypoints`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Stop',
          coordinates: [-73.9800, 40.7500],
          order: 1,
          type: 'pickup'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.waypoints).toHaveLength(1);
      expect(res.body.data.waypoints[0].name).toBe('New Stop');
    });
  });

  describe('PUT /api/routes/:id/waypoints/:waypointId', () => {
    it('should update a waypoint', async () => {
      const route = await Route.create({
        name: 'Update Waypoint Route',
        waypoints: [{
          name: 'Original Stop',
          location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
          order: 1,
          type: 'pickup'
        }]
      });

      const waypointId = route.waypoints[0]._id;

      const res = await request(app)
        .put(`/api/routes/${route._id}/waypoints/${waypointId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Stop',
          order: 2
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.waypoints[0].name).toBe('Updated Stop');
    });
  });

  describe('DELETE /api/routes/:id/waypoints/:waypointId', () => {
    it('should delete a waypoint', async () => {
      const route = await Route.create({
        name: 'Delete Waypoint Route',
        waypoints: [{
          name: 'To Delete',
          location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
          order: 1,
          type: 'pickup'
        }]
      });

      const waypointId = route.waypoints[0]._id;

      const res = await request(app)
        .delete(`/api/routes/${route._id}/waypoints/${waypointId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.waypoints).toHaveLength(0);
    });
  });
});
