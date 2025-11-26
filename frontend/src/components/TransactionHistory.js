import React from 'react';

export default function TransactionHistory({ transactions, user }) {
  if (!transactions || !transactions.length) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow">
        <p className="text-6xl mb-4">📖</p>
        <p className="text-xl font-bold text-gray-800">No completed transactions</p>
        <p className="text-gray-600 mt-2">Completed purchases and sales will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">📖 Transaction History</h2>
      <div className="grid gap-5">
        {transactions.map(tx => (
          <div key={tx._id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-blue-700 mb-2">{tx.listing.title}</h3>
              <div>
                <span className="font-bold text-gray-700">₹{tx.price}</span>
                <span className="mx-2">|</span>
                <span className="text-xs text-gray-500">on {new Date(tx.createdAt).toLocaleString()}</span>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                As {String(tx.seller._id) === user.id ? 'Seller' : 'Buyer'}
              </div>
              <div className="text-gray-500 text-xs">ID: {tx._id}</div>
            </div>
            <div className="flex flex-col gap-1 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Seller:</span> {tx.seller.name} ({tx.seller.contact})
              </div>
              <div>
                <span className="font-semibold">Buyer:</span> {tx.buyer.name} ({tx.buyer.contact})
              </div>
              <div>
                <span className="font-semibold">Hostel:</span> {tx.buyer.hostel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
