const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const Bus = require('../models/Bus');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver', isActive: true })
      .select('-password');

    const driversWithBuses = await Promise.all(
      drivers.map(async (driver) => {
        const bus = await Bus.findOne({ driver: driver._id, isActive: true })
          .select('busNumber licensePlate status');
        return {
          ...driver.toObject(),
          assignedBus: bus
        };
      })
    );

    res.json({
      success: true,
      count: driversWithBuses.length,
      data: driversWithBuses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid driver ID')
], validate, async (req, res) => {
  try {
    const driver = await User.findOne({ _id: req.params.id, role: 'driver' })
      .select('-password');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const bus = await Bus.findOne({ driver: driver._id, isActive: true })
      .populate('route', 'name');

    res.json({
      success: true,
      data: {
        ...driver.toObject(),
        assignedBus: bus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().matches(/^[0-9]{10,15}$/).withMessage('Invalid phone number')
], validate, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const driver = await User.create({
      name,
      email,
      password,
      phone,
      role: 'driver'
    });

    res.status(201).json({
      success: true,
      data: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        role: driver.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid driver ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().matches(/^[0-9]{10,15}$/).withMessage('Invalid phone number')
], validate, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const driver = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'driver' },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid driver ID')
], validate, async (req, res) => {
  try {
    const driver = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'driver' },
      { isActive: false },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    await Bus.updateMany({ driver: req.params.id }, { $unset: { driver: 1 } });

    res.json({ success: true, message: 'Driver deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
