import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaSearch, FaSpinner } from "react-icons/fa";
import instance, { baseUrl } from "../../axios";
import EmployeeMissingEntryTable from "./EmployeeMissingEntryTable";
import { GrFilter } from "react-icons/gr";
import { ErrorToast } from "../global/Toaster";
import { formatHour } from "../../lib/helpers";

const MissingEnteries = () => {
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableShow, setTableShow] = useState(false);

  const fetchAttendance = async (departmentIds, roleIds, shiftIds) => {
    setLoadingAttendance(true);
    try {
      // Start with base query params
      const queryParams = new URLSearchParams({
        startDate: fromDate,
        endDate: toDate,
      });

      // Append department IDs if provided
      if (Array.isArray(departmentIds)) {
        departmentIds.forEach((id, index) => {
          queryParams.append(`departmentIds[${index}]`, id);
        });
      }

      // Append role IDs if provided
      if (Array.isArray(roleIds)) {
        roleIds.forEach((id, index) => {
          queryParams.append(`roleIds[${index}]`, id);
        });
      }

      // Append shift IDs if provided
      if (Array.isArray(shiftIds)) {
        shiftIds.forEach((id, index) => {
          queryParams.append(`shiftIds[${index}]`, id);
        });
      }

      const response = await instance.get(
        `/attendance/getTotalMissingAttendance?${queryParams.toString()}`
      );

      if (response.data.success) {
        setAttendance(response?.data.data);
        setIsOpen(false);
        setTableShow(true);
      }
    } catch (error) {
      console.error("Error fetching filtered attendance", error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    setAttendance([]);
    setTableShow(false);
    setIsOpen(true);
  };

  /** EXPORT TO CSV **/
  const handleExportCSV = () => {
    if (!attendance || attendance.length === 0) {
      ErrorToast("No data to export");
      return;
    }

    // Updated headers to include Department, Role, and Shift
    const headers = [
      "Name",
      "Email",
      "Department",
      "Role",
      "Shift",
      "Missing Entries",
    ];

    // Map data rows
    const rows = attendance.map((item) => [
      item.name || "",
      item.email || "",
      item.departmentName || "N/A",
      item.roleName || "N/A",
      item.shift
        ? ` (${formatHour(item.shift.startHour)} - ${formatHour(
            item.shift.endHour
          )})`
        : "N/A",
      item.totalMissingEntries || 0,
    ]);

    const csvContent = [
      headers.join(","), // header row
      ...rows.map((row) => row.map((value) => `"${value}"`).join(",")), // data rows
    ].join("\n");

    // Create Blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Missing_Entries_${fromDate || "All"}_${toDate || "All"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex gap-4 justify-end p-4">
        <button
          className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md shadow-sm transition"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <GrFilter className="text-lg" />
          <span className="text-sm font-semibold">Filter</span>
        </button>

        {tableShow && attendance.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-sm transition"
          >
            Export CSV
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 p-4 overflow-y-auto border-l border-gray-200">
          {/* FILTER PANEL CONTENT */}
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
                onClick={fetchAttendance}
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
          <div>No Record Found</div>
        </div>
      )}
    </div>
  );
};

export default MissingEnteries;
