import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaBell, FaUser, FaPaperPlane, FaSignOutAlt, FaRegListAlt, FaClipboardCheck } from "react-icons/fa"; // Added FaSignOutAlt, FaRegListAlt, FaClipboardCheck for potential future use or better icons
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const studentName = localStorage.getItem("studentName") || "Student";

  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [application, setApplication] = useState("");
  const [leaves, setLeaves] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("studentName");
    navigate("/login");
  };

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/students/leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data);
    } catch (err) {
      console.error("❌ Error fetching leaves:", err);
      // Handle unauthorized errors specifically, e.g., redirect to login
      if (err.response && err.response.status === 401) {
        handleLogout(); // Log out if token is invalid
      }
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const generateApplicationText = () => {
    // Basic date formatting for display in the application text
    const displayDate = new Date(leaveDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return `To,\nThe Class Teacher,\n\nRespected Sir/Madam,\n\nI, ${studentName}, would like to request leave on ${displayDate} due to ${leaveReason}.\n\nKindly grant me leave for the mentioned date.\n\nThank you.\n\nYours sincerely,\n${studentName}`;
  };

  const handleSendLeave = async () => {
    if (!leaveDate || !leaveReason) {
      alert("Please fill all fields.");
      return;
    }

    const appText = generateApplicationText();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/students/leave",
        {
          date: leaveDate,
          reason: leaveReason,
          application: appText,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Leave request sent successfully!");
      setLeaveDate("");
      setLeaveReason("");
      setApplication(appText); // Set application preview after sending

      fetchLeaves(); // Refresh leave list after submission
    } catch (err) {
      console.error("Error sending leave request:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to send leave request. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-xl p-6 flex flex-col justify-between rounded-r-3xl">
        <div>
          {/* Student Info */}
          <div className="flex items-center gap-4 mb-10 pb-4 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center shadow-md">
              <FaUser className="text-indigo-700 text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{studentName}</h3>
              <p className="text-sm text-gray-500">Student</p>
            </div>
          </div>

          {/* Attendance & Alert Cards */}
          <div className="space-y-5">
            {/* Attendance Rate */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 shadow-md rounded-xl p-5 border-l-4 border-blue-500 transform hover:scale-105 transition-transform duration-200 ease-in-out">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-700">Attendance Rate</p>
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <p className="text-3xl font-extrabold text-blue-800">--%</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>

            {/* Days Present */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 shadow-md rounded-xl p-5 border-l-4 border-green-500 transform hover:scale-105 transition-transform duration-200 ease-in-out">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-700">Days Present</p>
                <FaClipboardCheck className="text-green-600 text-xl" /> {/* Changed icon for variety */}
              </div>
              <p className="text-3xl font-extrabold text-green-800">--</p>
              <p className="text-xs text-gray-500 mt-1">Out of -- days</p>
            </div>

            {/* Alert Status */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 shadow-md rounded-xl p-5 border-l-4 border-yellow-500 transform hover:scale-105 transition-transform duration-200 ease-in-out">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-700">Alert Status</p>
                <FaBell className="text-yellow-600 text-xl animate-pulse" />
              </div>
              <span className="inline-block bg-yellow-200 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                --
              </span>
              <p className="text-xs text-gray-500 mt-1">Attendance level</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg hover:from-red-600 hover:to-rose-700 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-auto">
        {/* Header */}
        <div className="mb-10 pb-4 border-b border-gray-200">
          <h2 className="text-4xl font-extrabold text-indigo-800">Student Dashboard</h2>
          <p className="text-lg text-gray-600 mt-2">
            Welcome back, <span className="font-semibold text-purple-700">{studentName}</span> 👋
          </p>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-10 border border-gray-100">
          <h3 className="text-2xl font-bold text-purple-800 mb-3 flex items-center gap-2">
            <FaRegListAlt className="text-purple-500" /> Recent Attendance
          </h3>
          <p className="text-md text-gray-600 mb-6">
            Your latest attendance records will appear here.
          </p>

          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-xl text-center text-gray-500 border border-gray-200 shadow-inner">
            <p className="text-xl font-medium">📅 No attendance records yet</p>
            <p className="text-sm mt-2">Check back soon for updates!</p>
          </div>
        </div>

        {/* Leave Application */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-10 border border-gray-100">
          <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            <FaPaperPlane className="text-blue-500" /> Apply for Leave
          </h3>
          <p className="text-md text-gray-600 mb-6">
            Fill the details below to generate and send a leave application to your teacher.
          </p>

          <div className="space-y-5">
            <input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all duration-200"
            />

            <textarea
              placeholder="Reason for leave..."
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              rows="4"
              className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all duration-200 resize-y"
            />

            <button
              onClick={handleSendLeave}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-bold shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-3 text-xl"
            >
              <FaPaperPlane /> Send Leave Request
            </button>

            {application && (
              <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-200 text-gray-700 text-base whitespace-pre-line shadow-inner">
                <h4 className="font-semibold text-blue-700 mb-2">Application Preview:</h4>
                {application}
              </div>
            )}
          </div>
        </div>

        {/* My Leave Applications Table */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-2">
            <FaCalendarAlt className="text-purple-500" /> My Leave Applications
          </h3>

          {leaves.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500 border border-gray-200 shadow-inner">
                <p className="text-lg">No leave applications submitted yet.</p>
                <p className="text-sm mt-2">Use the form above to apply for leave.</p>
            </div>
          ) : (
            <div className="overflow-x-auto"> {/* Added for better responsiveness on small screens */}
                <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Reason</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Application</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.map((leave, index) => {
                        const leaveDisplayDate = new Date(leave.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });

                        return (
                            <tr key={leave._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}>
                                <td className="p-4 border-b border-gray-200 text-gray-700 text-sm font-medium">{leaveDisplayDate}</td>
                                <td className="p-4 border-b border-gray-200 text-gray-700 text-sm max-w-xs truncate">{leave.reason}</td>
                                <td className="p-4 border-b border-gray-200 text-gray-700 text-sm max-w-md truncate">{leave.application}</td>
                                <td
                                className={`p-4 border-b border-gray-200 font-bold text-sm ${
                                    leave.status === "approved"
                                    ? "text-emerald-600"
                                    : leave.status === "rejected"
                                    ? "text-rose-600"
                                    : "text-amber-600"
                                }`}
                                >
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    leave.status === "approved"
                                    ? "bg-emerald-100"
                                    : leave.status === "rejected"
                                    ? "bg-rose-100"
                                    : "bg-amber-100"
                                }`}>
                                    {leave.status}
                                </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;