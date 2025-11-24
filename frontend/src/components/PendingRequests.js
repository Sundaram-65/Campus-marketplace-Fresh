import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function PendingRequests({ sellerId, onUpdate }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sellerId) {
      fetchPending();
    }
  }, [sellerId]);

  function fetchPending() {
    setLoading(true);
    api.get(`/listings/pending/${sellerId}`)
      .then(res => {
        setPending(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching pending requests:', err);
        setLoading(false);
      });
  }

  function handleConfirm(listingId) {
    if (!window.confirm('Confirm this sale?')) return;
    
    api.post(`/listings/${listingId}/confirm`)
      .then(res => {
        alert(res.data.message);
        fetchPending();
        onUpdate();
      })
      .catch(err => {
        console.error('Error confirming sale:', err);
        alert('Failed to confirm sale');
      });
  }

  function handleReject(listingId) {
    if (!window.confirm('Reject this purchase request?')) return;
    
    api.post(`/listings/${listingId}/reject`)
      .then(res => {
        alert(res.data.message);
        fetchPending();
        onUpdate();
      })
      .catch(err => {
        console.error('Error rejecting sale:', err);
        alert('Failed to reject request');
      });
  }

  if (!sellerId) return null;
  if (loading) return <div className="text-center py-4">Loading pending requests...</div>;
  if (pending.length === 0) return null;

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-yellow-800 flex items-center">
        <span className="mr-2">⏳</span>
        Pending Purchase Requests ({pending.length})
      </h2>
      
      <div className="space-y-4">
        {pending.map(listing => (
          <div key={listing._id} className="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{listing.title}</h3>
                <p className="text-sm text-gray-600">Price: ₹{listing.price}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                PENDING
              </span>
            </div>
            
            <div className="bg-blue-50 p-3 rounded mb-3">
              <p className="text-sm font-semibold text-blue-900 mb-1">Buyer Details:</p>
              <div className="grid grid-cols-3 gap-2 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Name:</span> {listing.buyerName}
                </div>
                <div>
                  <span className="font-medium">Contact:</span> {listing.buyerContact}
                </div>
                <div>
                  <span className="font-medium">Hostel:</span> {listing.buyerHostel}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => handleConfirm(listing._id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                ✅ Confirm Sale
              </button>
              <button 
                onClick={() => handleReject(listing._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
