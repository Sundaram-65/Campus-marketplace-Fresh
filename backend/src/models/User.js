const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  rollNo: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

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

userSchema.statics.findOrCreate = async function(userData) {
  try {
    let query = {};
    if (userData.rollNo) query.rollNo = userData.rollNo;
    else if (userData.contact) query.contact = userData.contact;

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

module.exports = mongoose.model('User', userSchema);
