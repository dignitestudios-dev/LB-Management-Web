import React, { useEffect, useRef, useState } from "react";
import axios from "../../axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange } from "react-icons/md";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { useUsers } from "../../hooks/api/Get";
import { FiClock } from "react-icons/fi";
import { IoChevronDownSharp, IoChevronUpSharp } from "react-icons/io5";
import { HiUser } from "react-icons/hi";
import {
  HiBuildingOffice2,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { CSVLink } from "react-csv";
import { saveAs } from "file-saver";
import Papa from "papaparse";
const Summary = () => {
  const { loading: projectloader, data: projects } = useUsers(
    "/projects",
    1,
    1000
  );
  const getMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return { start: firstDay, end: lastDay }; // ✅ return Date objects
  };

  const { start, end } = getMonthRange();
  const currentDate = new Date();
  const dropdownRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const [summaryTriggered, setSummaryTriggered] = useState({});
  const [showAll, setShowAll] = useState(false);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [data, setData] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const [department, setDepartment] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [showDrawer, setShowDrawer] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(false);
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/projects/summary?startDate=${startDate}&endDate=${endDate}&user=${selectedUserId}&department=${selectedDepartmentId}&project=${projectId}`
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

  const fetchUsers = async (searchTerm = "", page = 1) => {
    setUserLoading(true);
    try {
      const res = await axios.get(
        `/users?search=${encodeURIComponent(searchTerm)}&page=${page}`
      );

      const response = res.data;

      if (response.success) {
        setUsers(response.data); // ✅ Correct
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
        });
      }
    } catch (err) {
      ErrorToast("Failed to fetch users");
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(query, 1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    fetchSummary();
    fetchDepartment();
    fetchUsers();
  }, []);
  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    return words
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (clearTrigger) {
      fetchSummary();
      setClearTrigger(false);
    }
  }, [selectedUserId, selectedDepartmentId, projectId, clearTrigger]);

  const handleClear = async () => {
    setStartDate("");
    setEndDate("");
    setSelectedDepartmentId("");
    setSelectedUser(null);
    setSelectedUserId("");
    setProjectId("");
    setQuery("");
    setShowDropdown(false);
    setShowDrawer(false);
    setClearTrigger(true);
   setSummaryTriggered({}); 
  };
  const handleExport = () => {
    if (!data.length) return;

    const flattenedData = data.map((project) => {
      return {
        Project: project?.name || "Unnamed",
        "Total Hours": project?.totalHours || 0,
        "Total Minutes": project?.totalMinutes || 0,
        ...(project?.dailyBreakdown || []).reduce((acc, day, index) => {
          acc[`Day ${index + 1} - Date`] = day.date || "";
          acc[`Day ${index + 1} - Hours`] = day.totalHours || 0;
          acc[`Day ${index + 1} - Minutes`] = day.totalMinutes || 0;
          return acc;
        }, {}),
      };
    });

    const csv = Papa.unparse(flattenedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Project_Summary_${startDate}_to_${endDate}.csv`);
  };

  return (
    <div className="bg-[rgb(237 237 237)] p-6 rounded-xl shadow-md w-full">
      <div className="flex justify-between mb-4">
        <div>
        {(summaryTriggered?.startDate && summaryTriggered?.endDate) ||
 summaryTriggered?.selectedUser ||
 summaryTriggered?.selectedDepartmentId ||
 summaryTriggered?.projectId ?  (
  <div className="space-y-2 bg-white border mt-3 border-gray-200 rounded-2xl p-4 shadow-sm w-fit">
    {/* Date Range */}
    <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm w-fit">
      <div className="flex items-center gap-2">
        <MdDateRange className="text-red-500 text-2xl" />
        <span className="text-gray-700 text-sm font-semibold">
          Date Range
        </span>
      </div>
      <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
        <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-1 rounded-md">
          {summaryTriggered?.startDate}
        </span>
        <span className="text-gray-400 text-sm font-semibold">to</span>
        <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-1 rounded-md">
          {summaryTriggered?.endDate}
        </span>
      </div>
    </div>

    {/* Employee */}
    {summaryTriggered?.selectedUser?.name && (
      <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm w-fit">
        <HiUser className="text-red-500 text-lg" />
        <div className="flex gap-1 items-baseline">
          <span className="text-sm text-gray-500 font-medium">Employee:</span>
          <h2 className="text-sm font-semibold text-gray-800">
            {summaryTriggered?.selectedUser?.name}
          </h2>
        </div>
      </div>
    )}

    {/* Department */}
    {summaryTriggered?.selectedDepartmentId && (
      <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm w-fit">
        <HiBuildingOffice2 className="text-red-500 text-lg" />
        <div className="flex gap-1 items-baseline">
          <span className="text-sm text-gray-500 font-medium">Department:</span>
          <h2 className="text-sm font-semibold text-gray-800">
            {department.find((d) => d._id === summaryTriggered.selectedDepartmentId)?.name || "—"}
          </h2>
        </div>
      </div>
    )}

    {/* Project */}
    {summaryTriggered?.projectId && (
      <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm w-fit">
        <HiOutlineClipboardDocumentList className="text-red-500 text-lg" />
        <div className="flex gap-1 items-baseline">
          <span className="text-sm text-gray-500 font-medium">Project:</span>
          <h2 className="text-sm font-semibold text-gray-800">
            {projects?.find((p) => p._id === summaryTriggered.projectId)?.name || "—"}
          </h2>
        </div>
      </div>
    )}
  </div>
):null}

        </div>
        <div className="flex gap-8">
          <button
            onClick={handleExport}
            className="bg-gray-700 hover:bg-gray-800 h-[39px] w-[100px] text-white  rounded transition"
          >
            Export
          </button>

          <button
            onClick={() => setShowDrawer(true)}
            className="bg-red-600 hover:bg-red-700 h-[39px] w-[100px] text-white  rounded transition"
          >
            Filters
          </button>
        </div>
      </div>

      {showDrawer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setShowDrawer(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[300px] bg-white z-50 shadow-lg transform transition-transform duration-300 ${
          showDrawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setShowDrawer(false)}>
                <RxCross2 className="text-xl text-gray-500 hover:text-red-600" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-4">
              <div className="w-full relative mt-2">
                <label className="block text-sm mb-1">Department</label>
                <div className="relative">
                  <select
                    disabled={!!selectedUserId}
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="appearance-none w-full border border-gray-300 bg-white rounded-md px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Select Department</option>
                    {department.map((depart) => (
                      <option key={depart._id} value={depart._id}>
                        {depart?.name}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={14}
                  />
                </div>
              </div>
              <div className="w-full relative">
                <label className="block text-sm mb-1">Projects</label>
                <div className="relative">
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="appearance-none w-full border border-gray-300 bg-white rounded-md px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Select Project</option>
                    {projects?.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project?.name}
                      </option>
                    ))}
                  </select>

                  <FaChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={14}
                  />
                </div>
              </div>

              <div ref={dropdownRef}>
                <label className="block text-sm mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <div
                    onClick={() => {
                      if (!selectedDepartmentId) setShowDropdown(!showDropdown);
                    }}
                    className={`w-full border border-gray-300 bg-white rounded-md px-4 py-2 text-sm text-gray-700 shadow-sm transition duration-150 ${
                      selectedDepartmentId
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : "cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>
                        {selectedUser ? selectedUser.name : "Select Employee"}
                      </span>
                      <div className="flex items-center gap-1">
                        {selectedUser && (
                          <RxCross2
                            className="text-gray-500 hover:text-red-600 cursor-pointer text-base"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(null);
                              setSelectedUserId("");
                              setShowDropdown(false);
                              setQuery("");
                            }}
                          />
                        )}
                        {showDropdown ? (
                          <FaChevronUp className="text-xs " />
                        ) : (
                          <FaChevronDown className="text-xs " />
                        )}
                      </div>
                    </div>
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

                      {userLoading ? (
                        <div className="p-4 space-y-2">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="h-10 bg-gray-100 animate-pulse rounded-md"
                            ></div>
                          ))}
                        </div>
                      ) : users?.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No employees found.
                        </div>
                      ) : (
                        users?.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedUser(item);
                              setSelectedUserId(item?._id);
                              setSelectedDepartmentId("");
                              setShowDropdown(false);
                              setError("");
                            }}
                          >
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                              {getInitials(item?.name)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800">
                                {item?.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item?.designation}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div className="flex items-center justify-between p-2 text-sm border-t sticky bottom-0 bg-white">
                        <button
                          className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50"
                          disabled={pagination?.currentPage === 1}
                          onClick={() =>
                            fetchUsers(query, pagination.currentPage - 1)
                          }
                        >
                          Prev
                        </button>
                        <span className="text-gray-600">
                          Page {pagination.currentPage} of{" "}
                          {pagination.totalPages}
                        </span>
                        <button
                          className="px-2 py-1 bg-red-100 text-red-600 rounded disabled:opacity-50"
                          disabled={
                            pagination.currentPage === pagination.totalPages
                          }
                          onClick={() =>
                            fetchUsers(query, pagination.currentPage + 1)
                          }
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                  {error && (
                    <p className="text-red-600 text-xs mt-1">{error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Button */}
          <div className="flex gap-3 mt-4">
           <button
  onClick={() => {
    fetchSummary();
    setSummaryTriggered({
      selectedUser,
      selectedDepartmentId,
      projectId,
      startDate,
      endDate,
    });
    setShowDrawer(false);
  }}
  disabled={
    !selectedUser &&
    !selectedDepartmentId &&
    !projectId &&
    !startDate &&
    !endDate
  }
  className={`w-[200px] h-[49px] rounded-md transition text-white ${
    !selectedUser &&
    !selectedDepartmentId &&
    !projectId &&
    !startDate &&
    !endDate
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-[#f40e00] hover:bg-red-700"
  }`}
>
  Get Summary
</button>

         <button
  onClick={handleClear}
  disabled={
    !selectedUser &&
    !selectedDepartmentId &&
    !projectId &&
    !startDate &&
    !endDate
  }
  className={`w-[200px] h-[49px] rounded-md transition ${
    !selectedUser &&
    !selectedDepartmentId &&
    !projectId &&
    !startDate &&
    !endDate
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-gray-300 text-gray-800 hover:bg-gray-400"
  }`}
>
  Clear Filters
</button>

          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200 animate-pulse"
            >
              <div className="h-5 bg-gray-300 rounded w-3/4 mb-4"></div>

              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>

              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((project, index) => {
            const isExpanded = activeIndex === index; // 👈 true if this card is open
            const visibleDays = isExpanded
              ? project?.dailyBreakdown
              : project?.dailyBreakdown?.slice(0, 4);

            return (
              <div
                key={project?._id}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition duration-300"
              >
                <h3 className="text-xl font-semibold text-red-600 mb-3">
                  {project?.name || "Unnamed Project"}
                </h3>

                <div className="text-sm text-gray-700 space-y-1 mb-4">
                  <p>
                    <span className="font-semibold">Total Hours:</span>{" "}
                    <span className="text-gray-900">{project?.totalHours}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Total Minutes:</span>{" "}
                    <span className="text-gray-900">
                      {project?.totalMinutes}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No data found for selected period.</p>
      )}
    </div>
  );
};

export default Summary;
