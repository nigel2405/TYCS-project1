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
import Sidebar from "../../components/shared/Sidebar";

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
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-50 to-indigo-50">
      {/* Fixed Sidebar */}
      <Sidebar userRole="teacher" userName={teacherName}>
        {/* Navigation */}
        <div className="flex flex-col gap-3">
          <NavTab
            label="My Classes"
            icon={<FaChalkboard />}
            active={activeTab === "classes"}
            onClick={() => setActiveTab("classes")}
          />
          <NavTab
            label="Class Attendance"
            icon={<FaClipboardList />}
            active={activeTab === "attendance"}
            onClick={() => setActiveTab("attendance")}
          />
          <NavTab
            label="Blacklist"
            icon={<FaExclamationTriangle />}
            active={activeTab === "blacklist"}
            onClick={() => setActiveTab("blacklist")}
          />
          <NavTab
            label="Leave Applications"
            icon={<FaBell />}
            active={activeTab === "leaves"}
            onClick={() => setActiveTab("leaves")}
            badge={pendingLeaves}
          />
        </div>
      </Sidebar>

      {/* Main Content - with left margin for fixed sidebar */}
      <div className="ml-72 min-h-screen overflow-y-auto">
        <div className="p-10">
          <div className="mb-10">
          <h2 className="text-3xl font-bold text-indigo-700">
            Teacher Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {teacherName}! 👋
          </p>
        </div>

        {/* Classes Tab */}
        {activeTab === "classes" && (
          <div className="grid gap-6">
            {classes.length > 0 ? (
              classes.map((cls) => (
                <div
                  key={cls.className}
                  className="bg-white border rounded-2xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleClass(cls.className)}
                    className="w-full p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white flex justify-between items-center font-semibold text-lg"
                  >
                    {cls.className}
                    <span>
                      {expandedClasses[cls.className] ? "▲" : "▼"}
                    </span>
                  </button>

                  <div
                    className={`transition-max-height duration-300 ease-in-out overflow-hidden ${
                      expandedClasses[cls.className] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    {cls.students && cls.students.length > 0 ? (
                      <ul className="p-4 space-y-2 bg-gray-50">
                        {cls.students.map((s) => (
                          <li
                            key={s._id}
                            className="p-3 bg-white rounded-lg shadow flex justify-between items-center hover:bg-indigo-50"
                          >
                            <span className="font-medium text-gray-700">
                              {s.userId?.name || "Unnamed Student"}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {s.userId?.email || "No email"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-4 text-gray-500">No students assigned</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No classes assigned yet.</p>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && <TeacherAttendanceSection />}

        {/* Blacklist Tab */}
        {activeTab === "blacklist" && <BlacklistSection />}

        {/* Leave Applications Tab */}
        {activeTab === "leaves" && (
          <div className="space-y-5">
            {leaveApplications.length > 0 ? (
              leaveApplications.map((leave) => (
                <div
                  key={leave._id}
                  className="bg-white border rounded-2xl shadow-md p-5 flex justify-between items-center hover:shadow-lg transition cursor-pointer"
                  onClick={() => setSelectedLeave(leave)}
                >
                  <div>
                    <p className="font-semibold text-indigo-700">
                      {leave.student?.userId?.name}
                    </p>
                    <p className="text-gray-500 text-sm">{leave.reason}</p>
                    <p className="text-gray-400 text-xs">
                      <strong>Date:</strong>{" "}
                      {new Date(leave.date).toLocaleDateString()}
                    </p>
                    <p
                      className={`text-sm font-semibold mt-1 ${
                        leave.status === "approved"
                          ? "text-green-600"
                          : leave.status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      Status: {leave.status}
                    </p>
                  </div>
                  {leave.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveAction(leave._id, "approved");
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg shadow hover:opacity-90"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveAction(leave._id, "rejected");
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:opacity-90"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No leave applications found.</p>
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

const NavTab = ({ label, icon, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition border ${
      active
        ? "bg-indigo-600 text-white border-indigo-600 shadow"
        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
    }`}
  >
    <span className="flex items-center gap-3">
      <span
        className={`text-lg ${active ? "text-white" : "text-indigo-600"}`}
      >
        {icon}
      </span>
      {label}
    </span>
    {badge > 0 && (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          active
            ? "bg-white text-indigo-700"
            : "bg-red-500 text-white"
        }`}
      >
        {badge}
      </span>
    )}
  </button>
);

// Leave Application Modal
const LeaveApplicationModal = ({ leave, onClose, onAction }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-2xl w-[500px] max-h-[85vh] overflow-auto shadow-2xl relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
      >
        ✖
      </button>

      <h3 className="font-bold text-2xl mb-4 text-indigo-700 text-center">
        Leave Application
      </h3>

      <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed mb-4 font-sans">
        {leave.application}
      </pre>

      <div className="border-t pt-3 text-sm text-gray-600 space-y-1">
        <p>
          <strong>Student:</strong>{" "}
          {leave.student?.userId?.name || "Unknown"}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(leave.date).toLocaleDateString()}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={
              leave.status === "approved"
                ? "text-green-600 font-semibold"
                : leave.status === "rejected"
                ? "text-red-600 font-semibold"
                : "text-yellow-600 font-semibold"
            }
          >
            {leave.status}
          </span>
        </p>
      </div>

      {leave.status === "pending" && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              onAction(leave._id, "approved");
              onClose();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={() => {
              onAction(leave._id, "rejected");
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      )}
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
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">📊 Class Attendance Management</h2>
        
        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-100">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-purple-200 border border-white/30 focus:border-white focus:ring-2 focus:ring-white/50 outline-none"
            >
              <option value="" className="text-gray-800">Choose a class...</option>
              {classes.map((cls) => (
                <option key={cls.className} value={cls.className} className="text-gray-800">
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
          
          {/* View Mode */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-100">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 focus:border-white focus:ring-2 focus:ring-white/50 outline-none"
            >
              <option value="daily" className="text-gray-800">📅 Daily View</option>
              <option value="monthly" className="text-gray-800">📊 Monthly Summary</option>
            </select>
          </div>
          
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-100">
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
              className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 focus:border-white focus:ring-2 focus:ring-white/50 outline-none"
            />
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-100">Quick Access</label>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 text-white font-medium border border-white/30"
            >
              📍 Today
            </button>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-indigo-100 text-indigo-700">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-700 mr-3"></div>
            Loading attendance data...
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

      {/* Attendance Display */}
      {!loading && !error && selectedClass && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
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

// Daily Attendance View Component
const DailyAttendanceView = ({ attendanceData, selectedDate, selectedClass }) => {
  const presentCount = attendanceData.filter(record => record.status === 'present').length;
  const totalCount = attendanceData.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          📅 Daily Attendance - {selectedClass}
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">{new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          })}</p>
          <p className="text-lg font-semibold text-indigo-600">
            {presentCount}/{totalCount} Present ({attendanceRate}%)
          </p>
        </div>
      </div>

      {attendanceData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">No attendance records found for this date.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {attendanceData.map((record, index) => (
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
                    {record.student?.userId?.name || 'Unknown Student'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {record.student?.userId?.email || 'No email'}
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
  );
};

// Monthly Attendance View Component
const MonthlyAttendanceView = ({ attendanceData, selectedDate, selectedClass, getAttendanceRate, openStudentDetails }) => {
  const monthName = new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          📊 Monthly Summary - {selectedClass}
        </h3>
        <p className="text-lg font-semibold text-indigo-600">{monthName}</p>
      </div>

      {attendanceData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">No attendance data available for this month.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <th className="text-left py-4 px-6 rounded-l-xl font-semibold">Student</th>
                <th className="text-left py-4 px-4 font-semibold">Email</th>
                <th className="text-center py-4 px-4 font-semibold">Present Days</th>
                <th className="text-center py-4 px-4 font-semibold">Total Days</th>
                <th className="text-center py-4 px-6 rounded-r-xl font-semibold">Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((student, index) => {
                const rate = getAttendanceRate(student.presentDays, student.totalDays);
                return (
                  <tr
                    key={student.student?._id || index}
                    onClick={() => openStudentDetails(student.student?._id)}
                    className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all duration-200"
                  >
                    <td className="py-4 px-6 font-medium text-gray-800">
                      {student.student?.userId?.name || 'Unknown Student'}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {student.student?.userId?.email || 'No email'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                        {student.presentDays}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                        {student.totalDays}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className={`w-16 h-3 rounded-full overflow-hidden ${
                          rate >= 75 ? 'bg-green-200' : rate >= 50 ? 'bg-yellow-200' : 'bg-red-200'
                        }`}>
                          <div 
                            className={`h-full transition-all duration-500 ${
                              rate >= 75 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${rate}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold text-sm ${
                          rate >= 75 ? 'text-green-600' : rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {rate}%
                        </span>
                      </div>
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
