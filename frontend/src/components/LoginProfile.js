import React from 'react';

export default function LoginProfile({ user, onSetUser }) {
  const [form, setForm] = React.useState({ name: '', rollNo: '', contact: '', hostel: '' });
  const [isEditing, setIsEditing] = React.useState(!user);

  React.useEffect(() => {
    if (user) {
      setForm({ 
        name: user.name || '', 
        rollNo: user.rollNo || '',
        contact: user.contact || '', 
        hostel: user.hostel || '' 
      });
      setIsEditing(false);
    }
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    
    // For roll number, convert to uppercase
    if (name === 'rollNo') {
      setForm(f => ({ ...f, [name]: value.toUpperCase() }));
    } else if (name === 'contact') {
      // Only allow numbers for contact
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setForm(f => ({ ...f, [name]: numericValue }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.rollNo || !form.contact || !form.hostel) {
      alert('Fill all fields');
      return;
    }
    if (form.contact.length !== 10) {
      alert('Contact number must be 10 digits');
      return;
    }
    onSetUser(form);
  }

  if (user && !isEditing) {
    return (
      <div className="max-w-lg mx-auto mb-6 p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-primary">Your Profile</h3>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="space-y-2">
          <div><span className="font-semibold">Name:</span> {user.name}</div>
          <div><span className="font-semibold">Roll No:</span> {user.rollNo}</div>
          <div><span className="font-semibold">Contact:</span> {user.contact}</div>
          <div><span className="font-semibold">Hostel:</span> {user.hostel}</div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 max-w-lg mx-auto mb-6 p-6 bg-white rounded-lg shadow">
      <div className="font-bold text-primary text-lg mb-2">
        {user ? 'Edit Profile' : 'Create Your Profile'}
      </div>
      
      <input 
        name="name" 
        placeholder="Your Name" 
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
        value={form.name} 
        onChange={handleChange} 
        required 
      />
      
      <input 
        name="rollNo" 
        placeholder="Roll Number (e.g., 21BCE1234)" 
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
        value={form.rollNo} 
        onChange={handleChange} 
        required 
      />
      
      <input 
        name="contact" 
        placeholder="Contact No. (10 digits)" 
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
        value={form.contact} 
        onChange={handleChange} 
        required 
        maxLength="10"
        pattern="[0-9]{10}"
      />
      <p className="text-xs text-gray-500 w-full -mt-2">{form.contact.length}/10 digits</p>
      
      <input 
        name="hostel" 
        placeholder="Hostel Name" 
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
        value={form.hostel} 
        onChange={handleChange} 
        required 
      />
      
      <div className="flex gap-3 w-full">
        <button 
          type="submit" 
          className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          {user ? 'Update Profile' : 'Set Profile'}
        </button>
        {user && (
          <button 
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
