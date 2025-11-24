import React from 'react';

function InterestButton({ count, onClick }) {
  return (
    <button 
      className="px-3 py-1 rounded bg-primary text-white font-medium hover:bg-primary/90 transition focus:outline-none shadow" 
      onClick={onClick}
    >
      🙋 {count} Interested
    </button>
  );
}

function StatusTag({ status }) {
  if (status === 'sold') {
    return <span className="ml-2 text-red-600 font-semibold text-sm">● Sold</span>;
  }
  if (status === 'pending') {
    return <span className="ml-2 text-yellow-600 font-semibold text-sm">⏳ Pending</span>;
  }
  return <span className="ml-2 text-green-600 font-semibold text-sm">● Available</span>;
}

function ListingCard({ listing, onInterest, onBuy }) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  if (!listing || typeof listing !== 'object') {
    return null;
  }

  const images = listing.images || [];
  const hasMultipleImages = images.length > 1;

  // Pick the best source:
  let mainImage = '';
  if (images.length > 0) {
    // If starts with /uploads/, use backend URL; if full remote URL, use as-is
    mainImage =
      images[currentImageIndex].startsWith('/uploads/')
        ? `http://localhost:5000${images[currentImageIndex]}`
        : images[currentImageIndex];
  } else if (listing.image) {
    mainImage = listing.image; // Fallback to old single field
  } else {
    mainImage = 'https://via.placeholder.com/200x200?text=No+Image';
  }

  function nextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }

  function prevImage() {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }

  return (
    <div className="card bg-white shadow-md mb-5 flex gap-6 items-start p-6 rounded-xl hover:shadow-lg transition">
      {/* Image Gallery */}
      <div className="relative w-40 h-40 flex-shrink-0">
        <img
          src={mainImage}
          alt={listing.title}
          className="w-full h-full rounded-lg object-contain border-2 border-primary/20 bg-gray-100"
          onError={e => { e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'; }}
        />
        {hasMultipleImages && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
            >
              ‹
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800">{listing.title}</h3>
          <StatusTag status={listing.status} />
        </div>
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{listing.description}</p>
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
          <div><span className="font-semibold">Condition:</span> {listing.condition}</div>
          <div><span className="font-semibold">Price:</span> <span className="text-primary font-bold text-sm">₹{listing.price}</span></div>
          <div><span className="font-semibold">Hostel:</span> {listing.hostel}</div>
          <div><span className="font-semibold">Seller:</span> {listing.sellerName}</div>
        </div>
        <div className="flex gap-2 items-center mt-4">
          <InterestButton 
            count={listing.interested || 0} 
            onClick={() => onInterest(listing._id)} 
          />
          {listing.status === 'available' && (
            <button 
              className="btn bg-secondary text-white px-4 py-2 rounded hover:bg-secondary/90 transition font-medium" 
              onClick={() => onBuy(listing)}
            >
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListingsList({ listings, onInterest, onBuy }) {
  if (!Array.isArray(listings)) {
    return (
      <main className="max-w-3xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4 text-primary">Items for Sale</h2>
        <div className="text-red-600 p-4 bg-red-50 rounded">
          Error: Invalid listings data.
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-primary">
        Items for Sale ({listings.length})
      </h2>
      {listings.length > 0 ? (
        <div className="space-y-4">
          {listings.map(listing => (
            <ListingCard 
              key={listing._id} 
              listing={listing} 
              onInterest={onInterest} 
              onBuy={onBuy} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <p className="text-gray-600 text-lg mb-2">No items for sale currently</p>
          <p className="text-gray-500 text-sm">Be the first to post a listing!</p>
        </div>
      )}
    </main>
  );
}
