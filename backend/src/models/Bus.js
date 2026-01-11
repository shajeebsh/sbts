const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Please provide a bus number'],
    unique: true,
    trim: true
  },
  licensePlate: {
    type: String,
    required: [true, 'Please provide a license plate'],
    unique: true,
    uppercase: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide bus capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'en-route', 'stopped'],
    default: 'inactive'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  speed: {
    type: Number,
    default: 0
  },
  heading: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

busSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Bus', busSchema);
