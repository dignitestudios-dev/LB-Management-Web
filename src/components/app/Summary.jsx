import React, { useEffect, useState } from "react";
import axios from "../../axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
const Summary = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [department, setDepartment] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const isoStart = startDate.toISOString().split("T")[0];
      const isoEnd = endDate.toISOString().split("T")[0];

      console.log(isoStart, isoEnd, "datesValue");
      const res = await axios.get(
        `/projects/summary?startDate=${isoStart}&endDate=${isoEnd}&user=${selectedUserId}&department=${selectedDepartmentId}`
      );
      setData(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchDepartment = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`/departments`);
      if (res.status === 200) {
        setDepartment(res?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (searchTerm = "") => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/users?search=${encodeURIComponent(searchTerm)}`
      );

      setUsers(res?.data?.data);
    } catch (err) {
      ErrorToast("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSummary();
    fetchDepartment();
    fetchUsers();
  }, []);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(query);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query]);
  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    return words
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

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
        <div className="">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>

          <select
            name="department"
            id="department"
            disabled={!!selectedUserId}
            value={selectedDepartmentId}
            onChange={(e) => setSelectedDepartmentId(e.target.value)}
            className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          >
            <option value="">Select a department</option>
            {department?.map((depart) => (
              <option key={depart._id} value={depart._id}>
                {depart?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full border border-gray-300 bg-white rounded-md px-4 py-2 text-sm text-gray-700 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            >
              {selectedUser ? selectedUser.name : "Select Employee"}
            </div>

            {showDropdown && (
              <div className="absolute z-40 bg-white mt-1 w-full border border-gray-300 rounded-md shadow-md max-h-64 overflow-y-auto">
                <div className="flex items-center px-3 py-2 border-b border-gray-200">
                  <input
                    type="text"
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Search employee..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <FaSearch className="ml-2 text-gray-500" />
                </div>

                {loading ? (
                  <div className="p-2 text-sm text-gray-500">Loading...</div>
                ) : users.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">
                    No employees found.
                  </div>
                ) : (
                  users.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedUser(item);
                        setSelectedUserId(item._id);
                        setSelectedDepartmentId("");
                        setShowDropdown(false);
                        setError("");
                      }}
                    >
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                        {getInitials(item.name)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.designation || "Designation"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
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
