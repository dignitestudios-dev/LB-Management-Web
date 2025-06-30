import React, { useState } from 'react';
import axios from '../../axios';

const Summary = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/projects/summary?month=${month}&year=${year}`);
      setData(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Project Summary</h2>

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm mb-1">Select Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border p-2 rounded-md w-40"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Select Year</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border p-2 rounded-md w-32"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchSummary}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Get Summary
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading summary...</p>
      ) : data.length > 0 ? (
        <div className="space-y-4">
          {data.map((project) => (
            <div key={project._id} className="border p-4 rounded-md shadow-sm">
              <h3 className="font-semibold text-blue-600">{project.name}</h3>
              <p>Total Hours: <span className="font-medium">{project.totalHours}</span></p>
              <p>Total Minutes: <span className="font-medium">{project.totalMinutes}</span></p>
              <div className="mt-2 text-sm text-gray-700">
                {project.dailyBreakdown.map((day, i) => (
                  <div key={i}>
                    {day.date} — {day.totalHours} hr / {day.totalMinutes} min
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No data found for selected period.</p>
      )}
    </div>
  );
};

export default Summary;
