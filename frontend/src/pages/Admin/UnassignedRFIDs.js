// frontend/src/pages/UnassignedRFIDs.js
import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import { Search, Calendar, X, IdCard, Clock } from "lucide-react";

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
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unassigned RFID Tags</h2>
        <p className="text-gray-600">
          View and manage RFID tags that haven't been assigned to students yet
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gray-50 p-6 rounded-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search RFID Tags
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by UID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {dateFilter && (
            <div className="flex items-end">
              <button
                onClick={() => setDateFilter("")}
                className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-200 font-medium"
              >
                <X size={16} />
                Clear Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <IdCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{rfids.length}</p>
              <p className="text-sm text-blue-700">Total Unassigned</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">{filteredRFIDs.length}</p>
              <p className="text-sm text-emerald-700">Filtered Results</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">
                {rfids.length > 0 ? Math.ceil((Date.now() - new Date(rfids[rfids.length - 1]?.scannedAt)) / (1000 * 60 * 60 * 24)) : 0}
              </p>
              <p className="text-sm text-amber-700">Days Since Last Scan</p>
            </div>
          </div>
        </div>
      </div>

      {/* RFID Tags Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">RFID Tags</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">UID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Scanned At</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRFIDs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <IdCard className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {search || dateFilter ? "No matching RFID tags found" : "No unassigned RFID tags"}
                      </h3>
                      <p className="text-gray-500">
                        {search || dateFilter 
                          ? "Try adjusting your search or filter criteria" 
                          : "RFID tags will appear here when scanned but not yet assigned to students"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRFIDs.map((tag) => (
                  <tr key={tag._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <IdCard className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-mono text-gray-900 font-medium">{tag.uid}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">
                        {new Date(tag.scannedAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(tag.scannedAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        Available for Assignment
                      </span>
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
