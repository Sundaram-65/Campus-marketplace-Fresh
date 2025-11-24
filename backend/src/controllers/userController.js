const User = require('../models/User');
const Transaction = require('../models/Transaction');

/**
 * UserController Class - Handles user operations with Mongoose
 */
class UserController {
  /**
   * Register or get existing user
   * POST /api/users/register
   */
  async registerUser(req, res) {
    try {
      const { name, rollNo, contact, hostel, email } = req.body;

      console.log('📝 Register request:', { name, rollNo, contact, hostel });

      if (!name || !rollNo || !contact || !hostel) {
        return res.status(400).json({
          success: false,
          message: 'Please provide name, roll number, contact, and hostel'
        });
      }

      // Validate roll number format (optional - adjust as needed)
      if (!rollNo || rollNo.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Please provide valid roll number'
        });
      }

      const user = await User.findOrCreate({ name, rollNo, contact, hostel, email });

      console.log('✅ User registered/retrieved:', user._id);

      res.json({
        success: true,
        message: user.isNew ? 'User registered successfully' : 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      console.error('❌ Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message
      });
    }
  }

  /**
   * Get user's transaction history
   * GET /api/users/:id/history
   */
  async getUserHistory(req, res) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const history = await user.getTransactionHistory();

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user history',
        error: error.message
      });
    }
  }

  /**
   * Get user by contact (for frontend login)
   * GET /api/users/contact/:contact
   */
  async getUserByContact(req, res) {
    try {
      const user = await User.findOne({ contact: req.params.contact });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const history = await user.getTransactionHistory();

      res.json({
        success: true,
        data: {
          ...user.toObject(),
          ...history
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
  }

  /**
   * Get all users
   * GET /api/users
   */
  async getAllUsers(req, res) {
    try {
      const users = await User.find().select('-__v');
      
      res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
