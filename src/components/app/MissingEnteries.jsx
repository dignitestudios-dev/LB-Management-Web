import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaSearch, FaSpinner } from "react-icons/fa";
import instance, { baseUrl } from "../../axios";
import EmployeeTable from "./EmployeeTable";
import { GrFilter } from "react-icons/gr";
import { Nodata } from "../../assets/export";
import { ErrorToast } from "../global/Toaster";
import EmployeeMissingEntryTable from "./EmployeeMissingEntryTable";

const MissingEnteries = () => {
  const today = new Date().toISOString().split("T")[0];

  const getMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return { start: firstDay, end: lastDay }; // ✅ return Date objects
  };
  const { start, end } = getMonthRange();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableShow, setTableShow] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [attendance, setAttendance] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [summaryTriggered, setSummaryTriggered] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const formatDateLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

//   const fetchUsers = async (searchTerm = "", page = 1) => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `${baseUrl}/users?search=${encodeURIComponent(
//           searchTerm
//         )}&page=${page}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       const result = await response.json();
//       if (result.success) {
//         setUsers(result.data);
//         setPagination({
//           currentPage: result.pagination.currentPage,
//           totalPages: result.pagination.totalPages,
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching users", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const delayDebounce = setTimeout(() => {
//       fetchUsers(query, 1);
//     }, 500);
//     return () => clearTimeout(delayDebounce);
//   }, [query]);

  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    return words
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  const fetchAttendance = async () => {
    // if (!selectedUser || !selectedUser._id) {
    //   setError("Please select an employee first.");
    //   return;
    // }
    setLoadingAttendance(true);
    try {
      const queryParams = new URLSearchParams({
        // id: selectedUser._id,
        startDate: fromDate,
        endDate: toDate,
      }).toString();

      const response = await instance.get(`/attendance/getTotalMissingAttendance?${queryParams}`);

      if (response.data.success) {
        setAttendance(response?.data.data);
        setIsOpen(false);
        setTableShow(true);
         setSummaryTriggered({ selectedUser });
      }
    } catch (error) {
      console.error("Error fetching filtered attendance", error);
    } finally {
      setLoadingAttendance(false);
    }
  };
  const handleClear = () => {
    setSelectedUser(null);
    setQuery("");
    setFromDate("");
    setToDate("");
    setAttendance([]);
    setTableShow(false);
    setIsOpen(true);
    setError("");

    setSummaryTriggered({});
  };

  return (
    <div>
      <div
        className="flex justify-between p-4"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div>
          {/* {summaryTriggered?.selectedUser && (
            <div className="flex items-center">
              <span className="text-sm text-gray-500">
                Showing Attendance For :
              </span>
              <h2 className="text-xl mx-2 font-bold text-gray-800">
                {summaryTriggered?.selectedUser?.name}
              </h2>
            </div>
          )} */}
        </div>

        <button className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md shadow-sm transition">
          <GrFilter className="text-lg" />
          <span className="text-sm font-semibold">Filter</span>
        </button>
      </div>
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 p-4 overflow-y-auto border-l border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={() => setIsOpen(false)}
            >
              <RxCross2 size={20} />
            </button>
          </div>

          <div className="space-y-4">
          

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={toDate}
                max={today}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center justify-between mt-4 gap-4">
              <button
                onClick={() => {
                  fetchAttendance();
                 
                }}
                disabled={loadingAttendance}
                className={`w-[200px] px-4 py-2 rounded-md text-md font-[500] flex items-center justify-center gap-2 ${
                  loadingAttendance
                    ? "bg-red-200 text-red-500 cursor-not-allowed"
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
              >
                {loadingAttendance ? (
                  <>
                    <FaSpinner className="animate-spin text-red-500 text-sm" />
                    Loading...
                  </>
                ) : (
                  "Search"
                )}
              </button>

              <button
                onClick={handleClear}
                className="border border-red-600 w-[200px] text-red-600 px-4 py-2 rounded-md text-md font-[500]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
      {tableShow ? (
        <EmployeeMissingEntryTable
          attendance={attendance}
          loading={loading}
          setAttendance={setAttendance}
          fetchAttendance={fetchAttendance}
        />
      ) : (
        <div className="flex flex-col justify-center items-center h-[60vh]">
          {/* <img src={Nodata} className="w-[160px] h-[160px] " alt="" /> */}
          <div>No Record Found</div>{" "}
        </div>
      )}
    </div>
  );
};

export default MissingEnteries;
