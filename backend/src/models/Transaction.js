const mongoose = require('mongoose');

/**
 * Transaction Schema - Log of all buy/sell transactions
 * Demonstrates OOP: Additional model for data tracking
 */
const transactionSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'completed'
  }
}, {
  timestamps: true
});

/**
 * Static Method: Get user's transaction summary
 */
transactionSchema.statics.getUserSummary = async function(userId) {
  const asSeller = await this.find({ seller: userId }).populate('buyer listing');
  const asBuyer = await this.find({ buyer: userId }).populate('seller listing');
  
  return {
    sold: asSeller,
    bought: asBuyer,
    totalEarned: asSeller.reduce((sum, t) => sum + t.price, 0),
    totalSpent: asBuyer.reduce((sum, t) => sum + t.price, 0)
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);
