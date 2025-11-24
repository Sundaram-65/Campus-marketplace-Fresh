require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import database configuration
const database = require('./config/database');

// Import routes
const listingRoutes = require('./routes/listingRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

/**
 * Main Server Application with MongoDB
 * Demonstrates OOP architecture in Node.js/Express with Mongoose
 */
class MarketplaceServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    // Setup middleware and routes
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // CORS
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Serve static files (for uploaded images)
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Campus Marketplace API with MongoDB',
        version: '2.0.0',
        status: 'running',
        database: database.getStatus(),
        endpoints: {
          listings: '/api/listings',
          users: '/api/users',
          upload: '/api/upload'
        }
      });
    });

    // API routes
    this.app.use('/api/listings', listingRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/upload', uploadRoutes);  // ✅ Upload route registered

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error('❌ Error:', err.stack);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Connect to database first
      await database.connect();

      // Start Express server
      this.app.listen(this.port, () => {
        console.log('═══════════════════════════════════════════════════');
        console.log('  Campus Marketplace Backend Server (MongoDB)');
        console.log('═══════════════════════════════════════════════════');
        console.log(`  🚀 Server running on port ${this.port}`);
        console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`  📡 API URL: http://localhost:${this.port}`);
        console.log(`  🗄️  Database: ${database.getStatus()}`);
        console.log('═══════════════════════════════════════════════════');
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start server
const server = new MarketplaceServer();
server.start();

module.exports = MarketplaceServer;
