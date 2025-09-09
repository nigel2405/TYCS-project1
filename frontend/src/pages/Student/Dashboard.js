import React from 'react';
import { FaCalendarAlt, FaBell, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();

  // Example: Getting student name from localStorage (set after login)
  const studentName = localStorage.getItem("studentName") || "Student";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("studentName");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-lg p-6 flex flex-col justify-between">
        <div>
          {/* Student Info */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FaUser className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">{studentName}</h3>
              <p className="text-sm text-gray-500">Student</p>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="bg-white shadow rounded-xl p-4 mb-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-gray-600">Attendance Rate</p>
              <FaCalendarAlt className="text-blue-500 text-lg" />
            </div>
            <p className="text-2xl font-bold text-blue-700">--%</p>
            <p className="text-sm text-gray-400">This month</p>
          </div>

          {/* Days Present */}
          <div className="bg-white shadow rounded-xl p-4 mb-4 border-l-4 border-green-500">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-gray-600">Days Present</p>
              <FaCalendarAlt className="text-green-500 text-lg" />
            </div>
            <p className="text-2xl font-bold text-green-600">--</p>
            <p className="text-sm text-gray-400">Out of -- days</p>
          </div>

          {/* Alert Status */}
          <div className="bg-white shadow rounded-xl p-4 border-l-4 border-yellow-500">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-gray-600">Alert Status</p>
              <FaBell className="text-yellow-500 text-lg" />
            </div>
            <span className="inline-block bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-semibold">
              --
            </span>
            <p className="text-sm text-gray-400 mt-1">Attendance level</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:opacity-90 transition"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-700">Student Dashboard</h2>
        <p className="text-sm text-gray-500">
          Welcome back, {studentName} 👋
        </p>
      </div>


        {/* Recent Attendance */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-10">
          <h3 className="text-xl font-semibold text-purple-700 mb-1">Recent Attendance</h3>
          <p className="text-sm text-gray-500 mb-4">
            Your latest attendance records will appear here.
          </p>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl text-center text-gray-400">
            📅 No attendance records yet
          </div>
        </div>

        {/* Low Attendance Alert */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-600">
            <FaBell /> Low Attendance Alert
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Get notified if your attendance falls below the set threshold.
          </p>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-5 rounded-xl mb-4">
            <p className="text-sm text-gray-700">
              Current attendance: <span className="font-semibold">--%</span>
            </p>
            <p className="text-sm text-gray-500">Threshold: --%</p>
          </div>
          <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
            <FaBell /> Send Test Alert
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
