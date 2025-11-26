const Transaction = require('../models/Transaction');

class TransactionController {
  // GET /api/transactions/history
  async getUserHistory(req, res) {
    try {
      const userId = req.user.userId;
      const transactions = await Transaction.find({
        $or: [{ buyer: userId }, { seller: userId }]
      })
        .sort('-createdAt')
        .populate('listing')
        .populate('seller', 'name email hostel contact')
        .populate('buyer', 'name email hostel contact');
      res.json({ success: true, data: transactions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
module.exports = new TransactionController();
