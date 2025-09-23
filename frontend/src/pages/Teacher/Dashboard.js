import React, { useState, useEffect } from "react";
import { FaChalkboardTeacher, FaChalkboard, FaClipboardList, FaSignOutAlt, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
        const res = await axios.get("http://localhost:5000/api/teacher/my-classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        const res = await axios.get("http://localhost:5000/api/teacher/leaves", {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("teacherId");
    navigate("/login");
  };

  const handleLeaveAction = async (leaveId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/teacher/leave/${leaveId}`,
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

  const pendingLeaves = leaveApplications.filter((l) => l.status === "pending").length;

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-indigo-50 to-purple-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-lg p-6 flex flex-col justify-between">
        <div>
          {/* Teacher Info */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <FaChalkboardTeacher className="text-indigo-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">{teacherName}</h3>
              <p className="text-sm text-gray-500">Teacher</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setActiveTab("classes")}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl font-medium ${activeTab === "classes"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <FaChalkboard /> My Classes
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl font-medium ${activeTab === "attendance"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <FaClipboardList /> Class Attendance
            </button>
            <button
              onClick={() => setActiveTab("leaves")}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl font-medium relative ${activeTab === "leaves"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <FaBell /> Leave Applications
              {pendingLeaves > 0 && (
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  {pendingLeaves}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-indigo-700">Teacher Dashboard</h2>
          <p className="text-sm text-gray-500">Welcome back, {teacherName}! 👋</p>
        </div>

        {/* Classes Tab */}
        {activeTab === "classes" && (
          <div className="space-y-4">
            {classes.length > 0 ? (
              classes.map((cls) => (
                <div key={cls.className} className="border rounded-lg shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleClass(cls.className)}
                    className="w-full p-4 bg-indigo-500 text-white flex justify-between items-center font-semibold"
                  >
                    {cls.className}
                    <span>{expandedClasses[cls.className] ? "▲" : "▼"}</span>
                  </button>

                  <div
                    className={`transition-max-height duration-300 ease-in-out overflow-hidden ${expandedClasses[cls.className] ? "max-h-96" : "max-h-0"
                      }`}
                  >
                    {cls.students && cls.students.length > 0 ? (
                      <ul className="p-4 space-y-2 bg-gray-50">
                        {cls.students.map((s) => (
                          <li key={s._id} className="p-2 bg-white rounded shadow flex justify-between">
                            <span>{s.userId?.name || "Unnamed Student"}</span>
                            <span className="text-gray-500 text-sm">{s.userId?.email || "No email"}</span>
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
        {activeTab === "attendance" && (
          <div className="bg-white shadow-lg rounded-2xl p-6 text-gray-500 text-center">
            <p>Attendance module coming soon. 📊</p>
          </div>
        )}

        {/* Leave Applications Tab */}
        {activeTab === "leaves" && (
          <div className="space-y-4">
            {leaveApplications.length > 0 ? (
              leaveApplications.map((leave) => (
                <div
                  key={leave._id}
                  className="border rounded-lg shadow-md p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => setSelectedLeave(leave)}
                >
                  <div>
                    <p className="font-semibold">{leave.student?.userId?.name}</p>
                    <p className="text-gray-500 text-sm">{leave.reason}</p>
                    <p className="text-gray-400 text-xs">
                      <strong>Date:</strong> {new Date(leave.date).toLocaleDateString()}
                    </p>
                    <p
                      className={`text-sm font-semibold mt-1 ${leave.status === "approved"
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
                        className="px-3 py-1 bg-green-500 text-white rounded hover:opacity-90"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveAction(leave._id, "rejected");
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:opacity-90"
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
        {/* Leave Application Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-auto shadow-lg relative">
              {/* Close button */}
              <button
                onClick={() => setSelectedLeave(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-black"
              >
                ✖
              </button>

              <h3 className="font-bold text-xl mb-4 text-indigo-700 text-center">
                Leave Application
              </h3>

              {/* Application text */}
              <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed mb-4 font-sans">
                {selectedLeave.application}
              </pre>

              {/* Extra info */}
              <div className="border-t pt-3 text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Student:</strong>{" "}
                  {selectedLeave.student?.userId?.name || "Unknown"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedLeave.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      selectedLeave.status === "approved"
                        ? "text-green-600 font-semibold"
                        : selectedLeave.status === "rejected"
                          ? "text-red-600 font-semibold"
                          : "text-yellow-600 font-semibold"
                    }
                  >
                    {selectedLeave.status}
                  </span>
                </p>
              </div>

              {/* Approve/Reject buttons if pending */}
              {selectedLeave.status === "pending" && (
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => {
                      handleLeaveAction(selectedLeave._id, "approved");
                      setSelectedLeave(null);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleLeaveAction(selectedLeave._id, "rejected");
                      setSelectedLeave(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherDashboard;
