import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const TeacherRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'teacher',
      });
      alert('Teacher registration successful!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-1">Create a Teacher Account</h2>
        <p className="text-center text-gray-500 mb-6">Fill in the details to register.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block font-medium mb-1">Full Name</label>
            <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} placeholder="Enter your full name" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
          </div>
          <div>
            <label htmlFor="email" className="block font-medium mb-1">Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block font-medium mb-1">Password</label>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Enter your password" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10" required />
            <button type="button" title={showPassword ? 'Hide Password' : 'Show Password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
          </div>
          <button type="submit" title="Register" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition flex items-center justify-center gap-2"><FaUserPlus /> Sign Up</button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-600">
          <p>
            Already have an account? <span className="text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate('/login')}>Sign in</span>
          </p>
        </div>
        <div className="mt-4 text-center">
          <button title="Go to Home" onClick={() => navigate('/')} className="mt-3 text-gray-700 border border-black px-4 py-1 rounded-md hover:bg-gray-100">Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default TeacherRegister;


