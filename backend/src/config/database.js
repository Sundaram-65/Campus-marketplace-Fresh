const mongoose = require('mongoose');

/**
 * Database Configuration Class
 * Demonstrates OOP: Encapsulation of database connection logic
 */
class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB using Mongoose
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      this.connection = await mongoose.connect(process.env.MONGODB_URI, options);
      
      console.log(' MongoDB Connected Successfully');
      console.log(`   Database: ${this.connection.connection.name}`);
      console.log(`   Host: ${this.connection.connection.host}`);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error(' MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('  MongoDB disconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error(' MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }

  /**
   * Get connection status
   * @returns {string} Connection state
   */
  getStatus() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState];
  }
}

module.exports = new Database();
