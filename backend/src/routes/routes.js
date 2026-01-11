const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const Route = require('../models/Route');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', protect, async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true });
    res.json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', protect, [
  param('id').isMongoId().withMessage('Invalid route ID')
], validate, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Route name is required'),
  body('waypoints').optional().isArray().withMessage('Waypoints must be an array')
], validate, async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid route ID'),
  body('name').optional().trim().notEmpty().withMessage('Route name cannot be empty')
], validate, async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid route ID')
], validate, async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    res.json({ success: true, message: 'Route deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/waypoints', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid route ID'),
  body('name').trim().notEmpty().withMessage('Waypoint name is required'),
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('type').optional().isIn(['pickup', 'dropoff', 'school', 'checkpoint']).withMessage('Invalid waypoint type')
], validate, async (req, res) => {
  try {
    const { name, coordinates, order, type, estimatedArrival } = req.body;

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    route.waypoints.push({
      name,
      location: { type: 'Point', coordinates },
      order,
      type: type || 'pickup',
      estimatedArrival
    });

    route.waypoints.sort((a, b) => a.order - b.order);
    await route.save();

    res.status(201).json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/waypoints/:waypointId', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid route ID'),
  param('waypointId').isMongoId().withMessage('Invalid waypoint ID')
], validate, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    const waypoint = route.waypoints.id(req.params.waypointId);
    if (!waypoint) {
      return res.status(404).json({ success: false, message: 'Waypoint not found' });
    }

    Object.assign(waypoint, req.body);
    if (req.body.coordinates) {
      waypoint.location = { type: 'Point', coordinates: req.body.coordinates };
    }

    route.waypoints.sort((a, b) => a.order - b.order);
    await route.save();

    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id/waypoints/:waypointId', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid route ID'),
  param('waypointId').isMongoId().withMessage('Invalid waypoint ID')
], validate, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    route.waypoints.pull(req.params.waypointId);
    await route.save();

    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
