import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/Home/LandingPage";

// Auth
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Admin
import AdminDashboard from "../pages/Admin/Dashboard";
import ManageStudents from "../pages/Admin/ManageStudents";
import UnassignedRFIDs from "../pages/Admin/UnassignedRFIDs";
import TeacherRegister from "../pages/Teacher/Register";

// Teacher
import TeacherDashboard from "../pages/Teacher/Dashboard";
import AttendancePage from "../pages/Teacher/AttendancePage";

// Student
import StudentDashboard from "../pages/Student/Dashboard";
import AttendanceLog from "../pages/Student/AttendanceLog";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/manage-students" element={<ManageStudents />} />
      <Route path="/admin/unassigned" element={<UnassignedRFIDs />} />
      <Route path="/teacher/register" element={<TeacherRegister />} />

      {/* Teacher */}
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/teacher/attendance" element={<AttendancePage />} />

      {/* Student */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/logs" element={<AttendanceLog />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
