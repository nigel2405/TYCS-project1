// frontend/src/pages/ManageStudents.js
import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import { Loader2, User, Cpu, CheckCircle2, AlertCircle } from "lucide-react";

const ManageStudents = ({ onAssignmentComplete }) => {
  const [students, setStudents] = useState([]);
  const [unassignedRFIDs, setUnassignedRFIDs] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [rfidTag, setRfidTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message: string }
  const [searchTerm, setSearchTerm] = useState("");

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
      setStatus({ type: "error", message: "Please select both fields" });
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

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-2xl rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Assign RFID to Student
      </h2>

      {/* Status Message */}
      {status && (
        <div
          className={`flex items-center gap-2 p-3 mb-4 rounded-lg text-sm ${status.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
            }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Student selection */}
        {/* Student selection with search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Student
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />

            {/* Search input */}
            <input
              type="text"
              placeholder="Type student name, email or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              className="w-full pl-10 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />

            {/* Dropdown list of results */}
            {searchTerm && (
              <ul className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto">
                {students
                  .filter(
                    (s) =>
                      s.userId?.name.toLowerCase().includes(searchTerm) ||
                      s.userId?.email.toLowerCase().includes(searchTerm) ||
                      (s.className || "").toLowerCase().includes(searchTerm)
                  )
                  .map((s) => (
                    <li
                      key={s._id}
                      className={`p-2 cursor-pointer hover:bg-blue-100 ${studentId === s._id ? "bg-blue-50" : ""
                        }`}
                      onClick={() => {
                        setStudentId(s._id);
                        setSearchTerm(s.userId?.name); // show name in input
                      }}
                    >
                      {s.userId?.name} ({s.userId?.email})
                      {s.className ? ` - ${s.className}` : ""}
                    </li>
                  ))}
                {/* If no match */}
                {students.filter(
                  (s) =>
                    s.userId?.name.toLowerCase().includes(searchTerm) ||
                    s.userId?.email.toLowerCase().includes(searchTerm) ||
                    (s.className || "").toLowerCase().includes(searchTerm)
                ).length === 0 && (
                    <li className="p-2 text-gray-500">No student found</li>
                  )}
              </ul>
            )}
          </div>
        </div>



        {/* RFID selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select RFID Tag
          </label>
          <div className="relative">
            <Cpu className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              value={rfidTag}
              onChange={(e) => setRfidTag(e.target.value)}
              className="w-full pl-10 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">-- Choose an RFID Tag --</option>
              {unassignedRFIDs.map((u) => (
                <option key={u._id} value={u.uid}>
                  {u.uid}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Assigning...
            </>
          ) : (
            "Assign RFID"
          )}
        </button>
      </form>
    </div>
  );
};

export default ManageStudents;
