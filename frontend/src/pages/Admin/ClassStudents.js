import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Users, UserCheck, UserX, CreditCard } from "react-feather"; // Icons for expand/collapse

const ClassStudents = () => {
  const [classStudents, setClassStudents] = useState({});
  const [expandedClasses, setExpandedClasses] = useState({}); // Track expanded/collapsed classes

  // Fetch all students and group by class
  const fetchStudents = () => {
    axios
      .get("http://localhost:5000/api/students")
      .then((res) => {
        const grouped = res.data.reduce((acc, student) => {
          const cls = student.className || "Unassigned";
          if (!acc[cls]) acc[cls] = [];
          acc[cls].push(student);
          return acc;
        }, {});
        setClassStudents(grouped);
      })
      .catch((err) => console.error("Error fetching students:", err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle RFID removal
  const handleRemoveRFID = async (studentId, studentName, rfidTag) => {
    if (!window.confirm(`Are you sure you want to remove RFID assignment from ${studentName}?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/students/remove-rfid/${studentId}`);
      alert(`RFID removed from ${studentName} successfully!`);
      // Refresh the student list
      fetchStudents();
    } catch (err) {
      console.error("Error removing RFID:", err);
      alert("Failed to remove RFID assignment");
    }
  };

  // Toggle expand/collapse
  const toggleClass = (cls) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [cls]: !prev[cls],
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Students by Class</h2>
        <p className="text-gray-600">Manage student enrollments and RFID assignments by class</p>
      </div>

      <div className="space-y-4">
        {Object.keys(classStudents).length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">Students will appear here once they are registered</p>
          </div>
        ) : (
          Object.keys(classStudents).map((cls) => {
            const studentsInClass = classStudents[cls];
            const assignedCount = studentsInClass.filter(s => s.rfidTag).length;
            const unassignedCount = studentsInClass.length - assignedCount;
            
            return (
              <div
                key={cls}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Class Header */}
                <button
                  onClick={() => toggleClass(cls)}
                  className="w-full flex justify-between items-center p-6 cursor-pointer bg-gradient-to-r from-blue-50 to-violet-50 hover:from-blue-100 hover:to-violet-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">{cls}</h3>
                      <p className="text-sm text-gray-600">
                        {studentsInClass.length} students • {assignedCount} with RFID • {unassignedCount} unassigned
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {expandedClasses[cls] ? 'Collapse' : 'Expand'}
                    </span>
                    {expandedClasses[cls] ? 
                      <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </button>

                {/* Students List */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedClasses[cls] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {studentsInClass.length > 0 ? (
                    <div className="border-t border-gray-200">
                      <div className="max-h-80 overflow-y-auto">
                        {studentsInClass.map((student, index) => (
                          <div
                            key={student._id}
                            className={`p-4 flex justify-between items-center hover:bg-gray-50 transition-colors ${
                              index !== studentsInClass.length - 1 ? 'border-b border-gray-100' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${student.rfidTag ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                {student.rfidTag ? 
                                  <UserCheck className="h-4 w-4 text-emerald-600" /> :
                                  <UserX className="h-4 w-4 text-gray-400" />
                                }
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {student.userId?.name || student.name || "Unnamed"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {student.userId?.email || student.email || "No email"}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {student.rfidTag ? (
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1 bg-emerald-50 px-3 py-1 rounded-full">
                                    <CreditCard className="h-3 w-3 text-emerald-600" />
                                    <span className="text-sm font-medium text-emerald-700">
                                      {student.rfidTag}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveRFID(
                                      student._id, 
                                      student.userId?.name || student.name || "Unnamed", 
                                      student.rfidTag
                                    )}
                                    className="bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
                                    title="Remove RFID assignment"
                                  >
                                    Remove RFID
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                                  No RFID assigned
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500 border-t border-gray-200">
                      <UserX className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p>No students found in this class</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClassStudents;
