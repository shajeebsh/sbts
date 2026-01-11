const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const Bus = require('../models/Bus');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', protect, async (req, res) => {
  try {
    const query = { isActive: true };
    if (req.query.status) query.status = req.query.status;

    const buses = await Bus.find(query)
      .populate('driver', 'name email phone')
      .populate('route', 'name');

    res.json({
      success: true,
      count: buses.length,
      data: buses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', protect, [
  param('id').isMongoId().withMessage('Invalid bus ID')
], validate, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('driver', 'name email phone')
      .populate('route');

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    res.json({ success: true, data: bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, authorize('admin'), [
  body('busNumber').trim().notEmpty().withMessage('Bus number is required'),
  body('licensePlate').trim().notEmpty().withMessage('License plate is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1')
], validate, async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ success: true, data: bus });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Bus number or license plate already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid bus ID'),
  body('busNumber').optional().trim().notEmpty().withMessage('Bus number cannot be empty'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1')
], validate, async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    res.json({ success: true, data: bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid bus ID')
], validate, async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    res.json({ success: true, message: 'Bus deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/location', protect, authorize('admin', 'driver'), [
  param('id').isMongoId().withMessage('Invalid bus ID'),
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('coordinates.*').isFloat().withMessage('Coordinates must be numbers')
], validate, async (req, res) => {
  try {
    const { coordinates, speed, heading } = req.body;

    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: { type: 'Point', coordinates },
        speed: speed || 0,
        heading: heading || 0,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    res.json({ success: true, data: bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/assign-driver', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid bus ID'),
  body('driverId').isMongoId().withMessage('Invalid driver ID')
], validate, async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { driver: req.body.driverId },
      { new: true }
    ).populate('driver', 'name email phone');

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    res.json({ success: true, data: bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/assign-route', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid bus ID'),
  body('routeId').isMongoId().withMessage('Invalid route ID')
], validate, async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { route: req.body.routeId },
      { new: true }
    ).populate('route', 'name');

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    res.json({ success: true, data: bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
