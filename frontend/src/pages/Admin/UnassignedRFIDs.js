// frontend/src/pages/UnassignedRFIDs.js
import React, { useEffect, useState } from "react";
import axios from "../../services/api";

const UnassignedRFIDs = () => {
  const [rfids, setRfids] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchRFIDs = async () => {
      try {
        const res = await axios.get("/rfid/unassigned");
        setRfids(res.data);
      } catch (err) {
        console.error("Error fetching unassigned RFIDs", err);
      }
    };
    fetchRFIDs();
  }, []);

  // ✅ Filtering logic
  const filteredRFIDs = rfids.filter((tag) => {
    const matchesSearch = tag.uid.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter
      ? new Date(tag.scannedAt).toLocaleDateString() ===
        new Date(dateFilter).toLocaleDateString()
      : true;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          📌 Unassigned RFID Tags
        </h2>

        {/* 🔍 Search + Date Filter */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by UID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-left">
                <th className="p-3 font-medium">UID</th>
                <th className="p-3 font-medium">Scanned At</th>
              </tr>
            </thead>
            <tbody>
              {filteredRFIDs.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="text-center p-6 text-gray-500 italic"
                  >
                    🚫 No matching unassigned RFID tags
                  </td>
                </tr>
              ) : (
                filteredRFIDs.map((tag, idx) => (
                  <tr
                    key={tag._id}
                    className={`hover:bg-blue-50 transition ${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="p-3 text-gray-700 font-mono">{tag.uid}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(tag.scannedAt).toLocaleString()}
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

export default UnassignedRFIDs;
