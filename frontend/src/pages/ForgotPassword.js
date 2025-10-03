import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaExclamationCircle, FaCheckCircle, FaCopy } from 'react-icons/fa';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    setCopySuccess(false);
    
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

  const handleCopyLink = async () => {
    if (navigator.clipboard && resetUrl) {
      try {
        await navigator.clipboard.writeText(resetUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full mx-4 sm:mx-0">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FaEnvelope className="text-blue-500 text-xl sm:text-2xl" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-500 text-sm sm:text-base px-2">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400 touch-manipulation"
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg transition-colors font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation min-h-[48px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Sending Reset Link...
              </>
            ) : (
              <>
                <FaEnvelope />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
            isError 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-green-50 border border-green-200'
          }`}>
            {isError ? (
              <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            ) : (
              <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm ${isError ? 'text-red-700' : 'text-green-700'}`}>
                {message}
              </p>
              
              {/* Reset URL Display */}
              {resetUrl && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-xs text-gray-600 mb-2">Reset Link:</p>
                    <div className="break-all text-sm text-blue-600">
                      <a 
                        href={resetUrl} 
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resetUrl}
                      </a>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors touch-manipulation min-h-[40px]"
                  >
                    <FaCopy size={14} />
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="mt-6 sm:mt-8 space-y-4">
          <div className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors p-1 touch-manipulation"
            >
              Sign in
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors p-2 touch-manipulation"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;


