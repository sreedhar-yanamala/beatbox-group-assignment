// ============================================================
// Express Application Setup & Route Registration
// BeatBox Music Room · Group YG-CSE2E-G09
// Part 1: Server and routes
// ============================================================

const express = require('express');
const cors = require('cors');

const instrumentsRouter = require('./routes/instruments');
const musiciansRouter = require('./routes/musicians');
const loansRouter = require('./routes/loans');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route: API Information & Quick Reference
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'BeatBox Music Room API',
    assignment: 'Backend Development Fundamentals - Modules 1 to 3',
    group: 'YG-CSE2E-G09',
    theme: 'Theme 9: Instrument loans',
    twistRule: "Instrument family must be 'String', 'Percussion', or 'Wind'.",
    endpoints: {
      instruments: {
        getAll: 'GET /instruments',
        searchByFamily: 'GET /instruments?family=String',
        searchByName: 'GET /instruments?search=guitar',
        getOne: 'GET /instruments/:id',
        create: 'POST /instruments',
        update: 'PUT /instruments/:id',
        delete: 'DELETE /instruments/:id'
      },
      musicians: {
        getAll: 'GET /musicians',
        getOne: 'GET /musicians/:id',
        create: 'POST /musicians',
        update: 'PUT /musicians/:id',
        delete: 'DELETE /musicians/:id'
      },
      loans: {
        getAllJoined: 'GET /loans (Join endpoint with musician & instrument names)',
        filterByStatus: 'GET /loans?status=active',
        getOne: 'GET /loans/:id',
        create: 'POST /loans',
        update: 'PUT /loans/:id',
        delete: 'DELETE /loans/:id'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount resource routers
app.use('/instruments', instrumentsRouter);
app.use('/musicians', musiciansRouter);
app.use('/loans', loansRouter);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl}. Route not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
