# School Bus Tracking System (SBTS)

A full-stack web application for real-time school bus tracking with administrative dashboard and parent interface.

## Features

### Admin Panel
- **Bus Management**: CRUD operations for buses with driver and route assignments
- **Route Management**: Create routes with multiple waypoints, visualize on interactive map
- **Driver Management**: Manage driver accounts and bus assignments
- **Student Management**: Enroll students, assign to buses and routes
- **Live Dashboard**: Real-time overview of all bus locations and statuses

### Parent Interface
- **Live Tracking**: View your child's bus location on an interactive map
- **Status Updates**: Real-time bus status (active, en-route, stopped)
- **ETA Information**: Estimated arrival times at pickup points
- **Student Info**: View enrolled students and their bus assignments

### Technical Features
- **Real-time Updates**: WebSocket (Socket.io) for live location streaming
- **JWT Authentication**: Secure role-based access control
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **GPS Simulation**: Built-in simulator for testing and demos

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- Socket.io for real-time communication
- JWT for authentication
- Jest for testing

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Leaflet for maps
- Socket.io-client
- React Testing Library

## Project Structure

```
sbts/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Seed data, GPS simulator
│   └── tests/              # Jest API tests
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/     # React components
│       │   ├── admin/      # Admin forms
│       │   ├── common/     # Shared components
│       │   └── map/        # Map components
│       ├── context/        # React context
│       ├── hooks/          # Custom hooks
│       ├── pages/          # Page components
│       └── services/       # API and socket services
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- MongoDB 5+ (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your settings:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sbts
JWT_SECRET=your-secure-secret-key-change-this
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Seed the database with sample data:
```bash
npm run seed
```

7. Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Demo Credentials

After running the seed script, use these accounts:

| Role   | Email              | Password   |
|--------|-------------------|------------|
| Admin  | admin@sbts.com    | admin123   |
| Driver | driver1@sbts.com  | driver123  |
| Parent | parent1@sbts.com  | parent123  |

## Running the GPS Simulator

To simulate bus movement for demo purposes:

```bash
cd backend
npm run simulate
```

This will move buses along their assigned routes, sending real-time updates to connected clients.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update current user

### Buses (Admin only for mutations)
- `GET /api/buses` - List all buses
- `GET /api/buses/:id` - Get bus details
- `POST /api/buses` - Create bus
- `PUT /api/buses/:id` - Update bus
- `DELETE /api/buses/:id` - Deactivate bus
- `PUT /api/buses/:id/location` - Update bus location
- `PUT /api/buses/:id/assign-driver` - Assign driver
- `PUT /api/buses/:id/assign-route` - Assign route

### Routes (Admin only)
- `GET /api/routes` - List all routes
- `GET /api/routes/:id` - Get route details
- `POST /api/routes` - Create route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Deactivate route
- `POST /api/routes/:id/waypoints` - Add waypoint
- `PUT /api/routes/:id/waypoints/:waypointId` - Update waypoint
- `DELETE /api/routes/:id/waypoints/:waypointId` - Delete waypoint

### Drivers (Admin only)
- `GET /api/drivers` - List all drivers
- `GET /api/drivers/:id` - Get driver details
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Deactivate driver

### Students
- `GET /api/students` - List students (parents see only their own)
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student (Admin)
- `PUT /api/students/:id` - Update student (Admin)
- `DELETE /api/students/:id` - Deactivate student (Admin)

## WebSocket Events

### Client to Server
- `subscribe:bus` - Subscribe to specific bus updates
- `unsubscribe:bus` - Unsubscribe from bus updates
- `subscribe:all-buses` - Subscribe to all bus updates
- `update:location` - Update bus location (driver/admin)
- `update:status` - Update bus status (driver/admin)

### Server to Client
- `bus:location` - Bus location update
- `bus:status` - Bus status change
- `error` - Error message

## Running Tests

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Security Considerations

- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- Role-based access control (admin, driver, parent)
- Input validation on all endpoints
- CORS configured for frontend origin

## Production Deployment

### Environment Variables (Backend)
```
NODE_ENV=production
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=<your-frontend-domain>
```

### Environment Variables (Frontend)
```
REACT_APP_API_URL=<your-backend-api-url>
REACT_APP_SOCKET_URL=<your-backend-socket-url>
```

### Build Frontend
```bash
cd frontend
npm run build
```

## License

MIT License

## Support

For issues and feature requests, please create an issue in the repository.
