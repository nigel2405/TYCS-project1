import React, { useState, useEffect } from "react";
import {
  FaChalkboardTeacher,
  FaChalkboard,
  FaClipboardList,
  FaBell,
  FaExclamationTriangle,
  FaEnvelope,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import Sidebar, { NavItem } from "../../components/shared/Sidebar";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const teacherName = localStorage.getItem("teacherName") || "Teacher";

  const [classes, setClasses] = useState([]);
  const [expandedClasses, setExpandedClasses] = useState({});
  const [activeTab, setActiveTab] = useState("classes");
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get("/teacher/my-classes");
        setClasses(res.data || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch leave applications
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await axios.get("/teacher/leaves");
        setLeaveApplications(res.data || []);
      } catch (err) {
        console.error("Error fetching leave applications:", err);
      }
    };
    fetchLeaves();
  }, []);

  const toggleClass = (name) => {
    setExpandedClasses((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await axios.put(`/teacher/leave/${leaveId}`, { status });
      setLeaveApplications((prev) =>
        prev.map((l) => (l._id === leaveId ? { ...l, status } : l))
      );
    } catch (err) {
      console.error("Error updating leave status:", err);
    }
  };

  const pendingLeaves = leaveApplications.filter(
    (l) => l.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar userRole="teacher" userName={teacherName}>
        {/* Enhanced Navigation */}
        <div className="space-y-1">
          <NavItem
            label="My Classes"
            icon={<FaChalkboard />}
            active={activeTab === "classes"}
            onClick={() => setActiveTab("classes")}
          />
          <NavItem
            label="Class Attendance"
            icon={<FaClipboardList />}
            active={activeTab === "attendance"}
            onClick={() => setActiveTab("attendance")}
          />
          <NavItem
            label="RFID Activity"
            icon={<FaChalkboardTeacher />}
            active={activeTab === "rfid"}
            onClick={() => setActiveTab("rfid")}
          />
          <NavItem
            label="Blacklist"
            icon={<FaExclamationTriangle />}
            active={activeTab === "blacklist"}
            onClick={() => setActiveTab("blacklist")}
          />
          <NavItem
            label="Leave Applications"
            icon={<FaBell />}
            active={activeTab === "leaves"}
            onClick={() => setActiveTab("leaves")}
            badge={pendingLeaves}
          />
        </div>
      </Sidebar>

      {/* Main Content - with left margin for fixed sidebar */}
      <div className="lg:ml-80 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Enhanced Page Header */}
          <div className="mb-6 sm:mb-8 mt-16 lg:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Teacher Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Welcome back, <span className="font-semibold text-blue-600">{teacherName}</span>! 
                  <span className="ml-2">👋</span>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            {/* Enhanced Navigation Tabs */}
            <div className="mt-4 sm:mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("classes")}
                  className={`py-3 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                    activeTab === "classes"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FaChalkboard className="inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">My </span>Classes
                </button>
                <button
                  onClick={() => setActiveTab("attendance")}
                  className={`py-3 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                    activeTab === "attendance"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FaClipboardList className="inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Class </span>Attendance
                </button>
                <button
                  onClick={() => setActiveTab("rfid")}
                  className={`py-3 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                    activeTab === "rfid"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FaChalkboardTeacher className="inline mr-1 sm:mr-2" />
                  RFID<span className="hidden sm:inline"> Activity</span>
                </button>
                <button
                  onClick={() => setActiveTab("blacklist")}
                  className={`py-3 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap ${
                    activeTab === "blacklist"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FaExclamationTriangle className="inline mr-1 sm:mr-2" />
                  Blacklist
                </button>
                <button
                  onClick={() => setActiveTab("leaves")}
                  className={`py-3 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 relative whitespace-nowrap ${
                    activeTab === "leaves"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <FaBell className="inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Leave </span>Applications
                  {pendingLeaves > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                      {pendingLeaves}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>

        {/* Enhanced Classes Tab */}
        {activeTab === "classes" && (
          <div className="space-y-6">
            {classes.length > 0 ? (
              <div className="grid gap-6">
                {classes.map((cls) => (
                  <div
                    key={cls.className}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <button
                      onClick={() => toggleClass(cls.className)}
                      className="w-full p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex justify-between items-center font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <FaChalkboard className="text-xl" />
                        <span>{cls.className}</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          {cls.students?.length || 0} students
                        </span>
                      </div>
                      <div className={`transform transition-transform duration-300 ${
                        expandedClasses[cls.className] ? "rotate-180" : ""
                      }`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </button>

                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        expandedClasses[cls.className] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {cls.students && cls.students.length > 0 ? (
                        <div className="p-6 bg-gray-50">
                          <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                            Class Students ({cls.students.length})
                          </h4>
                          <div className="space-y-3">
                            {cls.students.map((s, index) => (
                              <div
                                key={s._id}
                                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                                      <span className="text-blue-600 font-semibold text-sm">
                                        {(s.userId?.name || "U").charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">
                                        {s.userId?.name || "Unnamed Student"}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {s.userId?.email || "No email provided"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Active
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <div className="text-gray-400 mb-2">
                            <FaChalkboard className="mx-auto text-3xl" />
                          </div>
                          <p className="text-gray-500 font-medium">No students assigned to this class</p>
                          <p className="text-sm text-gray-400 mt-1">Students will appear here once they are enrolled</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaChalkboard className="mx-auto text-6xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Classes Assigned</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  You don't have any classes assigned yet. Contact your administrator to get classes assigned to your account.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && <TeacherAttendanceSection />}

        {/* RFID Activity Tab */}
        {activeTab === "rfid" && <RFIDActivitySection />}

        {/* Blacklist Tab */}
        {activeTab === "blacklist" && <BlacklistSection />}

        {/* Enhanced Leave Applications Tab */}
        {activeTab === "leaves" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FaBell className="text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {leaveApplications.filter(l => l.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaBell className="text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {leaveApplications.filter(l => l.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FaBell className="text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">
                      {leaveApplications.filter(l => l.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Applications List */}
            {leaveApplications.length > 0 ? (
              <div className="space-y-4">
                {leaveApplications.map((leave) => (
                  <div
                    key={leave._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {(leave.student?.userId?.name || "U").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {leave.student?.userId?.name || "Unknown Student"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {leave.student?.userId?.email || "No email"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-gray-700 font-medium mb-1">Reason:</p>
                          <p className="text-gray-600 text-sm">{leave.reason}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            <strong>Date:</strong> {new Date(leave.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span>
                            <strong>Submitted:</strong> {new Date(leave.createdAt || leave.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-3">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          leave.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : leave.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {leave.status === "approved" && "✅ Approved"}
                          {leave.status === "rejected" && "❌ Rejected"}
                          {leave.status === "pending" && "⏳ Pending"}
                        </span>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedLeave(leave)}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                          >
                            View Details
                          </button>
                          {leave.status === "pending" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLeaveAction(leave._id, "approved");
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors duration-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLeaveAction(leave._id, "rejected");
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEnvelope className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Applications</h3>
                <p className="text-gray-600">
                  No leave applications have been submitted yet. They will appear here when students submit requests.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Leave Application Modal */}
        {selectedLeave && (
          <LeaveApplicationModal
            leave={selectedLeave}
            onClose={() => setSelectedLeave(null)}
            onAction={handleLeaveAction}
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

// ------------------- Subcomponents -------------------

// Enhanced Leave Application Modal
const LeaveApplicationModal = ({ leave, onClose, onAction }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Leave Application Details</h3>
            <p className="text-blue-100 text-sm">
              Submitted by {leave.student?.userId?.name || "Unknown Student"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        {/* Student Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">
                {(leave.student?.userId?.name || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {leave.student?.userId?.name || "Unknown Student"}
              </h4>
              <p className="text-sm text-gray-600">
                {leave.student?.userId?.email || "No email"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Leave Date:</span>
              <p className="text-gray-600">
                {new Date(leave.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <p className={`font-semibold ${
                leave.status === "approved"
                  ? "text-green-600"
                  : leave.status === "rejected"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}>
                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-6">
          <h5 className="font-semibold text-gray-900 mb-2">Reason for Leave:</h5>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {leave.reason || "No reason provided"}
          </p>
        </div>

        {/* Application Content */}
        {leave.application && (
          <div className="mb-6">
            <h5 className="font-semibold text-gray-900 mb-2">Full Application:</h5>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-sans">
                {leave.application}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Actions */}
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Submitted on {new Date(leave.createdAt || leave.date).toLocaleDateString()}
        </div>
        
        {leave.status === "pending" ? (
          <div className="flex space-x-3">
            <button
              onClick={() => {
                onAction(leave._id, "rejected");
                onClose();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Reject
            </button>
            <button
              onClick={() => {
                onAction(leave._id, "approved");
                onClose();
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Approve
            </button>
          </div>
        ) : (
          <div className={`px-4 py-2 rounded-lg font-medium ${
            leave.status === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
            {leave.status === "approved" ? "✅ Approved" : "❌ Rejected"}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ------------------- Enhanced Attendance Section -------------------
const TeacherAttendanceSection = () => {
  const [viewMode, setViewMode] = React.useState('monthly'); // 'daily', 'monthly'
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = React.useState('');
  const [classes, setClasses] = React.useState([]);
  const [attendanceData, setAttendanceData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [studentDetails, setStudentDetails] = React.useState(null);

  // Fetch teacher's classes
  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/teacher/my-classes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClasses(res.data || []);
        if (res.data?.length > 0) {
          setSelectedClass(res.data[0].className);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };
    fetchClasses();
  }, []);

  const fetchAttendanceData = async () => {
    if (!selectedClass) return;
    
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (viewMode === 'daily') {
        // Use the dedicated daily endpoint for better performance
        const res = await axios.get(
          `http://localhost:5000/api/teacher/class-attendance/daily?date=${selectedDate}&className=${selectedClass}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setAttendanceData(res.data.records || []);
      } else {
        // Monthly view
        const date = new Date(selectedDate);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const res = await axios.get(
          `http://localhost:5000/api/teacher/class-attendance?month=${month}&year=${year}&className=${selectedClass}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setAttendanceData(res.data.summary || []);
      }
    } catch (err) {
      setError('Failed to load attendance data');
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedClass) {
      fetchAttendanceData();
    }
  }, [viewMode, selectedDate, selectedClass]);

  const getAttendanceRate = (present, total) => {
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  const openStudentDetails = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const date = new Date(selectedDate);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      const res = await axios.get(
        `http://localhost:5000/api/teacher/class-attendance/details?month=${month}&year=${year}&className=${selectedClass}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const studentRecords = res.data.records.filter(r => r.student?._id === studentId);
      const student = studentRecords[0]?.student;
      setStudentDetails({ student, records: studentRecords });
    } catch (err) {
      setError('Failed to load student details');
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Class Attendance Management</h2>
            <p className="text-gray-600 mt-1">Track and monitor student attendance across your classes</p>
          </div>
          <div className="flex items-center space-x-2">
            <FaClipboardList className="text-blue-500 text-2xl" />
          </div>
        </div>
        
        {/* Enhanced Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Class Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
            >
              <option value="">Choose a class...</option>
              {classes.map((cls) => (
                <option key={cls.className} value={cls.className}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
          
          {/* View Mode */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
            >
              <option value="daily">📅 Daily View</option>
              <option value="monthly">📊 Monthly Summary</option>
            </select>
          </div>
          
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {viewMode === 'daily' ? 'Select Date' : 'Select Month'}
            </label>
            <input
              type={viewMode === 'daily' ? 'date' : 'month'}
              value={viewMode === 'daily' ? selectedDate : selectedDate.slice(0, 7)}
              onChange={(e) => {
                if (viewMode === 'daily') {
                  setSelectedDate(e.target.value);
                } else {
                  setSelectedDate(e.target.value + '-01');
                }
              }}
              className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
            />
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Quick Access</label>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="w-full p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>📍</span>
              <span>Today</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Loading and Error States */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Attendance Data</h3>
            <p className="text-gray-600">Please wait while we fetch the attendance records...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchAttendanceData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Attendance Display */}
      {!loading && !error && selectedClass && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {viewMode === 'daily' ? (
            <DailyAttendanceView 
              attendanceData={attendanceData}
              selectedDate={selectedDate}
              selectedClass={selectedClass}
            />
          ) : (
            <MonthlyAttendanceView 
              attendanceData={attendanceData}
              selectedDate={selectedDate}
              selectedClass={selectedClass}
              getAttendanceRate={getAttendanceRate}
              openStudentDetails={openStudentDetails}
            />
          )}
        </div>
      )}

      {!loading && !error && !selectedClass && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <FaClipboardList className="mx-auto text-6xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Class</h3>
            <p className="text-gray-600">
              Choose a class from the dropdown above to view attendance data
            </p>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {studentDetails && (
        <StudentDetailsModal 
          studentDetails={studentDetails}
          onClose={() => setStudentDetails(null)}
        />
      )}
    </div>
  );
};

// Enhanced Daily Attendance View Component
const DailyAttendanceView = ({ attendanceData, selectedDate, selectedClass }) => {
  const presentCount = attendanceData.filter(record => record.status === 'present').length;
  const totalCount = attendanceData.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="p-6">
      {/* Header with Statistics */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Daily Attendance - {selectedClass}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{totalCount}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rate</p>
            </div>
          </div>
        </div>
      </div>

      {attendanceData.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaClipboardList className="text-gray-400 text-2xl" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h4>
          <p className="text-gray-600">No attendance records found for this date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attendanceData.map((record, index) => (
            <div
              key={record._id || index}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                record.status === 'present'
                  ? 'bg-green-50 border-green-200 hover:bg-green-100'
                  : 'bg-red-50 border-red-200 hover:bg-red-100'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  record.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    record.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {(record.student?.userId?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {record.student?.userId?.name || 'Unknown Student'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {record.student?.userId?.email || 'No email'}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                record.status === 'present'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {record.status === 'present' ? 'Present' : 'Absent'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced Monthly Attendance View Component
const MonthlyAttendanceView = ({ attendanceData, selectedDate, selectedClass, getAttendanceRate, openStudentDetails }) => {
  const monthName = new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Monthly Summary - {selectedClass}
          </h3>
          <p className="text-sm text-gray-600">{monthName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {attendanceData.length} students tracked
          </p>
        </div>
      </div>

      {attendanceData.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaClipboardList className="text-gray-400 text-2xl" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h4>
          <p className="text-gray-600">No attendance data available for this month.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Student</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700">Present</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700">Total</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700">Rate</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((student, index) => {
                const rate = getAttendanceRate(student.presentDays, student.totalDays);
                return (
                  <tr
                    key={student.student?._id || index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {(student.student?.userId?.name || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {student.student?.userId?.name || 'Unknown Student'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">
                      {student.student?.userId?.email || 'No email'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {student.presentDays}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {student.totalDays}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className={`w-12 h-2 rounded-full overflow-hidden ${
                          rate >= 75 ? 'bg-green-200' : rate >= 50 ? 'bg-yellow-200' : 'bg-red-200'
                        }`}>
                          <div 
                            className={`h-full transition-all duration-500 ${
                              rate >= 75 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${rate}%` }}
                          ></div>
                        </div>
                        <span className={`font-semibold text-sm ${
                          rate >= 75 ? 'text-green-600' : rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => openStudentDetails(student.student?._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Student Details Modal Component
const StudentDetailsModal = ({ studentDetails, onClose }) => {
  const { student, records } = studentDetails;
  const presentDays = records.filter(r => r.status === 'present').length;
  const totalDays = records.length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{student?.userId?.name}</h3>
              <p className="text-indigo-100">{student?.userId?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  📊 {presentDays}/{totalDays} Days
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  attendanceRate >= 75 ? 'bg-green-500' : attendanceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {attendanceRate}% Attendance
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">📅 Daily Attendance Records</h4>
          
          {records.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendance records found.</p>
          ) : (
            <div className="grid gap-2">
              {records.map((record) => (
                <div
                  key={record._id}
                  className={`flex items-center justify-between p-3 rounded-xl border-l-4 ${
                    record.status === 'present'
                      ? 'bg-green-50 border-green-400'
                      : 'bg-red-50 border-red-400'
                  }`}
                >
                  <span className="font-medium text-gray-700">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'long', month: 'short', day: 'numeric'
                    })}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    record.status === 'present'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {record.status === 'present' ? '✅ Present' : '❌ Absent'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ------------------- Blacklist Section -------------------
const BlacklistSection = () => {
  const [classes, setClasses] = useState([]);
  const [blacklistData, setBlacklistData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sendingEmail, setSendingEmail] = useState({});
  const [bulkSending, setBulkSending] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [showEmailHistory, setShowEmailHistory] = useState(false);
  const [showReports, setShowReports] = useState(false);

  // Fetch teacher's classes
  const fetchClasses = async () => {
    try {
      const res = await axios.get('/teacher/my-classes');
      setClasses(res.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes');
    }
  };

  // Fetch blacklist data (students with <75% attendance)
  const fetchBlacklistData = async () => {
    if (classes.length === 0) return;
    
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.get('/teacher/blacklist');
      setBlacklistData(res.data.blacklistData || []);
    } catch (err) {
      console.error('Error fetching blacklist:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Please ensure you are logged in as a teacher.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to load blacklist data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch blacklist data when classes change
  useEffect(() => {
    fetchBlacklistData();
  }, [classes]);

  const sendNotificationEmail = async (student, className) => {
    const studentKey = `${student._id}_${className}`;
    setSendingEmail(prev => ({ ...prev, [studentKey]: true }));
    
    try {
      console.log('📧 Sending notification:', {
        studentId: student._id,
        className: className,
        studentEmail: student.userId?.email,
        studentName: student.userId?.name
      });
      
      // Using axios instance from api.js which automatically includes auth token
      const response = await axios.post('/teacher/send-attendance-notification', {
        studentId: student._id,
        className: className,
        studentEmail: student.userId?.email,
        studentName: student.userId?.name
      });
      
      console.log('✅ Email sent successfully:', response.data);
      alert(`Notification sent successfully to ${student.userId?.name}!`);
    } catch (err) {
      console.error('❌ Error sending notification:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMessage = 'Failed to send notification. ';
      if (err.response?.status === 403) {
        errorMessage += 'Access denied. Please ensure you are logged in as a teacher.';
      } else if (err.response?.status === 401) {
        errorMessage += 'Session expired. Please log in again.';
      } else if (err.response?.status === 400) {
        errorMessage += `Invalid data: ${err.response?.data?.message || 'Please check the student information.'}`;
      } else if (err.response?.status === 409) {
        errorMessage += `Duplicate email: ${err.response?.data?.message || 'Email already sent recently.'}`;
      } else if (err.response?.status === 500) {
        errorMessage += `Server error: ${err.response?.data?.message || 'Please try again later.'}`;
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }
      
      alert(errorMessage);
    } finally {
      setSendingEmail(prev => ({ ...prev, [studentKey]: false }));
    }
  };

  const sendBulkNotifications = async (className) => {
    setBulkSending(true);
    
    try {
      console.log('📧 Sending bulk notifications for class:', className);
      
      const response = await axios.post('/teacher/send-bulk-notifications', {
        className: className,
        skipDuplicateCheck: false,
        includeParents: false
      });
      
      console.log('✅ Bulk notifications completed:', response.data);
      
      const { sent, skipped, failed, totalStudents } = response.data;
      
      let message = `Bulk notification completed for ${className}:\n`;
      message += `Total students: ${totalStudents}\n`;
      message += `Sent: ${sent}\n`;
      message += `Skipped: ${skipped}\n`;
      message += `Failed: ${failed}`;
      
      alert(message);
      
      // Refresh blacklist data
      fetchBlacklistData();
    } catch (err) {
      console.error('❌ Error sending bulk notifications:', err);
      
      let errorMessage = 'Failed to send bulk notifications. ';
      if (err.response?.status === 403) {
        errorMessage += 'Access denied.';
      } else if (err.response?.status === 401) {
        errorMessage += 'Session expired. Please log in again.';
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else {
        errorMessage += 'Please try again later.';
      }
      
      alert(errorMessage);
    } finally {
      setBulkSending(false);
    }
  };

  const fetchEmailHistory = async () => {
    try {
      const response = await axios.get('/teacher/email-history', {
        params: { limit: 20 }
      });
      setEmailHistory(response.data.emailHistory || []);
      setShowEmailHistory(true);
    } catch (err) {
      console.error('Error fetching email history:', err);
      alert('Failed to fetch email history.');
    }
  };

  const generateReport = async (className, format = 'json') => {
    try {
      const response = await axios.get('/teacher/attendance-report', {
        params: { className, format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        // Download CSV file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance-report-${className}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        alert('Report downloaded successfully!');
      } else {
        // Show JSON report in modal or new tab
        const reportWindow = window.open();
        reportWindow.document.write(`
          <html>
            <head><title>Attendance Report - ${className}</title></head>
            <body>
              <h1>Attendance Report - ${className}</h1>
              <pre>${JSON.stringify(response.data, null, 2)}</pre>
            </body>
          </html>
        `);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report.');
    }
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAttendanceIcon = (rate) => {
    if (rate >= 50) return '⚠️';
    return '🚨';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-3xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-3">
          <FaExclamationTriangle className="text-4xl" />
          Attendance Blacklist
        </h2>
        <p className="text-center text-red-100 text-lg mb-6">
          Students with attendance below 75% - Requires immediate attention
        </p>
        
        {/* Control Panel */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button
            onClick={fetchEmailHistory}
            className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 font-semibold"
          >
            <FaBell className="text-lg" />
            <span>Email History</span>
          </button>
          
          <button
            onClick={() => setShowReports(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 font-semibold"
          >
            <FaClipboardList className="text-lg" />
            <span>Generate Reports</span>
          </button>
          
          <button
            onClick={() => fetchBlacklistData()}
            className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 font-semibold"
          >
            <span>🔄</span>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-orange-100 text-orange-700">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-700 mr-3"></div>
            Loading blacklist data...
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700 font-medium">⚠️ {error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Blacklist Display */}
      {!loading && !error && (
        <div className="space-y-6">
          {blacklistData.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">Great News!</h3>
              <p className="text-green-700 text-lg">
                All students in your classes have attendance above 75%.
              </p>
            </div>
          ) : (
            blacklistData.map((classData) => (
              <div key={classData.className} className="bg-white rounded-3xl shadow-xl overflow-hidden border-l-4 border-red-500">
                {/* Class Header */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{classData.className}</h3>
                      <p className="text-red-100">
                        {classData.students.length} student{classData.students.length > 1 ? 's' : ''} below 75% attendance
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">
                        🚨
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => sendBulkNotifications(classData.className)}
                          disabled={bulkSending}
                          className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bulkSending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <FaEnvelope className="text-sm" />
                              <span>Send to All</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => generateReport(classData.className, 'csv')}
                          className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 font-semibold text-sm"
                        >
                          <FaClipboardList className="text-sm" />
                          <span>CSV Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="p-6">
                  <div className="grid gap-4">
                    {classData.students.map((studentData, studentIndex) => {
                      const student = studentData.student; // Extract student from the data structure
                      const studentKey = `${student._id}_${classData.className}`;
                      const attendanceRate = Math.round((studentData.presentDays / studentData.totalDays) * 100);
                      
                      return (
                        <div
                          key={`${classData.className}-student-${student._id}-${studentIndex}`}
                          className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl">
                                {getAttendanceIcon(attendanceRate)}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 text-lg">
                                  {student.userId?.name || 'Unknown Student'}
                                </h4>
                                <p className="text-gray-600">
                                  {student.userId?.email || 'No email'}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-sm text-gray-500">
                                    Present: {studentData.presentDays}/{studentData.totalDays} days
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {/* Attendance Rate Badge */}
                              <div className={`px-4 py-2 rounded-full font-bold text-sm ${getAttendanceColor(attendanceRate)}`}>
                                {attendanceRate}%
                              </div>
                              
                              {/* Send Email Button */}
                              <button
                                onClick={() => sendNotificationEmail(student, classData.className)}
                                disabled={sendingEmail[studentKey] || !student.userId?.email}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                              >
                                {sendingEmail[studentKey] ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <FaEnvelope className="text-sm" />
                                    <span>Send Notification</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Email History Modal */}
      {showEmailHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <FaBell className="text-2xl" />
                  Email History
                </h3>
                <button
                  onClick={() => setShowEmailHistory(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {emailHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No email history found.</p>
              ) : (
                <div className="space-y-4">
                  {emailHistory.map((email, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {email.studentId?.userId?.name || 'Unknown Student'}
                          </h4>
                          <p className="text-sm text-gray-600">{email.recipientEmail}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            email.status === 'sent' ? 'bg-green-100 text-green-800' :
                            email.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {email.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{email.className} - {email.emailType}</span>
                        <span>{new Date(email.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Reports Modal */}
      {showReports && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <FaClipboardList className="text-2xl" />
                  Generate Reports
                </h3>
                <button
                  onClick={() => setShowReports(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Class for Report</h4>
                  <div className="grid gap-3">
                    {blacklistData.map(classData => (
                      <div key={classData.className} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-semibold text-gray-800">{classData.className}</h5>
                            <p className="text-sm text-gray-600">
                              {classData.students.length} students below 75% attendance
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                generateReport(classData.className, 'json');
                                setShowReports(false);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              View Report
                            </button>
                            <button
                              onClick={() => {
                                generateReport(classData.className, 'csv');
                                setShowReports(false);
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              Download CSV
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ------------------- RFID Activity Section -------------------
const RFIDActivitySection = () => {
  const [recentScans, setRecentScans] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Fetch recent RFID scans
  React.useEffect(() => {
    const fetchRecentScans = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const res = await axios.get('/rfid/unassigned', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Get last 10 scans
        setRecentScans(res.data.slice(0, 10) || []);
      } catch (err) {
        setError('Failed to load RFID activity');
        console.error('Error fetching RFID activity:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentScans();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRecentScans, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">|RFID Scanner Activity</h2>
        <p className="text-blue-100">Real-time view of RFID card scans</p>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-indigo-100 text-indigo-700">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-700 mr-3"></div>
            Loading RFID activity...
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700 font-medium">⚠️ {error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Scans */}
      {!loading && !error && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                📡 Recent RFID Scans
              </h3>
              <p className="text-gray-500">{recentScans.length} recent scans</p>
            </div>

            {recentScans.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">No recent RFID scans detected.</p>
                <p className="text-gray-400 mt-2">Place an RFID card near the scanner to begin.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {recentScans.map((scan, index) => (
                  <div
                    key={scan._id || index}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 font-mono">
                          {scan.uid}
                        </p>
                        <p className="text-sm text-gray-500">
                          Scanned: {new Date(scan.scannedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold">
                      New Scan
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 text-white">
        <h3 className="text-xl font-bold mb-4">📋 How to Use RFID System</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-200">
          <li>Connect your ESP32 with MFRC522 module to power</li>
          <li>Ensure the device is connected to the same WiFi network as the server</li>
          <li>Place student RFID cards near the scanner when taking attendance</li>
          <li>View scanned cards in real-time on this dashboard</li>
          <li>Assign new RFID cards to students through the Admin panel</li>
        </ol>
      </div>
    </div>
  );
};
