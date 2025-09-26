import React, { useState, useEffect } from "react";
import {
  FaChalkboardTeacher,
  FaChalkboard,
  FaClipboardList,
  FaBell,
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
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "/teacher/my-classes",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "/teacher/leaves",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
      const token = localStorage.getItem("token");
      await axios.put(
        `/teacher/leave/${leaveId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
