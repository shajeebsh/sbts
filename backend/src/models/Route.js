const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  order: {
    type: Number,
    required: true
  },
  estimatedArrival: {
    type: String
  },
  type: {
    type: String,
    enum: ['pickup', 'dropoff', 'school', 'checkpoint'],
    default: 'pickup'
  }
}, { _id: true });

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a route name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  waypoints: [waypointSchema],
  startPoint: {
    name: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  endPoint: {
    name: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  distance: {
    type: Number,
    default: 0
  },
  estimatedDuration: {
    type: Number,
    default: 0
  },
  schedule: {
    morningDeparture: String,
    afternoonDeparture: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

routeSchema.index({ 'waypoints.location': '2dsphere' });

module.exports = mongoose.model('Route', routeSchema);
