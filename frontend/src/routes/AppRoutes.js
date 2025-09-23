import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from '../pages/Home/LandingPage';

import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

import AdminDashboard from '../pages/Admin/Dashboard';
import ManageStudents from '../pages/Admin/ManageStudents';
import UnassignedRFIDs from "../pages/Admin/UnassignedRFIDs";


import TeacherDashboard from '../pages/Teacher/Dashboard';
import AttendancePage from '../pages/Teacher/AttendancePage';

import StudentDashboard from '../pages/Student/Dashboard';
import AttendanceLog from '../pages/Student/AttendanceLog';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect root to Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/manage-students" element={<ManageStudents />} />
      <Route path="/admin/unassigned" element={<UnassignedRFIDs />} />

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/teacher/attendance" element={<AttendancePage />} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/logs" element={<AttendanceLog />} />

      {/* Catch-all: Optional 404 or redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
