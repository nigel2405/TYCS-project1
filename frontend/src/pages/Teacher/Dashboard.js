import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Users, BookOpen, BarChart3, CheckCircle } from "lucide-react";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("students");

  // TODO: Replace with API data
  const stats = [
    { label: "My Students", value: 2, icon: <Users size={28} /> },
    { label: "Present Today", value: 0, icon: <CheckCircle size={28} /> },
    { label: "Attendance Rate", value: "0%", icon: <BarChart3 size={28} /> },
    { label: "Total Classes", value: 1, icon: <BookOpen size={28} /> },
  ];

  const students = [
    { id: "S001", name: "John Doe", className: "10A", rfid: "RF12345" },
    { id: "S002", name: "Jane Smith", className: "10A", rfid: "RF67890" },
  ];

  const attendanceLogs = [
    { id: 1, name: "John Doe", className: "10A", date: "2025-08-18", time: "09:10 AM", status: "Present" },
    { id: 2, name: "Jane Smith", className: "10A", date: "2025-08-18", time: "09:15 AM", status: "Late" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-lg rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{stat.label}</h2>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className="text-blue-600">{stat.icon}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-xl font-medium ${
            activeTab === "students" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          My Students
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-4 py-2 rounded-xl font-medium ${
            activeTab === "attendance" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Class Attendance
        </button>
      </div>

      {/* Students Table */}
      {activeTab === "students" && (
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">RFID</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{student.id}</td>
                    <td className="p-3">{student.name}</td>
                    <td className="p-3">{student.className}</td>
                    <td className="p-3">{student.rfid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Attendance Logs */}
      {activeTab === "attendance" && (
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{log.date}</td>
                    <td className="p-3">{log.time}</td>
                    <td className="p-3">{log.name}</td>
                    <td className="p-3">{log.className}</td>
                    <td
                      className={`p-3 font-medium ${
                        log.status === "Present"
                          ? "text-green-600"
                          : log.status === "Late"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {log.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherDashboard;
