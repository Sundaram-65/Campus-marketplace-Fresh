const mongoose = require('mongoose');

/**
 * User Schema - Mongoose Model for campus users
 * Demonstrates OOP: Schema definition, methods, virtuals
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  rollNo: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true
    // required: [true, 'Please provide roll number']   // <--- REMOVED required!
  },
  contact: {
    type: String,
    required: [true, 'Please provide contact number'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Please provide valid 10-digit contact number']
  },
  hostel: {
    type: String,
    required: [true, 'Please provide hostel information']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide valid email']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for items sold and bought
userSchema.virtual('itemsSold', {
  ref: 'Listing',
  localField: '_id',
  foreignField: 'seller'
});
userSchema.virtual('itemsBought', {
  ref: 'Listing',
  localField: '_id',
  foreignField: 'buyer'
});

// Transaction history
userSchema.methods.getTransactionHistory = async function() {
  await this.populate('itemsSold');
  await this.populate('itemsBought');
  return {
    name: this.name,
    rollNo: this.rollNo,
    contact: this.contact,
    hostel: this.hostel,
    sold: this.itemsSold || [],
    bought: this.itemsBought || [],
    totalSoldValue: this.itemsSold?.reduce((sum, item) => sum + item.price, 0) || 0,
    totalBoughtValue: this.itemsBought?.reduce((sum, item) => sum + item.price, 0) || 0
  };
};

/**
 * Static Method: Find or create user (does NOT require rollNo for buyers)
 */
userSchema.statics.findOrCreate = async function(userData) {
  try {
    let query = {};
    if (userData.rollNo) {
      query.rollNo = userData.rollNo;
    } else if (userData.contact) {
      query.contact = userData.contact;
    }
    let user = await this.findOne(query);

    if (!user) {
      try {
        user = await this.create(userData);
        console.log('✅ New user created:', user.name);
      } catch (createError) {
        if (createError.code === 11000) {
          user = await this.findOne(query);
          if (!user) throw createError;
          console.log('✅ User found after duplicate error:', user.name);
        } else {
          throw createError;
        }
      }
    } else {
      // Update non-null values
      if (userData.name) user.name = userData.name;
      if (userData.hostel) user.hostel = userData.hostel;
      if (userData.email) user.email = userData.email;
      if (userData.rollNo && !user.rollNo) user.rollNo = userData.rollNo;
      await user.save();
      console.log('✅ Existing user updated:', user.name);
    }

    return user;
  } catch (error) {
    console.error('❌ Error in findOrCreate:', error);
    throw error;
  }
};

userSchema.pre('save', function(next) {
  next();
});

module.exports = mongoose.model('User', userSchema);
