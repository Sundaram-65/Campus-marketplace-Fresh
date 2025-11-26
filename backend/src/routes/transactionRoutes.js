const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const transactionController = require('../controllers/transactionController');

router.get('/history', authenticateToken, transactionController.getUserHistory.bind(transactionController));

module.exports = router;
