import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      const token = res?.data?.token;
      setMessage(res.data.message || 'If the email exists, a reset link was sent. Please check your inbox.');
      if (token) {
        const url = `${window.location.origin}/reset-password?token=${token}`;
        setResetUrl(url);
      } else {
        setResetUrl('');
      }
    } catch (err) {
      setIsError(true);
      setMessage(err?.response?.data?.message || 'Failed to send reset email. Please try again later.');
      setResetUrl('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 p-6">
      <div className="bg-white p-10 rounded-xl shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-700 text-center mb-4">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition font-semibold disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        {message && (
          <div className={`mt-4 text-center text-sm ${isError ? 'text-red-600' : 'text-gray-700'}`}>
            <p>{message}</p>
            {resetUrl && (
              <div className="mt-3 break-all">
                <a href={resetUrl} className="text-blue-600 hover:underline">{resetUrl}</a>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard && navigator.clipboard.writeText(resetUrl)}
                    className="px-3 py-1 bg-gray-100 border rounded hover:bg-gray-200"
                  >
                    Copy link
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;


