import React from 'react';
import Header from './components/Header';
import LoginProfile from './components/LoginProfile';
import SellForm from './components/SellForm';
import ListingsList from './components/ListingsList';
import BuyModal from './components/BuyModal';
import UserHistory from './components/UserHistory';
import PendingRequests from './components/PendingRequests';
import { api } from './services/api';

function App() {
  const [user, setUser] = React.useState(null);
  const [listings, setListings] = React.useState([]);
  const [selectedListing, setSelectedListing] = React.useState(null);
  const [showBuyModal, setShowBuyModal] = React.useState(false);
  const [reload, setReload] = React.useState(false);

  // Fetch available listings
  React.useEffect(() => {
    api.get('/listings')
      .then(res => {
        console.log('Listings fetched:', res.data);
        setListings(res.data.data || []);
      })
      .catch(err => {
        console.error('Error fetching listings:', err);
      });
  }, [reload]);

  // User registration/profile
  function handleSetUser(u) {
    api.post('/users/register', u)
      .then(res => {
        console.log('User registered:', res.data.data);
        setUser(res.data.data);
      })
      .catch(err => {
        console.error('Registration error:', err);
        alert('Failed to register user');
      });
  }

  // Add new listing
  function handleAddListing(listing) {
    if (!user || !user._id) {
      alert('Please set your profile first!');
      return;
    }

    const listingData = {
      ...listing,
      sellerName: user.name,
      contact: user.contact,
      hostel: listing.hostel || user.hostel
    };

    api.post('/listings', listingData)
      .then(res => {
        console.log('Listing created:', res.data);
        setReload(r => !r);
      })
      .catch(err => {
        console.error('Error creating listing:', err);
        alert('Failed to create listing');
      });
  }

  // Show interest
  function handleShowInterest(id) {
    api.post(`/listings/${id}/interest`)
      .then(res => {
        console.log('Interest recorded:', res.data);
        setReload(r => !r);
      })
      .catch(err => {
        console.error('Error showing interest:', err);
      });
  }

  // Buy item (request to buy)
  function handleBuy(listing) {
    setSelectedListing(listing);
    setShowBuyModal(true);
  }

  // Confirm buy request
  function handleBuyConfirm(buyerInfo) {
    if (!selectedListing || !selectedListing._id) {
      alert('Invalid listing selected');
      return;
    }

    api.post(`/listings/${selectedListing._id}/request`, buyerInfo)
      .then(res => {
        console.log('Purchase request sent:', res.data);
        alert(res.data.message);
        setShowBuyModal(false);
        setReload(r => !r);
      })
      .catch(err => {
        console.error('Error sending purchase request:', err);
        alert('Failed to send purchase request');
      });
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Header />
      <div className="container mx-auto px-4">
        <LoginProfile user={user} onSetUser={handleSetUser} />
        
        {/* Pending Requests Section (for sellers) */}
        {user && user._id && (
          <PendingRequests 
            sellerId={user._id} 
            onUpdate={() => setReload(r => !r)} 
          />
        )}
        
        {user && <SellForm onAddListing={handleAddListing} user={user} />}
        
        <ListingsList 
          listings={listings} 
          onInterest={handleShowInterest} 
          onBuy={handleBuy} 
        />
        
        <BuyModal 
          show={showBuyModal} 
          listing={selectedListing} 
          onConfirm={handleBuyConfirm} 
          onClose={() => setShowBuyModal(false)} 
        />
        
        {user && user._id && <UserHistory user={user} />}
      </div>
      <footer className="mt-10 text-center text-gray-400 text-xs py-4">
        Made for campus by students. 2025
      </footer>
    </div>
  );
}

export default App;
