const mongoose = require('mongoose');

/**
 * Listing Schema - Mongoose Model for items being sold
 * Demonstrates OOP: Schema definition, methods, virtuals
 */
const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide item title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide item description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  condition: {
    type: String,
    required: true,
    enum: ['Excellent', 'Good', 'Fair'],
    default: 'Good'
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: [0, 'Price cannot be negative']
  },
  contact: {
    type: String,
    required: [true, 'Please provide contact number'],
    match: [/^[0-9]{10}$/, 'Please provide valid 10-digit contact number']
  },
  hostel: {
    type: String,
    required: [true, 'Please provide hostel information']
  },
 images: {
  type: [String],
  required: true
},
image: {
  type: String,
  default: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'
},
  interested: {
    type: Number,
    default: 0,
    min: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold', 'cancelled'],
    default: 'available'
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  buyerName: {
    type: String
  },
  buyerContact: {
    type: String
  },
  buyerHostel: {
    type: String
  },
  requestedAt: {
    type: Date
  },
  soldAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Instance Method: Show interest in listing
 */
listingSchema.methods.showInterest = async function() {
  this.interested += 1;
  await this.save();
  return this.interested;
};

/**
 * Instance Method: Request to buy (pending state)
 * @param {ObjectId} buyerId - ID of the buyer
 * @param {String} buyerName - Name of buyer
 * @param {String} buyerContact - Contact of buyer
 * @param {String} buyerHostel - Hostel of buyer
 */
listingSchema.methods.requestToBuy = async function(buyerId, buyerName, buyerContact, buyerHostel) {
  this.status = 'pending';
  this.buyer = buyerId;
  this.buyerName = buyerName;
  this.buyerContact = buyerContact;
  this.buyerHostel = buyerHostel;
  this.requestedAt = new Date();
  await this.save();
  return this;
};

/**
 * Instance Method: Seller confirms sale
 */
listingSchema.methods.confirmSale = async function() {
  if (this.status !== 'pending') {
    throw new Error('Can only confirm pending requests');
  }
  this.status = 'sold';
  this.soldAt = new Date();
  await this.save();
  return this;
};

/**
 * Instance Method: Seller rejects sale
 */
listingSchema.methods.rejectSale = async function() {
  if (this.status !== 'pending') {
    throw new Error('Can only reject pending requests');
  }
  this.status = 'available';
  this.buyer = null;
  this.buyerName = null;
  this.buyerContact = null;
  this.buyerHostel = null;
  this.requestedAt = null;
  await this.save();
  return this;
};

/**
 * Static Method: Get available listings (not pending or sold)
 */
listingSchema.statics.getAvailable = function() {
  return this.find({ status: 'available' })
    .populate('seller', 'name contact hostel')
    .sort('-createdAt');
};

/**
 * Static Method: Get pending requests for a seller
 */
listingSchema.statics.getPendingForSeller = function(sellerId) {
  return this.find({ seller: sellerId, status: 'pending' })
    .populate('buyer', 'name contact hostel')
    .sort('-requestedAt');
};

/**
 * Static Method: Get statistics
 */
listingSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const available = await this.countDocuments({ status: 'available' });
  const pending = await this.countDocuments({ status: 'pending' });
  const sold = await this.countDocuments({ status: 'sold' });
  const totalInterest = await this.aggregate([
    { $group: { _id: null, total: { $sum: '$interested' } } }
  ]);

  return {
    totalListings: total,
    availableListings: available,
    pendingListings: pending,
    soldListings: sold,
    totalInterest: totalInterest[0]?.total || 0
  };
};

/**
 * Pre-save middleware
 */
listingSchema.pre('save', function(next) {
  if (this.status === 'sold' && !this.buyer) {
    next(new Error('Sold items must have a buyer'));
  }
  next();
});

/**
 * Virtual: Time since posted
 */
listingSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
});

module.exports = mongoose.model('Listing', listingSchema);
