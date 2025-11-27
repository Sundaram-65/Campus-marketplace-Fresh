const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthController {
  async signup(req, res) {
    try {
      const { name, email, password, contact, hostel, rollNo } = req.body;

      if (!name || !email || !password || !contact || !hostel || !rollNo) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      let user = await User.findOne({ $or: [{ email }, { contact }] });
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email or contact'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        contact,
        hostel,
        rollNo
      });

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          rollNo: user.rollNo,
          hostel: user.hostel,
          contact: user.contact
        }
      });
    } catch (error) {
      console.error(' Signup error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Signup failed'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password required'
        });
      }

      // ✅ FIX: Use .select('+password') to include password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // ✅ FIX: Check if password exists
      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          rollNo: user.rollNo,
          hostel: user.hostel,
          contact: user.contact
        }
      });
    } catch (error) {
      console.error(' Login error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }

  async logout(req, res) {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
}

module.exports = new AuthController();
