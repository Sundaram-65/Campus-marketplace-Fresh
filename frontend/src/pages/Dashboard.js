import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SellForm from '../components/SellForm';
import ListingsList from '../components/ListingsList';
import MyListings from '../components/MyListings';
import { api } from '../services/api';
import TransactionHistory from '../components/TransactionHistory';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [tab, setTab] = useState('browse');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);

async function fetchHistory() {
  const res = await api.get('/transactions/history');
  setTransactions(res.data.data || []);
}

    useEffect(() => {
        if (tab === 'history') fetchHistory();
      }, [tab]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchListings();
  }, [navigate]);

 async function fetchListings() {
  setLoading(true);
  try {
    const res = await api.get('/listings');
    setListings(res.data.data || []);

    // Use the correct user ID
    const myUser = JSON.parse(localStorage.getItem('user'));
    const sellerId = myUser?._id || myUser?.id;
    if (sellerId) {
      const pendingRes = await api.get(`/listings/pending/${sellerId}`);
      setMyListings(pendingRes.data.data || []);
    }
  } catch (error) {
    console.error('Failed to fetch listings', error);
  }
  setLoading(false);
}



  async function handleAddListing(listingData) {
    try {
      await api.post('/listings', listingData);
      setTab('browse');
      fetchListings();
      alert(' Listing created successfully!');
    } catch (error) {
      alert('' + (error.response?.data?.message || 'Failed to create listing'));
    }
  }

  async function handleInterest(listingId) {
    try {
      await api.post(`/listings/${listingId}/interest`);
      alert(' Interest recorded!');
      fetchListings();
    } catch (error) {
      alert(' Failed to record interest');
    }
  }

  async function handleBuy(listing) {
  // ✅ FIX: Use already logged-in user details, don't ask for name
  try {
    await api.post(`/listings/${listing._id}/request`, {
      buyer: user.name,           // Use logged-in user's name
      contact: user.contact,      // Use logged-in user's contact
      hostel: user.hostel         // Use logged-in user's hostel
    });
    alert(' Purchase request sent! Waiting for seller confirmation.');
    fetchListings();
  } catch (error) {
    alert(' ' + (error.response?.data?.message || 'Failed to send request'));
  }
}


  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  if (!user) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg p-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V8M10.5 1.5v6h6M10.5 1.5L16.5 7.5" strokeWidth="1.5" stroke="currentColor" fill="none"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Campus Marketplace</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-gray-600 text-sm">Welcome!</p>
              <p className="font-bold text-gray-800">{user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {['browse', 'sell', 'mylistings','history'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 rounded-lg font-bold transition transform ${
                tab === t
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-500'
              }`}
            >
              {t === 'browse' && '🛍️ Browse Items'}
              {t === 'sell' && '📤 Sell Item'}
              {t === 'mylistings' && '📋 My Listings'}
              {t === 'history' && '📖 History'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'sell' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <SellForm onAddListing={handleAddListing} user={user} />
          </div>
        )}

        {tab === 'browse' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading listings...</p>
              </div>
            ) : (
              <ListingsList listings={listings} onInterest={handleInterest} onBuy={handleBuy} />
            )}
          </div>
        )}

        {tab === 'mylistings' && (
          <MyListings listings={myListings} onRefresh={fetchListings} user={user} />
        )}

        {tab === 'history' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <TransactionHistory transactions={transactions} user={user} />
            </div>
          )}

      </div>
    </div>
  );
}
