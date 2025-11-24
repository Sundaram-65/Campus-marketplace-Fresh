import React from 'react';

export default function BuyModal({ show, listing, onConfirm, onClose }) {
  const [formData, setFormData] = React.useState({ buyer: '', contact: '', hostel: '' });
  const [error, setError] = React.useState('');
  
  React.useEffect(() => { 
    if (show) {
      setFormData({ buyer: '', contact: '', hostel: '' });
      setError('');
    }
  }, [show]);
  
  if (!show || !listing) return null;
  
  function handleChange(e) {
    const { name, value } = e.target;
    
    if (name === 'contact') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData(f => ({ ...f, [name]: numericValue }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
    setError('');
  }
  
  function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.buyer || !formData.contact || !formData.hostel) {
      setError('Please fill all fields');
      return;
    }
    
    if (formData.contact.length !== 10) {
      setError('Contact number must be exactly 10 digits');
      return;
    }
    
    onConfirm(formData);
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <form className="bg-white rounded-lg shadow-xl p-6 flex flex-col gap-4 min-w-[320px] max-w-md w-full" onSubmit={handleSubmit}>
        <div className="border-b pb-3">
          <h3 className="text-lg font-bold text-gray-800">Request to Buy</h3>
          <p className="text-sm text-gray-600 mt-1">Item: <strong>{listing.title}</strong></p>
          <p className="text-primary font-bold mt-1">Price: ₹{listing.price}</p>
          <p className="text-xs text-yellow-700 mt-2 bg-yellow-50 p-2 rounded">
            ⚠️ Your request will be sent to the seller for approval
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input 
            name="buyer"
            placeholder="Enter your full name" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
            value={formData.buyer} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input 
            name="contact" 
            type="tel"
            placeholder="10-digit mobile number" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
            value={formData.contact} 
            onChange={handleChange} 
            required 
            maxLength="10"
            pattern="[0-9]{10}"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.contact.length}/10 digits</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Hostel</label>
          <input 
            name="hostel" 
            placeholder="Hostel name/number" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
            value={formData.hostel} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="flex gap-3 mt-2">
          <button 
            type="submit" 
            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-medium"
          >
            Send Request
          </button>
          <button 
            type="button" 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition" 
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
