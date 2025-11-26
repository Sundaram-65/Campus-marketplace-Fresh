const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');

router.get('/', listingController.getAllListings.bind(listingController));
router.get('/:id', listingController.getListingById.bind(listingController));
router.post('/', listingController.createListing.bind(listingController));
router.post('/:id/interest', listingController.showInterest.bind(listingController));
router.post('/:id/request', listingController.requestToBuy.bind(listingController));
router.post('/:id/confirm', listingController.confirmSale.bind(listingController));
router.post('/:id/reject', listingController.rejectSale.bind(listingController));
router.get('/pending/:sellerId', listingController.getPendingRequests.bind(listingController));
router.delete('/:id', listingController.deleteListing.bind(listingController));

module.exports = router;
