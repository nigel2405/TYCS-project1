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
          <div className="flex flex-col gap-2">
            <NavTab label="My Classes" icon={<FaChalkboard />} active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} />
            <NavTab label="Class Attendance" icon={<FaClipboardList />} active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
            <NavTab label="Leave Applications" icon={<FaBell />} active={activeTab === 'leaves'} onClick={() => setActiveTab('leaves')} badge={pendingLeaves} />
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
          <TeacherAttendanceSection />
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
const NavTab = ({ label, icon, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition border ${
      active ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
    }`}
  >
    <span className="flex items-center gap-3">
      <span className={`text-lg ${active ? 'text-white' : 'text-indigo-600'}`}>{icon}</span>
      {label}
    </span>
    {badge > 0 && (
      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${active ? 'bg-white text-indigo-700' : 'bg-red-500 text-white'}`}>
        {badge}
      </span>
    )}
  </button>
);

const TeacherAttendanceSection = () => {
  const [month, setMonth] = React.useState(new Date().getMonth() + 1);
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [summary, setSummary] = React.useState([]);
  const [classNames, setClassNames] = React.useState([]);
  const [selectedClass, setSelectedClass] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [details, setDetails] = React.useState(null); // modal details

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const qs = new URLSearchParams({ month: String(month), year: String(year), ...(selectedClass ? { className: selectedClass } : {}) });
      const res = await axios.get(`http://localhost:5000/api/teacher/class-attendance?${qs.toString()}` , {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data.summary || []);
      setClassNames(res.data.classNames || []);
    } catch (err) {
      setError("Failed to load class attendance");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, selectedClass]);

  const pct = (s) => (s.totalDays ? Math.round((s.presentDays / s.totalDays) * 100) : 0);

  const openDetails = async (studentId) => {
    try {
      const token = localStorage.getItem("token");
      const qs = new URLSearchParams({ month: String(month), year: String(year), className: selectedClass || (classNames[0] || '') });
      const res = await axios.get(`http://localhost:5000/api/teacher/class-attendance/details?${qs.toString()}` , {
        headers: { Authorization: `Bearer ${token}` },
      });
      const records = res.data.records.filter(r => r.student?._id === studentId);
      const student = records[0]?.student;
      setDetails({ student, records });
    } catch (e) {
      setError('Failed to load details');
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <div className="flex gap-3 mb-4 items-center">
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border p-2 rounded">
          <option value="">All Classes</option>
          {classNames.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))} className="border p-2 rounded">
          {[...Array(12)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </select>
        <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10) || year)} className="border p-2 rounded w-28" />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && summary.length === 0 && <p className="text-gray-500">No records.</p>}

      {summary.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Student</th>
              <th className="py-2">Email</th>
              <th className="py-2">Present</th>
              <th className="py-2">Total</th>
              <th className="py-2">Rate</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s) => (
              <tr key={s.student?._id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => openDetails(s.student?._id)}>
                <td className="py-2">{s.student?.userId?.name || "Unknown"}</td>
                <td className="py-2">{s.student?.userId?.email || ""}</td>
                <td className="py-2">{s.presentDays}</td>
                <td className="py-2">{s.totalDays}</td>
                <td className="py-2 font-semibold">{pct(s)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {details && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[600px] max-h-[80vh] overflow-auto relative">
            <button className="absolute right-3 top-3 text-gray-500" onClick={() => setDetails(null)}>✖</button>
            <h3 className="text-xl font-bold mb-4 text-indigo-700">{details.student?.userId?.name} - Daily Records</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {details.records.map((r) => (
                  <tr key={r._id} className="border-b">
                    <td className="py-2">{new Date(r.date).toLocaleDateString()}</td>
                    <td className={`py-2 ${r.status === 'present' ? 'text-green-600' : 'text-red-600'}`}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
