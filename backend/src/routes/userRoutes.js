const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Register or get user
router.post('/register', userController.registerUser.bind(userController));

// Get all users
router.get('/', userController.getAllUsers.bind(userController));

// Get user by contact (for login)
router.get('/contact/:contact', userController.getUserByContact.bind(userController));

// Get user transaction history by ID
router.get('/:id/history', userController.getUserHistory.bind(userController));

module.exports = router;
