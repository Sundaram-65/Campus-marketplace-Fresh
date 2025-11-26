import React from 'react';
import { api } from '../services/api';

export default function SellForm({ onAddListing, user }) {
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    condition: 'Good',
    price: '',
    hostel: user?.hostel || ''
  });
  const [images, setImages] = React.useState([]);
  const [previews, setPreviews] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (user?.hostel) setForm(f => ({ ...f, hostel: user.hostel }));
  }, [user]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files).slice(0, 2);
    setImages(files);
    setPreviews([]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeImage(index) {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
  e.preventDefault();
  if (!form.title || !form.description || !form.price) {
    alert('Please fill all fields');
    return;
  }
  if (images.length === 0) {
    alert('At least one image is required!');
    return;
  }
  if (!user || !user.rollNo) {
    alert('Please complete your profile with Roll Number first!');
    return;
  }

  setUploading(true);
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));
    
    // Upload images with token
    const uploadRes = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}` // ✅ FIX: Add Bearer token
      }
    });
    const imageUrls = uploadRes.data.data;

    // Create listing with token
    await onAddListing({
      ...form,
      images: imageUrls,
      rollNo: user.rollNo,
      sellerName: user.name,
      contact: user.contact
    });

    setForm({ title: '', description: '', condition: 'Good', price: '', hostel: user.hostel });
    setImages([]);
    setPreviews([]);
  } catch (error) {
    alert('Failed: ' + (error.response?.data?.message || error.message));
  }
  setUploading(false);
}


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">📤 Post Your Item</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <input
          name="title"
          placeholder="Item Name"
          className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
          value={form.title}
          onChange={handleChange}
          required
        />
        <select
          name="condition"
          className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
          value={form.condition}
          onChange={handleChange}
        >
          <option>Excellent</option>
          <option>Good</option>
          <option>Fair</option>
        </select>
      </div>

      <textarea
        name="description"
        placeholder="Describe your item..."
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
        rows="4"
        value={form.description}
        onChange={handleChange}
        required
      />

      <div className="grid md:grid-cols-2 gap-6">
        <input
          name="price"
          type="number"
          placeholder="Price (₹)"
          className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          name="hostel"
          placeholder="Hostel"
          className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
          value={form.hostel}
          onChange={handleChange}
          required
        />
      </div>

      {/* Image Upload */}
      <div className="border-3 border-dashed border-blue-300 rounded-lg p-8 text-center hover:bg-blue-50 transition">
        <svg className="w-12 h-12 text-blue-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
        </svg>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Images (Required - Max 2)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          disabled={images.length >= 2 || uploading}
        />
        <p className="text-xs text-gray-500 mt-2">{images.length}/2 images selected</p>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-blue-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                disabled={uploading}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition disabled:opacity-50"
        disabled={uploading || images.length === 0}
      >
        {uploading ? '⏳ Posting...' : '✨ Post Item'}
      </button>
    </form>
  );
}
