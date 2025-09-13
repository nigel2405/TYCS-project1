import React from "react";
import { FaChalkboardTeacher, FaUsers, FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  // Example: Getting teacher name from localStorage (set after login)
  const teacherName = localStorage.getItem("teacherName") || "Teacher";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("teacherId");
    navigate("/login");
  };

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
              <h3 className="text-lg font-semibold text-gray-700">
                {teacherName}
              </h3>
              <p className="text-sm text-gray-500">Teacher</p>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex flex-col gap-3">
            <button
              className="flex items-center gap-3 px-4 py-2 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <FaUsers /> My Students
            </button>
            <button
              className="flex items-center gap-3 px-4 py-2 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <FaClipboardList /> Class Attendance
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
          <p className="text-sm text-gray-500">
            Welcome back, {teacherName}! 👋
          </p>
        </div>

        {/* Placeholder content */}
        <div className="bg-white shadow-lg rounded-2xl p-6 text-gray-500 text-center">
          <p>Select an option from the sidebar to continue. 📚</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
