import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  // Student-only registration
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    className: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // ✅ Student must select class
    if (!formData.className) {
      setError("Please select a class for student accounts.");
      setIsLoading(false);
      return;
    }

    console.log("Registering student with:", {
      name: formData.username,
      email: formData.email,
      password: formData.password,
      className: formData.className,
    });

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        className: formData.className,
      });

      // Success - navigate to login
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full mx-4 sm:mx-0">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Create Student Account</h1>
          <p className="text-gray-500 text-sm sm:text-base">Join our attendance system as a student</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="name"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-3 sm:px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400 touch-manipulation"
              required
              disabled={isLoading}
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="w-full px-3 sm:px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400 touch-manipulation"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                className="w-full px-3 sm:px-4 py-3 pr-12 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400 touch-manipulation"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                title={showPassword ? "Hide Password" : "Show Password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 touch-manipulation"
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {/* Class Selection */}
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              id="className"
              name="className"
              value={formData.className}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white touch-manipulation"
              required
              disabled={isLoading}
            >
              <option value="">Select your class</option>
              
              <optgroup label="Computer Science">
                <option value="FYBSc CS">FYBSc CS</option>
                <option value="SYBSc CS">SYBSc CS</option>
                <option value="TYBSc CS">TYBSc CS</option>
              </optgroup>

              <optgroup label="Information Technology">
                <option value="FYBSc IT">FYBSc IT</option>
                <option value="SYBSc IT">SYBSc IT</option>
                <option value="TYBSc IT">TYBSc IT</option>
              </optgroup>

              <optgroup label="BAF (Banking & Finance)">
                <option value="FYBAF">FYBAF</option>
                <option value="SYBAF">SYBAF</option>
                <option value="TYBAF">TYBAF</option>
              </optgroup>

              <optgroup label="BMS (Management Studies)">
                <option value="FYBMS">FYBMS</option>
                <option value="SYBMS">SYBMS</option>
                <option value="TYBMS">TYBMS</option>
              </optgroup>

              <optgroup label="Science">
                <option value="FYBSc">FYBSc</option>
                <option value="SYBSc">SYBSc</option>
                <option value="TYBSc">TYBSc</option>
              </optgroup>

              <optgroup label="Arts">
                <option value="FYBA">FYBA</option>
                <option value="SYBA">SYBA</option>
                <option value="TYBA">TYBA</option>
              </optgroup>

              <optgroup label="Commerce">
                <option value="FYBCom">FYBCom</option>
                <option value="SYBCom">SYBCom</option>
                <option value="TYBCom">TYBCom</option>
              </optgroup>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg transition-colors font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation min-h-[48px]"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Creating Account...
              </>
            ) : (
              <>
                <FaUserPlus />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 sm:mt-8 space-y-4">
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => navigate("/login")} 
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors p-1 touch-manipulation"
            >
              Sign in
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate("/")}
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

export default Register;
