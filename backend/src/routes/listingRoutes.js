const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');

// Get marketplace statistics
router.get('/stats', listingController.getStatistics.bind(listingController));

// Get pending requests for a seller
router.get('/pending/:sellerId', listingController.getPendingRequests.bind(listingController));

// Get all available listings
router.get('/', listingController.getAllListings.bind(listingController));

// Get single listing by ID
router.get('/:id', listingController.getListingById.bind(listingController));

// Create new listing
router.post('/', listingController.createListing.bind(listingController));

// Show interest in listing
router.post('/:id/interest', listingController.showInterest.bind(listingController));

// Request to buy (creates pending request)
router.post('/:id/request', listingController.requestToBuy.bind(listingController));

// Seller confirms sale
router.post('/:id/confirm', listingController.confirmSale.bind(listingController));

// Seller rejects sale
router.post('/:id/reject', listingController.rejectSale.bind(listingController));

// Delete listing
router.delete('/:id', listingController.deleteListing.bind(listingController));

module.exports = router;
