import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaBell, FaPaperPlane, FaRegListAlt, FaClipboardCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import Sidebar from "../../components/shared/Sidebar";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const studentName = localStorage.getItem("studentName") || "Student";

  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [application, setApplication] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    student: null,
    stats: {
      attendanceRate: 0,
      overallAttendanceRate: 0,
      presentDaysThisMonth: 0,
      totalDaysThisMonth: 0,
      presentDaysOverall: 0,
      totalDaysOverall: 0,
      alertStatus: "Good",
      alertColor: "green"
    },
    recentAttendance: []
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("studentName");
    navigate("/login");
  };

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/students/leaves", {
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("/students/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(res.data);
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchLeaves();
  }, []);

  const generateApplicationText = () => {
    // Basic date formatting for display in the application text
    const displayDate = new Date(leaveDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return `To,
The Class Teacher,

Respected Sir/Madam,

I, ${studentName}, would like to request leave on ${displayDate} due to ${leaveReason}.

Kindly grant me leave for the mentioned date.

Thank you.

Yours sincerely,
${studentName}`;
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
        "/students/leave",
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
      fetchDashboardData(); // Refresh dashboard data
    } catch (err) {
      console.error("Error sending leave request:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to send leave request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans">
      {/* Fixed Sidebar */}
      <Sidebar userRole="student" userName={studentName}>
        {/* Attendance & Alert Cards */}
        <div className="space-y-5">
          {/* Attendance Rate */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 shadow-md rounded-xl p-5 border-l-4 border-blue-500 transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-gray-700">Attendance Rate</p>
              <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
            <p className="text-3xl font-extrabold text-blue-800">
              {loading ? "--" : `${dashboardData.stats.attendanceRate}%`}
            </p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>

          {/* Days Present */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 shadow-md rounded-xl p-5 border-l-4 border-green-500 transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-gray-700">Days Present</p>
              <FaClipboardCheck className="text-green-600 text-xl" />
            </div>
            <p className="text-3xl font-extrabold text-green-800">
              {loading ? "--" : dashboardData.stats.presentDaysOverall}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Out of {loading ? "--" : dashboardData.stats.totalDaysOverall} days
            </p>
          </div>

          {/* Alert Status */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 shadow-md rounded-xl p-5 border-l-4 border-yellow-500 transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-gray-700">Alert Status</p>
              <FaBell className="text-yellow-600 text-xl animate-pulse" />
            </div>
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold shadow-sm ${
              loading ? "bg-gray-200 text-gray-800" :
              dashboardData.stats.alertColor === "green" ? "bg-green-200 text-green-800" :
              dashboardData.stats.alertColor === "yellow" ? "bg-yellow-200 text-yellow-800" :
              "bg-red-200 text-red-800"
            }`}>
              {loading ? "--" : dashboardData.stats.alertStatus}
            </span>
            <p className="text-xs text-gray-500 mt-1">Attendance level</p>
          </div>
        </div>
      </Sidebar>

      {/* Main Content - with left margin for fixed sidebar */}
      <div className="ml-72 min-h-screen overflow-y-auto">
        <div className="p-10">
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
            Your latest attendance records (last 10 days).
          </p>

          {loading ? (
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-xl text-center text-gray-500 border border-gray-200 shadow-inner">
              <p className="text-xl font-medium">📅 Loading attendance records...</p>
            </div>
          ) : dashboardData.recentAttendance.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-xl text-center text-gray-500 border border-gray-200 shadow-inner">
              <p className="text-xl font-medium">📅 No attendance records yet</p>
              <p className="text-sm mt-2">Check back soon for updates!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {dashboardData.recentAttendance.map((record, index) => (
                <div
                  key={record._id || index}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                    record.status === 'present'
                      ? 'bg-green-50 border-green-200 hover:bg-green-100'
                      : 'bg-red-50 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${
                      record.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {record.formattedDate}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    record.status === 'present'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {record.status === 'present' ? '✅ Present' : '❌ Absent'}
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
};

export default StudentDashboard;