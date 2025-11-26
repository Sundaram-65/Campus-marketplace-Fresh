import React from 'react';

function ListingCard({ listing, onInterest, onBuy }) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const images = listing.images || [];
  const hasMultipleImages = images.length > 1;

  const mainImage = images.length > 0
    ? (images[currentImageIndex].startsWith('/uploads/')
        ? `http://localhost:5000${images[currentImageIndex]}`
        : images[currentImageIndex])
    : 'https://via.placeholder.com/300x300?text=No+Image';

  function nextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }

  function prevImage() {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden hover:transform hover:scale-105 duration-300">
      {/* Image Section */}
      <div className="relative h-64 bg-gray-200 overflow-hidden group">
        <img
          src={mainImage}
          alt={listing.title}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            ● Available
          </span>
        </div>

        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 opacity-0 group-hover:opacity-100 transition"
            >
              ❮
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 opacity-0 group-hover:opacity-100 transition"
            >
              ❯
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{listing.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-gray-500">Condition</p>
              <p className="font-bold text-gray-800">{listing.condition}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <div>
              <p className="text-gray-500">Hostel</p>
              <p className="font-bold text-gray-800">{listing.hostel}</p>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500">Seller</p>
          <p className="font-bold text-gray-800">{listing.sellerName}</p>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold text-blue-600">₹{listing.price}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onInterest(listing._id)}
              className="bg-blue-100 text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-blue-200 transition"
            >
              🙋 {listing.interested || 0}
            </button>
            <button
              onClick={() => onBuy(listing)}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:shadow-lg transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsList({ listings, onInterest, onBuy }) {
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow">
        <p className="text-6xl mb-4">📦</p>
        <p className="text-2xl font-bold text-gray-800 mb-2">No items available</p>
        <p className="text-gray-600">Be the first to post something!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        🛍️ Available Items ({listings.length})
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(listing => (
          <ListingCard
            key={listing._id}
            listing={listing}
            onInterest={onInterest}
            onBuy={onBuy}
          />
        ))}
      </div>
    </div>
  );
}
