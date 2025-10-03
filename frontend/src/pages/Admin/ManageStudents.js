// frontend/src/pages/ManageStudents.js
import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import { Loader2, User, Cpu, CheckCircle2, AlertCircle, Search, IdCard } from "lucide-react";

const ManageStudents = ({ onAssignmentComplete }) => {
  const [students, setStudents] = useState([]);
  const [unassignedRFIDs, setUnassignedRFIDs] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [rfidTag, setRfidTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message: string }
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, rfidRes] = await Promise.all([
        axios.get("/students"),
        axios.get("/rfid/unassigned"),
      ]);

      // ✅ Only keep students who do NOT already have an RFID assigned
      const unassignedStudents = studentsRes.data.filter((s) => !s.rfidTag);

      setStudents(unassignedStudents);
      setUnassignedRFIDs(rfidRes.data);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setStatus({ type: "error", message: "Failed to load data" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !rfidTag) {
      setStatus({ type: "error", message: "Please select both student and RFID tag" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await axios.post("/students/assign-rfid", {
        studentId,
        rfidTag,
      });

      setStatus({ type: "success", message: res.data.message });

      // ✅ Remove the assigned RFID + student from dropdowns
      setUnassignedRFIDs(unassignedRFIDs.filter((r) => r.uid !== rfidTag));
      setStudents(students.filter((s) => s._id !== studentId));

      setRfidTag("");
      setStudentId("");
      setSearchTerm("");
      setShowDropdown(false);
      if (onAssignmentComplete) onAssignmentComplete();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Error assigning RFID",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.className || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudent = students.find(s => s._id === studentId);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">RFID Assignment</h2>
        <p className="text-gray-600">Assign RFID tags to students for attendance tracking</p>
      </div>

      {/* Status Message */}
      {status && (
        <div
          className={`flex items-center gap-3 p-4 mb-6 rounded-xl text-sm font-medium ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={20} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0" />
          )}
          {status.message}
        </div>
      )}

      {/* Assignment Form */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, or class..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Dropdown */}
              {showDropdown && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        className={`w-full text-left p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          studentId === s._id ? "bg-blue-50 border-blue-200" : ""
                        }`}
                        onClick={() => {
                          setStudentId(s._id);
                          setSearchTerm(s.userId?.name || "");
                          setShowDropdown(false);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{s.userId?.name}</p>
                            <p className="text-sm text-gray-500">{s.userId?.email}</p>
                            {s.className && (
                              <p className="text-xs text-blue-600 font-medium">{s.className}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <User className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p>No students found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Student Display */}
            {selectedStudent && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">{selectedStudent.userId?.name}</p>
                    <p className="text-sm text-blue-700">{selectedStudent.userId?.email}</p>
                    {selectedStudent.className && (
                      <p className="text-xs text-blue-600 font-medium">{selectedStudent.className}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RFID Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select RFID Tag
            </label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={rfidTag}
                onChange={(e) => setRfidTag(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Choose an available RFID tag...</option>
                {unassignedRFIDs.map((u) => (
                  <option key={u._id} value={u.uid}>
                    {u.uid}
                  </option>
                ))}
              </select>
            </div>
            {unassignedRFIDs.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">No unassigned RFID tags available</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !studentId || !rfidTag}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-6 rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Assigning RFID...
              </>
            ) : (
              <>
                <IdCard size={18} />
                Assign RFID Tag
              </>
            )}
          </button>
        </form>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{students.length}</p>
              <p className="text-sm text-blue-700">Students without RFID</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <IdCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">{unassignedRFIDs.length}</p>
              <p className="text-sm text-amber-700">Available RFID tags</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;
