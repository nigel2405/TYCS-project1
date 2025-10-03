import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ErrorAlert } from '../components/ui/Alert';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const portal = process.env.REACT_APP_PORTAL; // 'admin' or 'user'

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', formData);

    const { token, role, name } = res.data;

    console.log("ROLE FROM BACKEND:", role);
    console.log("NAME FROM BACKEND:", name);

    // ✅ Save name according to role
    if (role.toLowerCase() === "student") {
      localStorage.setItem("studentName", name);
    } else if (role.toLowerCase() === "teacher") {
      localStorage.setItem("teacherName", name);
    } else if (role.toLowerCase() === "admin") {
      localStorage.setItem("adminName", name);
    }

    // ✅ Save token + role
    login(token, role);

    // Enforce portal role restrictions
    const roleLower = role.toLowerCase();
    if (portal === 'admin' && !(roleLower === 'admin' || roleLower === 'teacher')) {
      setError('This portal is for teachers and admins only.');
      setIsLoading(false);
      return;
    }
    if (portal === 'user' && roleLower !== 'student') {
      setError('This portal is for students only.');
      setIsLoading(false);
      return;
    }

    // Navigate
    if (roleLower === "student") {
      navigate("/student/dashboard");
    } else if (roleLower === "teacher") {
      navigate("/teacher/dashboard");
    } else if (roleLower === "admin") {
      navigate("/admin/dashboard");
    } else {
      setError("Unknown role. Cannot redirect.");
      setIsLoading(false);
    }
  } catch (err) {
    console.error("Login failed:", err);
    setError(err.response?.data?.message || "Invalid email or password");
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 p-4 sm:p-6 lg:p-8">
      {/* Skip to main content link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <main id="main-content" className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full mx-4 sm:mx-0" role="main">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm sm:text-base">Sign in to your account to continue</p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorAlert dismissible onDismiss={() => setError('')}>
              {error}
            </ErrorAlert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" noValidate>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-3 sm:py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400 touch-manipulation"
              placeholder="Enter your email address"
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
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 pr-12 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400 touch-manipulation"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} aria-hidden="true" /> : <FaEye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 sm:py-3 px-4 rounded-lg transition-colors font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation min-h-[48px]"
            aria-describedby={error ? "login-error" : undefined}
          >
            {isLoading ? (
              <>
                <div 
                  className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                  aria-hidden="true"
                ></div>
                <span>Signing in...</span>
                <span className="sr-only">Please wait while we sign you in</span>
              </>
            ) : (
              <>
                <FaSignInAlt aria-hidden="true" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 sm:mt-8 space-y-4">
          <div className="text-center">
            <button 
              onClick={() => navigate('/forgot-password')} 
              className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors p-2 touch-manipulation"
            >
              Forgot your password?
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            {portal === 'admin' ? (
              <button 
                onClick={() => navigate('/teacher/register')} 
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors p-1 touch-manipulation"
              >
                Sign up as Teacher
              </button>
            ) : (
              <button 
                onClick={() => navigate('/register')} 
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors p-1 touch-manipulation"
              >
                Sign up as Student
              </button>
            )}
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
      </main>
    </div>
  );
};

export default Login;
