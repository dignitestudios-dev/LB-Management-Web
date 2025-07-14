import React, { useEffect, useState } from "react";
import { baseUrl } from "../../axios";
import { GrFilter } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";

const TimesheetTable = () => {
  const today = new Date().toISOString().split("T")[0];

  const getMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = Jan

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const start = firstDay.toISOString().split("T")[0];
    const end = lastDay.toISOString().split("T")[0];

    return { start, end };
  };
  const { start, end } = getMonthRange();
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState(null);
  const [checkInTimeStart, setCheckInTimeStart] = useState("");
  const [checkInTimeEnd, setCheckInTimeEnd] = useState("");
  const [checkOutTimeStart, setCheckOutTimeStart] = useState("");
  const [checkOutTimeEnd, setCheckOutTimeEnd] = useState("");

  const [filterDropDown, setFilterDropdown] = useState(false);
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/attendance`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setAttendance(result.data);
      }
    } catch (error) {
      console.error("Error fetching initial attendance", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSearch = async () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    // if (checkInTimeStart) params.append("checkInStart", checkInTimeStart);
    // if (checkInTimeEnd) params.append("checkInEnd", checkInTimeEnd);
    // if (checkOutTimeStart) params.append("checkOutStart", checkOutTimeStart);
    // if (checkOutTimeEnd) params.append("checkOutEnd", checkOutTimeEnd);

    try {
      const response = await fetch(
        `${baseUrl}/attendance?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setAttendance(result.data);
        setFilterDropdown(false);
      }
    } catch (error) {
      console.error("Error fetching filtered attendance", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);
  const handleClearFilters = () => {
    const { start, end } = getMonthRange();
    setStartDate(start);
    setEndDate(end);
    fetchAttendance();
    setFilterDropdown(false);
  };

  return (
    <div className="">
      <div
        className="flex justify-end p-4"
        onClick={() => setFilterDropdown((prev) => !prev)}
      >
        <button className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md shadow-sm transition">
          <GrFilter className="text-lg" />
          <span className="text-sm font-semibold">Filter</span>
        </button>
      </div>
      <div className="flex justify-end absolute z-10 left-0 right-6 -mt-2">
        {filterDropDown && (
          <div className="max-w-md  p-4 bg-white rounded-lg shadow-md inset-0 z-0 space-y-4">
            <div
              className="flex justify-end cursor-pointer"
              onClick={() => setFilterDropdown(false)}
            >
              <RxCross2 />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                max={today}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Check-in Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checkin Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={checkInTimeStart}
                  onChange={(e) => setCheckInTimeStart(e.target.value)}
                  className="flex-1 border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  value={checkInTimeEnd}
                  onChange={(e) => setCheckInTimeEnd(e.target.value)}
                  className="flex-1 border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Checkout Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checkout Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={checkOutTimeStart}
                  onChange={(e) => setCheckOutTimeStart(e.target.value)}
                  className="flex-1 border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  value={checkOutTimeEnd}
                  onChange={(e) => setCheckOutTimeEnd(e.target.value)}
                  className="flex-1 border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleFilterSearch}
                className="bg-red-100 w-full rounded-md p-3 text-red-500  font-[600] "
              >
                Search
              </button>
              <button
                onClick={handleClearFilters}
                className="bg-gray-200 w-full rounded-md p-3 text-gray-600  font-[600] "
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>{" "}
      <div className=" bg-white shadow-md rounded-xl">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
          <thead>
            <tr className="bg-red-50 text-red-600 text-xs md:text-sm uppercase font-semibold tracking-wider">
              <th className="px-6 py-3 text-left">Shift Date</th>
              <th className="px-6 py-3 text-left">Check In</th>
              <th className="px-6 py-3 text-left">Check Out</th>
              <th className="px-6 py-3 text-left">Worked Hours</th>
              <th className="px-6 py-3 text-left">Reason</th>
              <th className="px-6 py-3 text-left">Missing Note</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
              </tr>
            ) : (
              attendance?.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-red-50 transition duration-150"
                >
                  <td className="px-6 py-4 font-medium">
                    {new Date(item?.shiftDate).toLocaleDateString("en-US", {
                      timeZone: "Asia/Karachi",
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </td>

                  {/* Check In */}
                  <td className="px-6 py-4">
                    {item?.checkInTime === null &&
                    item?.checkOutTime === null ? (
                      item?.missingReason === "weekend" ? (
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-[#60d2c1] rounded-full">
                          📅 Day Off
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                          🚫 Absent
                        </span>
                      )
                    ) : item?.checkInTime === null ? (
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                        ⛔ Missing
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                        🕒{" "}
                        {new Date(item?.checkInTime).toLocaleTimeString(
                          "en-PK",
                          {
                            timeZone: "Asia/Karachi",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </span>
                    )}
                  </td>

                  {/* Check Out */}
                  <td className="px-6 py-4">
                    {item?.checkInTime === null &&
                    item?.checkOutTime === null ? (
                      item?.missingReason === "weekend" ? (
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-[#60d2c1] rounded-full">
                          📅 Day Off
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                          🚫 Absent
                        </span>
                      )
                    ) : item?.checkOutTime === null ? (
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                        ⛔ Missing
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                        ⏰{" "}
                        {new Date(item?.checkOutTime).toLocaleTimeString(
                          "en-PK",
                          {
                            timeZone: "Asia/Karachi",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-semibold text-sm">
                    {item?.checkInTime === null && item?.checkOutTime === null
                      ? "—"
                      : item?.totalMinutes === 0
                      ? "—"
                      : `${Math.floor(item.totalMinutes / 60)}h ${
                          item.totalMinutes % 60
                        }m`}
                  </td>

                  {/* Worked Hours */}
                  <td className="px-6 py-4 font-semibold text-sm">
                    {item?.missingReason
                      ? item.missingReason.charAt(0).toUpperCase() +
                        item.missingReason.slice(1).toLowerCase()
                      : "—"}
                  </td>
                  <td className="relative cursor-pointer group px-6 py-4 font-semibold text-sm text-gray-700">
                    <span>
                      {item?.missingNote?.length > 40
                        ? item.missingNote.slice(0, 40) + "..."
                        : item?.missingNote}
                    </span>

                    {/* Tooltip */}
                    {item?.missingNote && (
                      <div className="absolute break-words w-64  z-10 hidden group-hover:block bg-red-100 text-black text-xs rounded-md px-3 py-2 shadow-lg -top-0 left-1/2 -translate-x-1/2 translate-y-[-100%] whitespace-pre-line">
                        {item.missingNote}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-red-100"></div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimesheetTable;
