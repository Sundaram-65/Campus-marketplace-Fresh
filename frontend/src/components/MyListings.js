import React from 'react';
import { api } from '../services/api';

export default function MyListings({ listings, onRefresh, user }) {
  async function handleAccept(listingId) {
    try {
      await api.post(`/listings/${listingId}/confirm`);
      alert('✅ Sale confirmed! Item marked as sold.');
      onRefresh();
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to confirm'));
    }
  }

  async function handleReject(listingId) {
    try {
      await api.post(`/listings/${listingId}/reject`);
      alert('✅ Request rejected. Item is now available again.');
      onRefresh();
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to reject'));
    }
  }
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">📋 Pending Purchase Requests</h2>
      {listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-6xl mb-4">📝</p>
          <p className="text-xl font-bold text-gray-800">No pending requests</p>
          <p className="text-gray-600 mt-2">Your items will appear here when buyers request to purchase</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {listings.map(listing => (
            <div key={listing._id} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">{listing.title}</h3>
                  <p className="text-gray-600 text-lg font-semibold">₹{listing.price}</p>
                </div>
                <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold whitespace-nowrap">
                  ⏳ Pending
                </span>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 mb-5 border border-blue-200">
                <p className="text-xs text-gray-600 uppercase tracking-wide font-bold mb-3">📥 Buyer Details</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Name</p>
                    <p className="font-bold text-gray-800">{listing.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Contact</p>
                    <p className="font-bold text-gray-800">{listing.buyerContact}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Hostel</p>
                    <p className="font-bold text-gray-800">{listing.buyerHostel}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-5">
                <p className="text-xs text-gray-600 mb-1">Request Date</p>
                <p className="text-sm text-gray-800">{new Date(listing.requestedAt).toLocaleString()}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAccept(listing._id)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-md"
                >
                  ✅ Accept & Confirm Sale
                </button>
                <button
                  onClick={() => handleReject(listing._id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-md"
                >
                  ❌ Reject Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
