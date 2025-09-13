import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp } from "react-feather"; // Icons for expand/collapse

const ClassStudents = () => {
  const [classStudents, setClassStudents] = useState({});
  const [expandedClasses, setExpandedClasses] = useState({}); // Track expanded/collapsed classes

  // Fetch all students and group by class
  useEffect(() => {
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
  }, []);

  // Toggle expand/collapse
  const toggleClass = (cls) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [cls]: !prev[cls],
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Students by Class
      </h2>

      {Object.keys(classStudents).map((cls) => (
        <div
          key={cls}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-transform hover:scale-[1.02]"
        >
          {/* Class Header */}
          <button
            onClick={() => toggleClass(cls)}
            className="w-full flex justify-between items-center p-5 cursor-pointer bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white font-semibold text-lg focus:outline-none"
          >
            <span>{cls}</span>
            {expandedClasses[cls] ? <ChevronUp /> : <ChevronDown />}
          </button>

          {/* Students List */}
          <div
            className={`transition-max-height duration-500 ease-in-out overflow-hidden ${
              expandedClasses[cls] ? "max-h-96" : "max-h-0"
            }`}
          >
            {classStudents[cls].length > 0 ? (
              <ul className="p-5 space-y-2">
                {classStudents[cls].map((student) => (
                  <li
                    key={student._id}
                    className="p-3 bg-white rounded-lg shadow hover:shadow-md flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {student.userId?.name || student.name || "Unnamed"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {student.userId?.email || student.email || "No email"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">
                      {student.rfidTag ? `RFID: ${student.rfidTag}` : "No RFID"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-gray-500">No students found in this class.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassStudents;
