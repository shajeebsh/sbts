const jwt = require('jsonwebtoken');
const Bus = require('../models/Bus');
const Location = require('../models/Location');

const setupSocketHandlers = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.on('subscribe:bus', async (busId) => {
      socket.join(`bus:${busId}`);
      console.log(`User ${socket.userId} subscribed to bus ${busId}`);

      try {
        const bus = await Bus.findById(busId).select('currentLocation status speed heading lastUpdated');
        if (bus) {
          socket.emit('bus:location', {
            busId,
            location: bus.currentLocation,
            status: bus.status,
            speed: bus.speed,
            heading: bus.heading,
            timestamp: bus.lastUpdated
          });
        }
      } catch (error) {
        console.error('Error fetching bus location:', error);
      }
    });

    socket.on('unsubscribe:bus', (busId) => {
      socket.leave(`bus:${busId}`);
      console.log(`User ${socket.userId} unsubscribed from bus ${busId}`);
    });

    socket.on('subscribe:all-buses', () => {
      socket.join('all-buses');
      console.log(`User ${socket.userId} subscribed to all buses`);
    });

    socket.on('unsubscribe:all-buses', () => {
      socket.leave('all-buses');
    });

    socket.on('update:location', async (data) => {
      if (socket.userRole !== 'driver' && socket.userRole !== 'admin') {
        return socket.emit('error', { message: 'Not authorized to update location' });
      }

      try {
        const { busId, coordinates, speed, heading } = data;

        const bus = await Bus.findByIdAndUpdate(
          busId,
          {
            currentLocation: { type: 'Point', coordinates },
            speed: speed || 0,
            heading: heading || 0,
            lastUpdated: new Date(),
            status: 'en-route'
          },
          { new: true }
        );

        if (!bus) {
          return socket.emit('error', { message: 'Bus not found' });
        }

        await Location.create({
          bus: busId,
          location: { type: 'Point', coordinates },
          speed: speed || 0,
          heading: heading || 0
        });

        const locationUpdate = {
          busId,
          location: bus.currentLocation,
          status: bus.status,
          speed: bus.speed,
          heading: bus.heading,
          timestamp: bus.lastUpdated
        };

        io.to(`bus:${busId}`).emit('bus:location', locationUpdate);
        io.to('all-buses').emit('bus:location', locationUpdate);

      } catch (error) {
        console.error('Error updating location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    socket.on('update:status', async (data) => {
      if (socket.userRole !== 'driver' && socket.userRole !== 'admin') {
        return socket.emit('error', { message: 'Not authorized to update status' });
      }

      try {
        const { busId, status } = data;

        const bus = await Bus.findByIdAndUpdate(
          busId,
          { status, lastUpdated: new Date() },
          { new: true }
        );

        if (!bus) {
          return socket.emit('error', { message: 'Bus not found' });
        }

        const statusUpdate = { busId, status, timestamp: bus.lastUpdated };
        io.to(`bus:${busId}`).emit('bus:status', statusUpdate);
        io.to('all-buses').emit('bus:status', statusUpdate);

      } catch (error) {
        console.error('Error updating status:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

module.exports = setupSocketHandlers;
