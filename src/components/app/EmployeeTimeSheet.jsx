import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { baseUrl } from "../../axios";
import EmployeeTable from "./EmployeeTable";
import { FiFilter } from "react-icons/fi";

const EmployeeTimeSheet = () => {
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const currentMonth = getCurrentMonth();

  const formatMonthLabel = (monthValue) => {
    if (!monthValue) return "";
    const [year, month] = monthValue.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString("en-US", { month: "short", year: "numeric" });
  };

  const getMonthDateBounds = (fromMonthValue, toMonthValue) => {
    if (!fromMonthValue || !toMonthValue) return { startDate: "", endDate: "" };

    const [fromYear, fromMonth] = fromMonthValue.split("-").map(Number);
    const [toYear, toMonth] = toMonthValue.split("-").map(Number);

    const firstDay = new Date(fromYear, fromMonth - 1, 1);
    const lastDay = new Date(toYear, toMonth, 0);
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === toYear && today.getMonth() + 1 === toMonth;

    return {
      startDate: formatDateLocal(firstDay),
      endDate: formatDateLocal(isCurrentMonth ? today : lastDay),
    };
  };

  const [fromMonth, setFromMonth] = useState(currentMonth);
  const [toMonth, setToMonth] = useState(currentMonth);

  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
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

  const fetchUsers = async (searchTerm = "", page = 1) => {
    setLoadingUsers(true);
    try {
      const response = await fetch(
        `${baseUrl}/users?search=${encodeURIComponent(
          searchTerm
        )}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
        setPagination({
          currentPage: result.pagination.currentPage,
          totalPages: result.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(query, 1);
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

  const fetchAttendance = async () => {
    if (!selectedUser || !selectedUser._id) {
      setError("Please select an employee first.");
      return;
    }

    if (!fromMonth || !toMonth) {
      setError("Please select both from and to months.");
      return;
    }

    if (fromMonth > toMonth) {
      setError("From month cannot be greater than To month.");
      return;
    }

    setLoadingAttendance(true);
    try {
      const { startDate, endDate } = getMonthDateBounds(fromMonth, toMonth);
      const queryParams = new URLSearchParams({
        id: selectedUser._id,
        startDate,
        endDate,
      }).toString();

      const response = await fetch(`${baseUrl}/attendance/all?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setAttendance(result?.data);
        setIsOpen(false);
        setTableShow(true);
        setSummaryTriggered({
          selectedUser,
          monthRangeLabel:
            fromMonth === toMonth
              ? formatMonthLabel(fromMonth)
              : `${formatMonthLabel(fromMonth)} - ${formatMonthLabel(toMonth)}`,
        });
      }
    } catch (error) {
      console.error("Error fetching filtered attendance", error);
    } finally {
      setLoadingAttendance(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const handleClear = () => {
    setSelectedUser(null);
    setQuery("");
    setFromMonth(currentMonth);
    setToMonth(currentMonth);
    setAttendance([]);
    setTableShow(false);
    setIsOpen(true);
    setError("");

    setSummaryTriggered({});
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          {summaryTriggered?.selectedUser && (
            <div className="flex items-center flex-wrap">
              <span className="text-sm text-slate-500">
                Showing Attendance For :
              </span>
              <h2 className="text-xl mx-2 font-bold text-slate-800">
                {summaryTriggered?.selectedUser?.name}
              </h2>
              {summaryTriggered?.monthRangeLabel && (
                <span className="text-sm text-slate-500">
                  ({summaryTriggered.monthRangeLabel})
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 text-sm font-medium text-primary transition hover:bg-primary/15"
        >
          <FiFilter size={15} />
          Filters
        </button>
      </div>
      <div
        className={`fixed inset-0 z-50 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl p-5 overflow-y-auto border-l border-slate-200 transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-semibold text-slate-800">Filters</h2>
            <button
              className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setIsOpen(false)}
            >
              <RxCross2 size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <div
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
                >
                  {selectedUser ? selectedUser.name : "Select Employee"}
                </div>

                {showDropdown && (
                  <div className="absolute z-40 mt-1 w-full rounded-lg border border-slate-300 bg-white shadow-md">
                    {/* Search Input */}
                    <div className="flex items-center border-b border-slate-200 px-2 py-2">
                      <input
                        type="text"
                        className="flex-1 bg-transparent px-2 py-1 text-sm text-slate-900 outline-none"
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      <FaSearch className="text-slate-400" />
                    </div>

                    {/* Scrollable List */}
                    <div className="max-h-64 overflow-y-auto">
                      {loadingUsers ? (
                        <div className="p-4 space-y-2">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="h-10 bg-gray-100 animate-pulse rounded-md"
                            ></div>
                          ))}
                        </div>
                      ) : users.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No employees found.
                        </div>
                      ) : (
                        users.map((item, index) => (
                          <div
                            key={index}
                            className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-slate-50"
                            onClick={() => {
                              setSelectedUser(item);
                              setShowDropdown(false);
                              setError("");
                            }}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                              {getInitials(item.name)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-800">
                                {item?.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {item?.designation}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination Fixed Bottom */}
                    <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white p-2 text-sm">
                      <button
                        className="rounded bg-slate-100 px-2 py-1 text-slate-700 disabled:opacity-50"
                        disabled={pagination.currentPage === 1}
                        onClick={() =>
                          fetchUsers(query, pagination.currentPage - 1)
                        }
                      >
                        Prev
                      </button>
                      <span className="text-slate-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        className="rounded bg-primary/10 px-2 py-1 text-primary disabled:opacity-50"
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
                <p className="text-red-600 text-[12px] mt-2 px-2 ">{error}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Month <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                value={fromMonth}
                max={currentMonth}
                onChange={(e) => {
                  const value = e.target.value;
                  setFromMonth(value);
                  if (toMonth && value > toMonth) setToMonth(value);
                  setError("");
                }}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Month <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                value={toMonth}
                max={currentMonth}
                min={fromMonth}
                onChange={(e) => {
                  setToMonth(e.target.value);
                  setError("");
                }}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="flex items-center justify-between mt-4 gap-4">
              <button
                onClick={() => {
                  fetchAttendance();
                }}
                disabled={loadingAttendance}
                className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition ${
                  loadingAttendance
                    ? "cursor-not-allowed bg-primary/40 text-white"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {loadingAttendance ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Loading...
                  </>
                ) : (
                  "Search"
                )}
              </button>

              <button
                onClick={handleClear}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      {tableShow ? (
        <EmployeeTable
          attendance={attendance}
          loading={loadingAttendance}
          setAttendance={setAttendance}
          fetchAttendance={fetchAttendance}
        />
      ) : (
        <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm">
          <div className="text-sm font-medium text-slate-500">
            Select employee and month filters to view timesheet.
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTimeSheet;
