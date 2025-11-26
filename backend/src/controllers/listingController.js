const Listing = require('../models/Listing');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class ListingController {
  async getAllListings(req, res) {
    try {
      const listings = await Listing.find({ status: 'available' })
        .populate('seller', 'name contact hostel')
        .sort('-createdAt');
      res.json({
        success: true,
        count: listings.length,
        data: listings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching listings',
        error: error.message
      });
    }
  }

  async getPendingRequests(req, res) {
    try {
      const { sellerId } = req.params;
      const pending = await Listing.getPendingForSeller(sellerId);
      console.log(pending);
      console.log("hii");
      console.log(sellerId);

      res.json({
        success: true,
        count: pending.length,
        data: pending
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching pending requests',
        error: error.message
      });
    }
  }

  async getListingById(req, res) {
    try {
      const listing = await Listing.findById(req.params.id)
        .populate('seller', 'name contact hostel rollNo')
        .populate('buyer', 'name contact hostel rollNo');

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found'
        });
      }

      res.json({
        success: true,
        data: listing
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching listing',
        error: error.message
      });
    }
  }

  async createListing(req, res) {
    try {
      const { title, description, condition, price, contact, hostel, sellerName, images, rollNo } = req.body;

      if (!images || images.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one image is required' });
      }
      if (images.length > 2) {
        return res.status(400).json({ success: false, message: 'Maximum 2 images allowed' });
      }
      if (!/^[0-9]{10}$/.test(contact)) {
        return res.status(400).json({ success: false, message: 'Contact number must be exactly 10 digits' });
      }
      if (!rollNo) {
        return res.status(400).json({ success: false, message: 'Roll number is required.' });
      }

      const seller = await User.findOrCreate({
        name: sellerName,
        rollNo: rollNo,
        contact: contact,
        hostel: hostel
      });

      const listing = await Listing.create({
        title,
        description,
        condition,
        price,
        contact,
        hostel,
        images,
        seller: seller._id,
        sellerName: seller.name
      });
      await listing.populate('seller', 'name contact hostel rollNo');

      res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        data: listing
      });
    } catch (error) {
      console.error('❌ Error creating listing:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error creating listing'
      });
    }
  }

  async showInterest(req, res) {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }
      if (listing.status !== 'available') {
        return res.status(400).json({ success: false, message: 'This item is no longer available' });
      }
      const interestedCount = await listing.showInterest();

      res.json({
        success: true,
        message: 'Interest recorded successfully',
        interested: interestedCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error recording interest',
        error: error.message
      });
    }
  }

  async requestToBuy(req, res) {
  try {
    const { buyer, contact, hostel } = req.body;
    if (!buyer || !contact || !hostel) {
      return res.status(400).json({ success: false, message: 'Please provide all details' });
    }
    if (!/^[0-9]{10}$/.test(contact)) {
      return res.status(400).json({ success: false, message: 'Contact number must be exactly 10 digits' });
    }

    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name contact hostel email');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    
    // ✅ FIX: Check if listing is already pending or sold
    if (listing.status !== 'available') {
      return res.status(400).json({ 
        success: false, 
        message: 'This item is not available (already sold or has pending request)' 
      });
    }

    let buyerUser = await User.findOrCreate({
      name: buyer,
      contact: contact,
      hostel: hostel
    });

    // ✅ FIX: Change status to 'pending' - item is now temporarily unavailable for other buyers
    await listing.requestToBuy(buyerUser._id, buyer, contact, hostel);

    // Send email to seller
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: listing.seller.email || 'seller@example.com',
        subject: `📦 New Purchase Request for "${listing.title}"`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #007bff;">You have a new purchase request!</h2>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>📌 Item:</strong> ${listing.title}</p>
              <p><strong>💰 Price:</strong> ₹${listing.price}</p>
              <p><strong>👤 Buyer:</strong> ${buyer}</p>
              <p><strong>📞 Contact:</strong> ${contact}</p>
              <p><strong>🏠 Hostel:</strong> ${hostel}</p>
            </div>
            <p><strong>⏳ Status:</strong> Waiting for your confirmation</p>
            <p>Please login to <strong>accept</strong> or <strong>reject</strong> this request.</p>
            <p style="color: #999; font-size: 12px;">© 2025 Campus Marketplace</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent to seller:', listing.seller.email);
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Purchase request sent to seller! Waiting for confirmation.',
      data: listing
    });
  } catch (error) {
    console.error('❌ Error in requestToBuy:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending purchase request',
      error: error.message
    });
  }
}


 async confirmSale(req, res) {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'email')
      .populate('buyer', 'email');
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // ✅ FIX: Verify listing is in pending state
    if (listing.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only confirm pending requests'
      });
    }

    // ✅ FIX: Now change status to 'sold' ONLY when seller confirms
    await listing.confirmSale();

    // Create transaction record
    await Transaction.create({
      listing: listing._id,
      seller: listing.seller,
      buyer: listing.buyer,
      price: listing.price
    });

    // Send confirmation email to buyer
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: listing.buyer.email || 'buyer@example.com',
        subject: `✅ Purchase Confirmed for "${listing.title}"`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #28a745;">🎉 Purchase Confirmed!</h2>
            <p>Your purchase request for <strong>${listing.title}</strong> has been accepted by the seller.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>📌 Item:</strong> ${listing.title}</p>
              <p><strong>💰 Amount:</strong> ₹${listing.price}</p>
              <p><strong>👤 Seller:</strong> ${listing.sellerName}</p>
              <p><strong>📞 Contact:</strong> ${listing.contact}</p>
            </div>
            <p>Contact the seller to finalize the transaction.</p>
            <p style="color: #999; font-size: 12px;">© 2025 Campus Marketplace</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('⚠️ Confirmation email failed:', emailError);
    }

    res.json({
      success: true,
      message: '✅ Sale confirmed successfully!',
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error confirming sale'
    });
  }
}


 async rejectSale(req, res) {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('buyer', 'email');
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // ✅ FIX: Verify listing is in pending state
    if (listing.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject pending requests'
      });
    }

    // ✅ FIX: Revert to 'available' when seller rejects
    await listing.rejectSale();

    // Send rejection email to buyer
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: listing.buyer.email || 'buyer@example.com',
        subject: `Request Declined for "${listing.title}"`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #dc3545;">Request Declined</h2>
            <p>Unfortunately, your purchase request for <strong>${listing.title}</strong> has been declined by the seller.</p>
            <p>The item is now available for other buyers. You can try again or browse other items on Campus Marketplace.</p>
            <p style="color: #999; font-size: 12px;">© 2025 Campus Marketplace</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('⚠️ Rejection email failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Purchase request rejected. Item is now available again.',
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error rejecting sale'
    });
  }
}


  async getStatistics(req, res) {
    try {
      const stats = await Listing.getStats();
      const totalUsers = await User.countDocuments();

      res.json({
        success: true,
        data: {
          ...stats,
          totalUsers
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }

  async deleteListing(req, res) {
    try {
      const listing = await Listing.findByIdAndDelete(req.params.id);
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found'
        });
      }
      res.json({
        success: true,
        message: 'Listing deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting listing',
        error: error.message
      });
    }
  }
}

module.exports = new ListingController();
