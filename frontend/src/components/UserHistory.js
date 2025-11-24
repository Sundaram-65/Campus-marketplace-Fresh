import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function UserHistory({ user }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user._id) {
      setLoading(true);
      setError(null);
      
      api.get(`/users/${user._id}/history`)
        .then(res => {
          console.log('History fetched:', res.data);
          setHistory(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('History error:', err);
          setError('Failed to load transaction history');
          setLoading(false);
        });
    }
  }, [user]);

  if (!user || !user._id) return null;
  
  if (loading) {
    return (
      <div className="card p-6 bg-white rounded-xl mt-8 max-w-2xl mx-auto">
        <p className="text-gray-500">Loading transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 bg-white rounded-xl mt-8 max-w-2xl mx-auto">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!history) return null;

  return (
    <div className="card p-6 bg-white rounded-xl shadow-lg mt-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-secondary">Your Transaction History</h2>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-semibold">{history.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Hostel</p>
            <p className="font-semibold">{history.hostel}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Contact</p>
            <p className="font-semibold">{history.contact}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Value Sold</p>
            <p className="font-semibold text-green-600">₹{history.totalSoldValue || 0}</p>
          </div>
        </div>
      </div>

      {/* Items Sold Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
          <span className="mr-2">📤</span>
          Items Sold ({history.sold?.length || 0})
        </h3>
        {history.sold && history.sold.length > 0 ? (
          <ul className="space-y-2">
            {history.sold.map((item) => (
              <li 
                key={item._id} 
                className="p-3 bg-green-50 border-l-4 border-green-500 rounded"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      Condition: {item.condition} | Price: ₹{item.price}
                    </p>
                    {item.soldAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Sold on: {new Date(item.soldAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className="text-green-600 font-bold">+₹{item.price}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic p-3 bg-gray-50 rounded">
            No items sold yet. Post your first listing!
          </p>
        )}
      </div>

      {/* Items Bought Section */}
      <div>
        <h3 className="text-lg font-semibold text-secondary mb-3 flex items-center">
          <span className="mr-2">📥</span>
          Items Bought ({history.bought?.length || 0})
        </h3>
        {history.bought && history.bought.length > 0 ? (
          <ul className="space-y-2">
            {history.bought.map((item) => (
              <li 
                key={item._id} 
                className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      Condition: {item.condition} | Seller: {item.sellerName}
                    </p>
                    {item.soldAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Purchased on: {new Date(item.soldAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className="text-blue-600 font-bold">-₹{item.price}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic p-3 bg-gray-50 rounded">
            No purchases yet. Browse available items!
          </p>
        )}
      </div>

      {/* Summary */}
      {(history.sold?.length > 0 || history.bought?.length > 0) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{history.totalSoldValue || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{history.totalBoughtValue || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
