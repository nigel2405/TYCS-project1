import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AttendanceLog = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/students/me/attendance?month=${month}&year=${year}` , {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      setError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const formatRate = (r) => `${Math.round((r || 0) * 100)}%`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-indigo-700">My Attendance</h2>
        {data && (
          <div className="flex items-center gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Rate: {formatRate(data.rate)}</span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">Present: {data.presentDays}/{data.totalDays}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-5">
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))} className="border p-2 rounded">
          {[...Array(12)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </select>
        <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10) || year)} className="border p-2 rounded w-28" />
        <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Refresh</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {data && (
        <div className="bg-white rounded-xl shadow p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Date</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.records.map((r) => (
                <tr key={r._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{new Date(r.date).toLocaleDateString()}</td>
                  <td className={`py-2 font-semibold ${r.status === 'present' ? 'text-green-600' : 'text-red-600'}`}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceLog;
