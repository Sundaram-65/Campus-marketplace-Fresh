const Listing = require('../models/Listing');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

class ListingController {
  /**
   * Get all available listings (NOT pending or sold)
   */
  async getAllListings(req, res) {
    try {
      const listings = await Listing.getAvailable();
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

  /**
   * Get pending requests for seller
   * GET /api/listings/pending/:sellerId
   */
  async getPendingRequests(req, res) {
    try {
      const { sellerId } = req.params;
      const pending = await Listing.getPendingForSeller(sellerId);
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

  /**
   * Create a new listing
   * POST /api/listings
   */
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
      // Important: Pass rollNo when creating a user!
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

  /**
   * Request to buy (creates pending request for seller)
   * POST /api/listings/:id/request
   */
  async requestToBuy(req, res) {
    try {
      const { buyer, contact, hostel } = req.body;
      if (!buyer || !contact || !hostel) {
        return res.status(400).json({ success: false, message: 'Please provide buyer name, contact, and hostel' });
      }
      if (!/^[0-9]{10}$/.test(contact)) {
        return res.status(400).json({ success: false, message: 'Contact number must be exactly 10 digits' });
      }
      const listing = await Listing.findById(req.params.id)
        .populate('seller', 'name contact hostel');
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }
      if (listing.status !== 'available') {
        return res.status(400).json({ success: false, message: 'This item is not available' });
      }
      let buyerUser = await User.findOrCreate({
        name: buyer,
        contact: contact,
        hostel: hostel
      });
      await listing.requestToBuy(buyerUser._id, buyer, contact, hostel);

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

  /**
   * Seller confirms sale
   * POST /api/listings/:id/confirm
   */
  async confirmSale(req, res) {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found'
        });
      }
      await listing.confirmSale();

      // Create transaction record
      await Transaction.create({
        listing: listing._id,
        seller: listing.seller,
        buyer: listing.buyer,
        price: listing.price
      });

      res.json({
        success: true,
        message: 'Sale confirmed successfully!',
        data: listing
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error confirming sale',
        error: error.message
      });
    }
  }

  /**
   * Seller rejects sale
   * POST /api/listings/:id/reject
   */
  async rejectSale(req, res) {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found'
        });
      }
      await listing.rejectSale();

      res.json({
        success: true,
        message: 'Purchase request rejected',
        data: listing
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error rejecting sale',
        error: error.message
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
