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
    if (!className || !teacherId) return alert("Please select both class and teacher");
    try {
      const res = await api.post("/class-assignments/assign", { className, teacherId });
      setAssignments((prev) => [
        ...prev.filter((a) => a.className !== className),
        res.data.assignment,
      ]);
    } catch (err) {
      console.error("❌ Error assigning teacher:", err);
      alert("Failed to assign teacher");
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Assign Teachers to Classes</h2>

      {/* Selection Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full"
        >
          <option value="">Select Class</option>
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

        <select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full"
        >
          <option value="">Select Teacher</option>
          {teachers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} ({t.email})
            </option>
          ))}
        </select>

        <button
          onClick={handleAssign}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow"
        >
          Assign
        </button>
      </div>

      {/* Assignments Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <tr>
              <th className="p-3">Class</th>
              <th className="p-3">Assigned Teacher</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a._id} className="border-b hover:bg-gray-100 transition">
                <td className="p-3">{a.className}</td>
                <td className="p-3">{a.teacherId?.name || "Unassigned"}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      {/* Fixed Sidebar */}
      <Sidebar userRole="admin" userName={adminName}>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-blue-600 text-2xl font-bold">{stats.students}</p>
            <p className="text-xs text-gray-600">Students</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-green-600 text-2xl font-bold">{stats.teachers}</p>
            <p className="text-xs text-gray-600">Teachers</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <p className="text-orange-600 text-2xl font-bold">{stats.assignedRFIDs}</p>
            <p className="text-xs text-gray-600">RFIDs</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <p className="text-purple-600 text-2xl font-bold">{Math.round((stats.attendanceRate || 0) * 100)}%</p>
            <p className="text-xs text-gray-600">Attendance</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab("classes")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === "classes" ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100"
            }`}
          >
            Classes
          </button>
          <button
            onClick={() => setActiveTab("rfid")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === "rfid" ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100"
            }`}
          >
            RFID Assignment
          </button>
          <button
            onClick={() => setActiveTab("unassigned")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === "unassigned" ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100"
            }`}
          >
            Unassigned RFIDs
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === "teachers" ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100"
            }`}
          >
            Assign Teachers
          </button>
        </div>
      </Sidebar>

      {/* Main Content - with left margin for fixed sidebar */}
      <div className="ml-72 min-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-red-500 to-gray-700 bg-clip-text text-transparent drop-shadow-lg">
            Admin Dashboard
          </h1>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          <StatCard
            label="Total Students"
            value={stats.students}
            icon={<FaUser className="text-3xl text-blue-500" />}
          />
          <StatCard
            label="Total Teachers"
            value={stats.teachers}
            icon={<FaUserCheck className="text-3xl text-green-500" />}
          />
          <StatCard
            label="Assigned RFID Cards"
            value={stats.assignedRFIDs}
            icon={<FaIdCard className="text-3xl text-green-600" />}
          />
          <StatCard
            label="Unassigned RFID Cards"
            value={stats.unassignedRFIDs}
            icon={<FaIdCard className="text-3xl text-red-500" />}
          />
          <StatCard
            label="Avg. Attendance Rate"
            value={`${Math.round((stats.attendanceRate || 0) * 100)}%`}
            icon={<FaClock className="text-3xl text-indigo-500" />}
          />
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-500 ease-in-out transform">
          {activeTab === "classes" && <ClassStudents />}
          {activeTab === "rfid" && (
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200">
              <ManageStudents />
            </div>
          )}
          {activeTab === "unassigned" && (
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200">
              <UnassignedRFIDs />
            </div>
          )}
          {activeTab === "teachers" && <AssignTeacher />}
        </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components ---
const StatCard = ({ label, value, icon }) => (
  <div className="p-5 rounded-2xl shadow-lg border bg-white/70 backdrop-blur-md flex justify-between items-center transition transform hover:-translate-y-2 hover:shadow-2xl">
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
    </div>
    <div className="p-3 bg-white rounded-full shadow">{icon}</div>
  </div>
);

export default AdminDashboard;
