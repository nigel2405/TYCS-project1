import React from 'react';
import { FaCalendarAlt, FaBell } from 'react-icons/fa';

const StudentDashboard = () => {
  const attendanceRate = 80;
  const daysPresent = 20;
  const totalDays = 25;
  const alertThreshold = 75;
  const recentAttendance = [
    { date: '2024-07-29', time: '09:00 AM', status: 'Present' },
    { date: '2024-07-28', time: '09:15 AM', status: 'Present' },
    { date: '2024-07-27', time: '-', status: 'Absent' },
    { date: '2024-07-26', time: '08:45 AM', status: 'Present' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-sm text-gray-500">Welcome back, User</p>
        </div>
        <button className="border px-4 py-2 rounded-md text-sm hover:bg-gray-100">
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Attendance Rate */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium">Attendance Rate</p>
            <FaCalendarAlt className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold">{attendanceRate}%</p>
          <p className="text-sm text-gray-500">This month</p>
        </div>

        {/* Days Present */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium">Days Present</p>
            <FaCalendarAlt className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold">{daysPresent}</p>
          <p className="text-sm text-gray-500">Out of {totalDays} days</p>
        </div>

        {/* Alert Status */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium">Alert Status</p>
            <FaBell className="text-gray-400" />
          </div>
          <span className="inline-block bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
            Good
          </span>
          <p className="text-sm text-gray-500 mt-1">Above threshold</p>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white shadow rounded-lg p-6 mb-10">
        <h3 className="text-xl font-semibold mb-1">Recent Attendance</h3>
        <p className="text-sm text-gray-500 mb-4">
          Your attendance record for the last 5 days
        </p>

        <ul>
          {recentAttendance.map((entry, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center py-3 border-b last:border-none"
            >
              <div>
                <p className="font-medium">{entry.date}</p>
                <p className="text-sm text-gray-500">{entry.time}</p>
              </div>
              {entry.status === 'Present' ? (
                <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm">
                  Present
                </span>
              ) : (
                <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-sm">
                  Absent
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Low Attendance Alert */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <FaBell /> Low Attendance Alert
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          Get notified when your attendance falls below {alertThreshold}%
        </p>
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <p className="text-sm">
            Current attendance:{' '}
            <span className="font-semibold">{attendanceRate}%</span>
          </p>
          <p className="text-sm text-gray-500">
            Threshold: {alertThreshold}%
          </p>
        </div>
        <button className="border px-4 py-2 rounded-md text-sm hover:bg-gray-100 flex items-center gap-2">
          <FaBell /> Send Test Alert
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
