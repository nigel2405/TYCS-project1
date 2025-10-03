// src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { FaUser, FaIdCard, FaUserCheck, FaClock } from "react-icons/fa";
import api from "../../services/api";
import ManageStudents from "./ManageStudents";
import UnassignedRFIDs from "./UnassignedRFIDs";
import ClassStudents from "./ClassStudents";
import Sidebar from "../../components/shared/Sidebar";

// ✅ Fixed AssignTeacher component
const AssignTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [className, setClassName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachersRes = await api.get("/class-assignments/teachers");
        const assignmentsRes = await api.get("/class-assignments");
        setTeachers(teachersRes.data);
        setAssignments(assignmentsRes.data);
      } catch (err) {
        console.error("❌ Error fetching teachers/assignments:", err);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!className || !teacherId) {
      alert("Please select both class and teacher");
      return;
    }
    
    try {
      const res = await api.post("/class-assignments/assign", { className, teacherId });
      setAssignments((prev) => [
        ...prev.filter((a) => a.className !== className),
        res.data.assignment,
      ]);
      setClassName("");
      setTeacherId("");
      alert("✅ Teacher assigned successfully!");
    } catch (err) {
      console.error("❌ Error assigning teacher:", err);
      alert("❌ Failed to assign teacher. Please try again.");
    }
  };

  const handleRemoveAssignment = async (classNameToRemove) => {
    if (!window.confirm(`Are you sure you want to remove the teacher assignment for ${classNameToRemove}?`)) {
      return;
    }
    
    try {
      await api.delete(`/class-assignments/remove/${encodeURIComponent(classNameToRemove)}`);
      setAssignments((prev) => prev.filter((a) => a.className !== classNameToRemove));
      alert("✅ Teacher assignment removed successfully!");
    } catch (err) {
      console.error("❌ Error removing assignment:", err);
      alert("❌ Failed to remove assignment. Please try again.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assign Teachers to Classes</h2>
        <p className="text-gray-600">Manage teacher assignments for different classes</p>
      </div>

      {/* Selection Form */}
      <div className="bg-gray-50 p-6 rounded-xl mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors touch-manipulation"
            >
              <option value="">Choose a class...</option>
              <option value="FYBSc CS">FYBSc CS</option>
              <option value="SYBSc CS">SYBSc CS</option>
              <option value="TYBSc CS">TYBSc CS</option>
              <option value="FYBAF">FYBAF</option>
              <option value="SYBAF">SYBAF</option>
              <option value="TYBAF">TYBAF</option>
              <option value="FYBMS">FYBMS</option>
              <option value="SYBMS">SYBMS</option>
              <option value="TYBMS">TYBMS</option>
              <option value="FYBSc IT">FYBSc IT</option>
              <option value="SYBSc IT">SYBSc IT</option>
              <option value="TYBSc IT">TYBSc IT</option>
              <option value="FYBSc">FYBSc</option>
              <option value="SYBSc">SYBSc</option>
              <option value="TYBSc">TYBSc</option>
              <option value="FYBA">FYBA</option>
              <option value="SYBA">SYBA</option>
              <option value="TYBA">TYBA</option>
              <option value="FYBCom">FYBCom</option>
              <option value="SYBCom">SYBCom</option>
              <option value="TYBCom">TYBCom</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Teacher
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors touch-manipulation"
            >
              <option value="">Choose a teacher...</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              onClick={handleAssign}
              disabled={!className || !teacherId}
              className="w-full bg-blue-500 text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium touch-manipulation min-h-[48px]"
            >
              Assign Teacher
            </button>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Class</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Assigned Teacher</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaUserCheck className="text-4xl text-gray-300 mb-2" />
                      <p>No teacher assignments found</p>
                      <p className="text-sm">Start by assigning teachers to classes above</p>
                    </div>
                  </td>
                </tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{a.className}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{a.teacherId?.name || "Unassigned"}</span>
                      {a.teacherId?.email && (
                        <div className="text-sm text-gray-500">{a.teacherId.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRemoveAssignment(a.className)}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
                        title="Remove teacher assignment"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("classes");
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    unassignedRFIDs: 0,
    assignedRFIDs: 0,
    attendanceRate: 0,
  });
  const adminName = localStorage.getItem("adminName") || "Admin";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, attendanceRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/attendance/rate"),
        ]);
        setStats({
          ...statsRes.data.stats,
          attendanceRate: attendanceRes.data?.rate || 0,
        });
      } catch (err) {
        console.error("❌ Error loading dashboard:", err);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar userRole="admin" userName={adminName}>
        {/* Quick Stats in Sidebar */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
            <p className="text-blue-600 text-2xl font-bold">{stats.students}</p>
            <p className="text-xs text-gray-600 font-medium">Students</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl text-center border border-emerald-100">
            <p className="text-emerald-600 text-2xl font-bold">{stats.teachers}</p>
            <p className="text-xs text-gray-600 font-medium">Teachers</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-100">
            <p className="text-amber-600 text-2xl font-bold">{stats.assignedRFIDs}</p>
            <p className="text-xs text-gray-600 font-medium">RFIDs</p>
          </div>
          <div className="bg-violet-50 p-3 rounded-xl text-center border border-violet-100">
            <p className="text-violet-600 text-2xl font-bold">{Math.round((stats.attendanceRate || 0) * 100)}%</p>
            <p className="text-xs text-gray-600 font-medium">Attendance</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab("classes")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              activeTab === "classes" 
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" 
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            Classes
          </button>
          <button
            onClick={() => setActiveTab("rfid")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              activeTab === "rfid" 
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" 
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            RFID Assignment
          </button>
          <button
            onClick={() => setActiveTab("unassigned")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              activeTab === "unassigned" 
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" 
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            Unassigned RFIDs
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              activeTab === "teachers" 
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" 
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            Assign Teachers
          </button>
        </div>
      </Sidebar>

      {/* Main Content - with left margin for fixed sidebar */}
      <div className="lg:ml-80 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <header className="mb-6 sm:mb-8 mt-16 lg:mt-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Welcome back, {adminName}. Here's what's happening with your system today.
                </p>
              </div>
            </div>
          </header>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              label="Total Students"
              value={stats.students}
              icon={<FaUser className="text-2xl" />}
              color="blue"
              trend="+12% from last month"
            />
            <StatCard
              label="Total Teachers"
              value={stats.teachers}
              icon={<FaUserCheck className="text-2xl" />}
              color="emerald"
              trend="Active faculty"
            />
            <StatCard
              label="Assigned RFIDs"
              value={stats.assignedRFIDs}
              icon={<FaIdCard className="text-2xl" />}
              color="amber"
              trend={`${stats.unassignedRFIDs} unassigned`}
            />
            <StatCard
              label="Unassigned RFIDs"
              value={stats.unassignedRFIDs}
              icon={<FaIdCard className="text-2xl" />}
              color="red"
              trend="Available for assignment"
            />
            <StatCard
              label="Attendance Rate"
              value={`${Math.round((stats.attendanceRate || 0) * 100)}%`}
              icon={<FaClock className="text-2xl" />}
              color="violet"
              trend="This month average"
            />
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {activeTab === "classes" && <ClassStudents />}
            {activeTab === "rfid" && (
              <div className="p-6">
                <ManageStudents />
              </div>
            )}
            {activeTab === "unassigned" && (
              <div className="p-6">
                <UnassignedRFIDs />
              </div>
            )}
            {activeTab === "teachers" && (
              <div className="p-6">
                <AssignTeacher />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components ---
const StatCard = ({ label, value, icon, color = "blue", trend }) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      icon: "text-blue-500",
      iconBg: "bg-blue-100",
      value: "text-gray-900",
      trend: "text-blue-600"
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-100", 
      icon: "text-emerald-500",
      iconBg: "bg-emerald-100",
      value: "text-gray-900",
      trend: "text-emerald-600"
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      icon: "text-amber-500", 
      iconBg: "bg-amber-100",
      value: "text-gray-900",
      trend: "text-amber-600"
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-100",
      icon: "text-red-500",
      iconBg: "bg-red-100", 
      value: "text-gray-900",
      trend: "text-red-600"
    },
    violet: {
      bg: "bg-violet-50",
      border: "border-violet-100",
      icon: "text-violet-500",
      iconBg: "bg-violet-100",
      value: "text-gray-900", 
      trend: "text-violet-600"
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} ${colors.border} border p-4 sm:p-6 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1 truncate">{label}</p>
          <h3 className={`text-2xl sm:text-3xl font-bold ${colors.value} mb-2`}>{value}</h3>
          {trend && (
            <p className={`text-xs ${colors.trend} font-medium truncate`}>{trend}</p>
          )}
        </div>
        <div className={`${colors.iconBg} p-2 sm:p-3 rounded-xl ${colors.icon} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
          <div className="text-lg sm:text-2xl">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
