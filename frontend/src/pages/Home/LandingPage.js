import React from 'react';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 p-6">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Welcome to Smart RFID Attendance</h1>
        <p className="text-gray-600 mb-8 text-lg">A secure platform with multiple user roles and authentication.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition"
          >
            <FaSignInAlt /> Sign In
          </button>

          <button
            onClick={() => navigate('/register')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md transition"
          >
            <FaUserPlus /> Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
