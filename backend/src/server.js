require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import database configuration
const database = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Import middleware
const authenticateToken = require('./middleware/authenticateToken');

/**
 * Main Server Application with MongoDB & JWT
 */
class MarketplaceServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // CORS
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));

    // Body parser
    this.app.use('/api/transactions', transactionRoutes);

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

  setupRoutes() {
    // Health check
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Campus Marketplace API with MongoDB & JWT',
        version: '3.0.0',
        status: 'running',
        endpoints: {
          auth: '/api/auth',
          listings: '/api/listings',
          users: '/api/users',
          upload: '/api/upload'
        }
      });
    });

    // Auth routes (NO JWT required)
    this.app.use('/api/auth', authRoutes);

    // Upload route (NO JWT required for now, but can add)
    this.app.use('/api/upload', uploadRoutes);

    // Protected routes (JWT required)
    this.app.use('/api/listings', authenticateToken, listingRoutes);
    this.app.use('/api/users', authenticateToken, userRoutes);

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });
  }

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

  async start() {
    try {
      await database.connect();
      
      this.app.listen(this.port, () => {
        console.log('═══════════════════════════════════════════════════');
        console.log('  Campus Marketplace Backend (MongoDB & JWT)');
        console.log('═══════════════════════════════════════════════════');
        console.log(`  🚀 Server running on port ${this.port}`);
        console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`  📡 API URL: http://localhost:${this.port}`);
        console.log(`  🗂️  Uploads public at http://localhost:${this.port}/uploads/`);
        console.log('═══════════════════════════════════════════════════');
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

const server = new MarketplaceServer();
server.start();

module.exports = MarketplaceServer;
