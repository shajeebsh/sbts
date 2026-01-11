const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
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
  speed: {
    type: Number,
    default: 0
  },
  heading: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  accuracy: {
    type: Number
  }
}, {
  timestamps: true
});

locationSchema.index({ bus: 1, timestamp: -1 });
locationSchema.index({ location: '2dsphere' });
locationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Location', locationSchema);
