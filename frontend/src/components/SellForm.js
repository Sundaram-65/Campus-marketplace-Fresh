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

  // Keep hostel updated when user changes
  React.useEffect(() => {
    if (user?.hostel) setForm(f => ({ ...f, hostel: user.hostel }));
  }, [user]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleImageChange(e) {
    // Allow max 2 images
    const files = Array.from(e.target.files).slice(0, 2);
    setImages(files);

    // Show local previews
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
      alert('Please set your profile with Roll Number first!');
      return;
    }

    setUploading(true);
    try {
      // First upload images to backend
      const formData = new FormData();
      images.forEach(image => formData.append('images', image));
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrls = uploadRes.data.data; // Should be ["/uploads/....jpg"]

      // Now create listing with images array
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
      alert('Listing created successfully!');
    } catch (error) {
      alert('Failed to create listing: ' + (error.response?.data?.message || error.message));
    }
    setUploading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 bg-white rounded-lg mb-8 max-w-xl mx-auto flex flex-col gap-3 shadow">
      <div className="text-lg text-primary font-bold mb-1">Sell an Item</div>
      <input
        name="title"
        placeholder="Item Name"
        className="form-control w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        value={form.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        className="form-control w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        rows="3"
        value={form.description}
        onChange={handleChange}
        required
      />
      <select
        name="condition"
        className="form-control w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        value={form.condition}
        onChange={handleChange}
        required
      >
        <option>Excellent</option>
        <option>Good</option>
        <option>Fair</option>
      </select>
      <input
        name="price"
        type="number"
        placeholder="Price (₹)"
        className="form-control w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        value={form.price}
        onChange={handleChange}
        required
        min="1"
      />
      <input
        name="hostel"
        placeholder="Hostel"
        className="form-control w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        value={form.hostel}
        onChange={handleChange}
        required
      />

      {/* Image Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images (Required - Max 2) *
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          disabled={images.length >= 2 || uploading}
        />
        <p className="text-xs text-gray-500 mt-1">
          {images.length}/2 images selected {images.length === 0 && <span className="text-red-500"> (Required)</span>}
        </p>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="flex gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                disabled={uploading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className="btn bg-primary text-white px-3 py-2 rounded hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={uploading || images.length === 0}
      >
        {uploading ? 'Posting...' : 'Post Item'}
      </button>
    </form>
  );
}
