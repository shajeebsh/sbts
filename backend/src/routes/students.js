const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', protect, async (req, res) => {
  try {
    let query = { isActive: true };

    if (req.user.role === 'parent') {
      query.parent = req.user.id;
    }

    const students = await Student.find(query)
      .populate('parent', 'name email phone')
      .populate('bus', 'busNumber status currentLocation')
      .populate('route', 'name');

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', protect, [
  param('id').isMongoId().withMessage('Invalid student ID')
], validate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('parent', 'name email phone')
      .populate('bus', 'busNumber status currentLocation')
      .populate('route');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (req.user.role === 'parent' && student.parent._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this student' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Student name is required'),
  body('studentId').trim().notEmpty().withMessage('Student ID is required'),
  body('grade').trim().notEmpty().withMessage('Grade is required'),
  body('school').trim().notEmpty().withMessage('School is required'),
  body('parent').isMongoId().withMessage('Valid parent ID is required')
], validate, async (req, res) => {
  try {
    const student = await Student.create(req.body);

    await User.findByIdAndUpdate(req.body.parent, {
      $addToSet: { students: student._id }
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('parent', 'name email phone');

    res.status(201).json({ success: true, data: populatedStudent });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Student ID already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid student ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('grade').optional().trim().notEmpty().withMessage('Grade cannot be empty')
], validate, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('parent', 'name email phone')
      .populate('bus', 'busNumber')
      .populate('route', 'name');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid student ID')
], validate, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Student deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/assign-bus', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid student ID'),
  body('busId').isMongoId().withMessage('Valid bus ID is required')
], validate, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { bus: req.body.busId },
      { new: true }
    ).populate('bus', 'busNumber status');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/assign-route', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid student ID'),
  body('routeId').isMongoId().withMessage('Valid route ID is required')
], validate, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { route: req.body.routeId },
      { new: true }
    ).populate('route', 'name');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
