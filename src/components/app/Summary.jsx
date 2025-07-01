import React, { useEffect, useState } from "react";
import axios from "../../axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange } from "react-icons/md";
const Summary = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const fetchSummary = async () => {
    try {
      setLoading(true);
      const isoStart = startDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'
      const isoEnd = endDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'

      console.log(isoStart, isoEnd, "datesValue");
      const res = await axios.get(
        `/projects/summary?startDate=${isoStart}&endDate=${isoEnd}`
      );
      setData(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="bg-[rgb(237 237 237)] p-6 rounded-xl shadow-md w-full">
      <h2 className="text-xl font-bold text-[#f40e00] mb-4">Project Summary</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div className="relative ">
          <label className="block text-sm mb-1">Start Date</label>
          <div className="flex items-center">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
            />
            <div className="absolute right-2 ">
              <MdDateRange />
            </div>
          </div>
        </div>
        <div className="relative">
          <label className="block text-sm mb-1">End Date</label>
          <div className=" flex items-center">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
            />
            <div className="absolute right-2 ">
              <MdDateRange />
            </div>
          </div>
        </div>
        <button
          onClick={fetchSummary}
          className="bg-[#f40e00] text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
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
              <h3 className="font-semibold text-[#f40e00]">{project.name}</h3>
              <p>
                Total Hours:{" "}
                <span className="font-medium">{project.totalHours}</span>
              </p>
              <p>
                Total Minutes:{" "}
                <span className="font-medium">{project.totalMinutes}</span>
              </p>
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
