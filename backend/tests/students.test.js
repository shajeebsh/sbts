const request = require('supertest');
const express = require('express');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const studentRoutes = require('../src/routes/students');

require('./setup');

const app = express();
app.use(express.json());
app.use('/api/students', studentRoutes);

describe('Student Routes', () => {
  let adminToken, parentToken, parentUser;

  beforeEach(async () => {
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = adminUser.getSignedJwtToken();

    parentUser = await User.create({
      name: 'Parent',
      email: 'parent@test.com',
      password: 'password123',
      role: 'parent'
    });
    parentToken = parentUser.getSignedJwtToken();
  });

  describe('GET /api/students', () => {
    it('should get all students for admin', async () => {
      await Student.create([
        { name: 'Student 1', studentId: 'STU001', grade: '3rd', school: 'Test School', parent: parentUser._id },
        { name: 'Student 2', studentId: 'STU002', grade: '4th', school: 'Test School', parent: parentUser._id }
      ]);

      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('should only get own students for parent', async () => {
      const otherParent = await User.create({
        name: 'Other Parent',
        email: 'other@test.com',
        password: 'password123',
        role: 'parent'
      });

      await Student.create([
        { name: 'My Student', studentId: 'STU001', grade: '3rd', school: 'Test School', parent: parentUser._id },
        { name: 'Other Student', studentId: 'STU002', grade: '4th', school: 'Test School', parent: otherParent._id }
      ]);

      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe('My Student');
    });
  });

  describe('POST /api/students', () => {
    it('should create a new student as admin', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Student',
          studentId: 'STU-NEW',
          grade: '5th',
          school: 'Lincoln Elementary',
          parent: parentUser._id
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('New Student');
    });

    it('should not allow parent to create student', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          name: 'New Student',
          studentId: 'STU-NEW',
          grade: '5th',
          school: 'Lincoln Elementary',
          parent: parentUser._id
        });

      expect(res.statusCode).toBe(403);
    });

    it('should not create duplicate student ID', async () => {
      await Student.create({
        name: 'Existing Student',
        studentId: 'STU-DUP',
        grade: '3rd',
        school: 'Test School',
        parent: parentUser._id
      });

      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Student',
          studentId: 'STU-DUP',
          grade: '5th',
          school: 'Lincoln Elementary',
          parent: parentUser._id
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should get student details for admin', async () => {
      const student = await Student.create({
        name: 'Detail Student',
        studentId: 'STU-DET',
        grade: '3rd',
        school: 'Test School',
        parent: parentUser._id
      });

      const res = await request(app)
        .get(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Detail Student');
    });

    it('should allow parent to view their own student', async () => {
      const student = await Student.create({
        name: 'My Child',
        studentId: 'STU-CHILD',
        grade: '3rd',
        school: 'Test School',
        parent: parentUser._id
      });

      const res = await request(app)
        .get(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('should not allow parent to view other students', async () => {
      const otherParent = await User.create({
        name: 'Other Parent',
        email: 'other@test.com',
        password: 'password123',
        role: 'parent'
      });

      const student = await Student.create({
        name: 'Other Child',
        studentId: 'STU-OTHER',
        grade: '3rd',
        school: 'Test School',
        parent: otherParent._id
      });

      const res = await request(app)
        .get(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should update student', async () => {
      const student = await Student.create({
        name: 'Update Student',
        studentId: 'STU-UPD',
        grade: '3rd',
        school: 'Test School',
        parent: parentUser._id
      });

      const res = await request(app)
        .put(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ grade: '4th' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.grade).toBe('4th');
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should deactivate student', async () => {
      const student = await Student.create({
        name: 'Delete Student',
        studentId: 'STU-DEL',
        grade: '3rd',
        school: 'Test School',
        parent: parentUser._id
      });

      const res = await request(app)
        .delete(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);

      const updatedStudent = await Student.findById(student._id);
      expect(updatedStudent.isActive).toBe(false);
    });
  });
});
