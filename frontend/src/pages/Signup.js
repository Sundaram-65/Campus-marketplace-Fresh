import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    hostel: '',
    rollNo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-4">
      <div className="w-full max-w-2xl">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full p-4 mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V8M10.5 1.5v6h6M10.5 1.5L16.5 7.5" strokeWidth="1.5" stroke="currentColor" fill="none"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Join Campus Marketplace</h1>
          <p className="text-blue-100">Create your account to get started</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                name="name"
                placeholder="John Doe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact (10 digits)</label>
              <input
                name="contact"
                placeholder="9876543210"
                maxLength="10"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                value={form.contact}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hostel</label>
              <input
                name="hostel"
                placeholder="e.g., North Block A"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                value={form.hostel}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Roll Number</label>
              <input
                name="rollNo"
                placeholder="CSE2021001"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                value={form.rollNo}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="md:col-span-2 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white mt-8 text-sm">© 2025 Campus Marketplace. All rights reserved.</p>
      </div>
    </div>
  );
}
