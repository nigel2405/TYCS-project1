import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaBell, FaPaperPlane, FaRegListAlt, FaClipboardCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import Sidebar from "../../components/shared/Sidebar";
import { Button, Input, Textarea, ProgressBar, Loading, SkeletonText } from "../../components/ui";

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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Skip to main content link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Fixed Sidebar */}
      <Sidebar userRole="student" userName={studentName}>
        {/* Attendance & Alert Cards */}
        <div className="space-y-4">
          {/* Attendance Rate */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-primary-200 transition-all duration-200">
            <div className="flex justify-between items-center mb-3">
              <p className="font-medium text-gray-700 text-sm">Attendance Rate</p>
              <div className="p-2 bg-primary-50 rounded-lg">
                <FaCalendarAlt className="text-primary-600 text-lg" />
              </div>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">
                {loading ? "--" : `${dashboardData.stats.attendanceRate}%`}
              </p>
              {!loading ? (
                <ProgressBar
                  value={dashboardData.stats.attendanceRate}
                  max={100}
                  color="primary"
                  size="md"
                  className="mt-2"
                  showPercentage={false}
                />
              ) : (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 animate-pulse"></div>
              )}
            </div>
            <p className="text-xs text-gray-500">This month</p>
          </div>

          {/* Days Present */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-success-200 transition-all duration-200">
            <div className="flex justify-between items-center mb-3">
              <p className="font-medium text-gray-700 text-sm">Days Present</p>
              <div className="p-2 bg-success-50 rounded-lg">
                <FaClipboardCheck className="text-success-600 text-lg" />
              </div>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">
                {loading ? "--" : dashboardData.stats.presentDaysOverall}
              </p>
              {!loading ? (
                <ProgressBar
                  value={dashboardData.stats.presentDaysOverall}
                  max={dashboardData.stats.totalDaysOverall}
                  color="success"
                  size="md"
                  className="mt-2"
                  showPercentage={false}
                />
              ) : (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 animate-pulse"></div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Out of {loading ? "--" : dashboardData.stats.totalDaysOverall} days
            </p>
          </div>

          {/* Alert Status */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-warning-200 transition-all duration-200">
            <div className="flex justify-between items-center mb-3">
              <p className="font-medium text-gray-700 text-sm">Alert Status</p>
              <div className="p-2 bg-warning-50 rounded-lg">
                <FaBell className="text-warning-600 text-lg" />
              </div>
            </div>
            <div className="mb-2">
              <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold ${
                loading ? "bg-gray-100 text-gray-600" :
                dashboardData.stats.alertColor === "green" ? "bg-success-100 text-success-800" :
                dashboardData.stats.alertColor === "yellow" ? "bg-warning-100 text-warning-800" :
                "bg-error-100 text-error-800"
              }`}>
                {loading ? "--" : dashboardData.stats.alertStatus}
              </span>
            </div>
            <p className="text-xs text-gray-500">Attendance level</p>
          </div>
        </div>
      </Sidebar>

      {/* Main Content - with left margin for fixed sidebar */}
      <main id="main-content" className="lg:ml-80 min-h-screen overflow-y-auto transition-all duration-300" role="main">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <header className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 mt-16 lg:mt-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
            <p className="text-base sm:text-lg text-gray-600">
              Welcome back, <span className="font-semibold text-primary-700">{studentName}</span> 👋
            </p>
          </header>

        {/* Recent Attendance */}
        <section className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200" aria-labelledby="recent-attendance-heading">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg" aria-hidden="true">
              <FaRegListAlt className="text-primary-600 text-base sm:text-lg" />
            </div>
            <div>
              <h2 id="recent-attendance-heading" className="text-lg sm:text-xl font-semibold text-gray-900">Recent Attendance</h2>
              <p className="text-xs sm:text-sm text-gray-600">Your latest attendance records (last 10 days)</p>
            </div>
          </div>

          {loading ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200">
              <Loading text="Loading attendance records..." />
              <div className="mt-4">
                <SkeletonText lines={3} />
              </div>
            </div>
          ) : dashboardData.recentAttendance.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-lg font-medium text-gray-700 mb-2">No attendance records yet</p>
              <p className="text-sm text-gray-500">Check back soon for updates!</p>
            </div>
          ) : (
            <div className="space-y-3" role="list" aria-label="Recent attendance records">
              {dashboardData.recentAttendance.map((record, index) => (
                <div
                  key={record._id || index}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                  role="listitem"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div 
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        record.status === 'present' ? 'bg-success-500' : 'bg-error-500'
                      }`}
                      aria-hidden="true"
                    ></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {record.formattedDate}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    record.status === 'present'
                      ? 'bg-success-100 text-success-800'
                      : 'bg-error-100 text-error-800'
                  }`}>
                    {record.status === 'present' ? 'Present' : 'Absent'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Leave Application */}
        <section className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200" aria-labelledby="leave-application-heading">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg" aria-hidden="true">
              <FaPaperPlane className="text-primary-600 text-base sm:text-lg" />
            </div>
            <div>
              <h2 id="leave-application-heading" className="text-lg sm:text-xl font-semibold text-gray-900">Apply for Leave</h2>
              <p className="text-xs sm:text-sm text-gray-600">Fill the details below to generate and send a leave application to your teacher</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              type="date"
              label="Leave Date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              required
            />

            <Textarea
              label="Reason for Leave"
              placeholder="Please provide the reason for your leave request..."
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              rows={4}
              required
            />

            <Button
              onClick={handleSendLeave}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <FaPaperPlane className="mr-2" />
              Send Leave Request
            </Button>

            {application && (
              <div className="mt-4 bg-primary-50 p-4 rounded-lg border border-primary-200">
                <h4 className="font-medium text-primary-900 mb-2">Application Preview:</h4>
                <div className="text-sm text-gray-700 whitespace-pre-line bg-white p-3 rounded border">
                  {application}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* My Leave Applications Table */}
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-primary-50 rounded-lg">
              <FaCalendarAlt className="text-primary-600 text-base sm:text-lg" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">My Leave Applications</h3>
              <p className="text-xs sm:text-sm text-gray-600">Track the status of your submitted leave requests</p>
            </div>
          </div>

          {leaves.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-lg font-medium text-gray-700 mb-2">No leave applications submitted yet</p>
              <p className="text-sm text-gray-500">Use the form above to apply for leave</p>
            </div>
          ) : (
            <>
              {/* Mobile-friendly card layout for small screens, table for larger screens */}
              <div className="block sm:hidden space-y-3">
              {leaves.map((leave, index) => {
                const leaveDisplayDate = new Date(leave.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div key={leave._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-900">{leaveDisplayDate}</div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        leave.status === "approved"
                          ? "bg-success-100 text-success-800"
                          : leave.status === "rejected"
                          ? "bg-error-100 text-error-800"
                          : "bg-warning-100 text-warning-800"
                      }`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>Reason:</strong> {leave.reason}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2">
                      <strong>Application:</strong> {leave.application}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaves.map((leave, index) => {
                    const leaveDisplayDate = new Date(leave.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });

                    return (
                      <tr key={leave._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{leaveDisplayDate}</td>
                        <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                          <div className="truncate" title={leave.reason}>
                            {leave.reason}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 max-w-md">
                          <div className="truncate" title={leave.application}>
                            {leave.application}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            leave.status === "approved"
                              ? "bg-success-100 text-success-800"
                              : leave.status === "rejected"
                              ? "bg-error-100 text-error-800"
                              : "bg-warning-100 text-warning-800"
                          }`}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;