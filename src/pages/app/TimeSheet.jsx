import React, { useEffect, useState } from "react";
import { baseUrl } from "../../axios";
import { GrFilter } from "react-icons/gr";
import { RxCross2 } from "react-icons/rx";
import { SlCalender } from "react-icons/sl";
import { BsClockHistory } from "react-icons/bs";
import { PiFileText } from "react-icons/pi";
import { CiClock2, CiUser } from "react-icons/ci";
import { SiCalendly } from "react-icons/si";
import { FaEye } from "react-icons/fa";
import ProjectModal from "../../components/app/ProjectModal";

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
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
      {/* Filter Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setFilterDropdown(true)}
          className="flex items-center gap-2 bg-red-100 hover:bg-blue-200 text-red-800 px-4 py-2 rounded-md shadow-sm transition"
        >
          <GrFilter className="text-lg" />
          <span className="text-sm font-semibold">Filter</span>
        </button>
      </div>

      {/* Right Side Drawer */}
      {filterDropDown && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={() => setFilterDropdown(false)}
          />

          {/* Drawer */}
          <div className="ml-auto w-full max-w-md bg-white shadow-lg h-full overflow-y-auto transition transform duration-300 ease-in-out translate-x-0">
            <div className="p-5 space-y-5">
              {/* Close Button */}
              <div
                className="flex justify-end cursor-pointer"
                onClick={() => setFilterDropdown(false)}
              >
                <RxCross2 className="text-gray-600 hover:text-red-500" />
              </div>

              {/* From Date */}
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

              {/* Check-out Time */}
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
                    max={today}
                    onChange={(e) => setCheckOutTimeEnd(e.target.value)}
                    className="flex-1 border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleFilterSearch}
                  className="bg-red-100 w-full rounded-md p-3 text-red-600 font-semibold hover:bg-blue-200 transition"
                >
                  Search
                </button>
                <button
                  onClick={handleClearFilters}
                  className="bg-gray-200 w-full rounded-md p-3 text-gray-600 font-semibold hover:bg-gray-300 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border border-gray-200 ">
        <table className="min-w-full divide-y  divide-gray-200">
          <thead className="bg-gradient-to-r  from-slate-50 to-blue-50">
            <tr className=" text-red-600 text-xs md:text-sm uppercase font-semibold tracking-wider">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {" "}
                <div className="flex items-center gap-2">
                  <SlCalender className="w-4 h-4" />
                  Shift Date
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <BsClockHistory className="w-4 h-4" />
                  Check In
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <BsClockHistory className="w-4 h-4" />
                  Check Out
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Worked Hours
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <PiFileText className="w-4 h-4" />
                  Notes
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">

                  Action
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading
              ? // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded-md w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded-md w-32"></div>
                    </td>
                  </tr>
                ))
              : attendance?.map((item, index) => (
                  <tr
                    key={index}
                    className=" cursor-pointer  hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {new Date(item?.shiftDate).toLocaleDateString("en-US", {
                          timeZone: "Asia/Karachi",
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(item?.shiftDate).toLocaleDateString("en-US", {
                          timeZone: "Asia/Karachi",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    {/* Check In */}
                    <td className="px-6 py-4">
                      {item?.checkInTime === null &&
                      item?.checkOutTime === null ? (
                        item?.missingReason === "Weekend" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                            <SlCalender className="w-3 h-3" />
                            Day Off
                          </span>
                        ) : item?.missingReason === "holiday" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                            <SlCalender className="w-3 h-3" />
                            Holiday
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full">
                            <CiUser className="w-3 h-3" />
                            Absent
                          </span>
                        )
                      ) : item?.checkInTime === null ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                          <CiClock2 className="w-3 h-3" />
                          Missing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full">
                          <CiClock2 className="w-3 h-3" />
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
                        item?.missingReason === "Weekend" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                            <SlCalender className="w-3 h-3" />
                            Day Off
                          </span>
                        ) : item?.missingReason === "holiday" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                            <SlCalender className="w-3 h-3" />
                            Holiday
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full">
                            <CiUser className="w-3 h-3" />
                            Absent
                          </span>
                        )
                      ) : item?.checkOutTime === null ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                          <CiClock2 className="w-3 h-3" />
                          Missing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full">
                          <CiClock2 className="w-3 h-3" />
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

                    <td className="px-6 py-4">
                      {item?.checkInTime === null &&
                      item?.checkOutTime === null ? (
                        <span className="inline-block bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1 rounded-full">
                          N/A
                        </span>
                      ) : item?.totalMinutes === 0 ? (
                        <span className="inline-block bg-yellow-50 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full">
                          Missing
                        </span>
                      ) : (
                        <span className="font-semibold text-sm">
                          {`${Math.floor(item.totalMinutes / 60)}h ${
                            item.totalMinutes % 60
                          }m`}
                        </span>
                      )}
                    </td>

                    {/* Worked Hours */}
                    <td className="px-6 py-4">
                      {item?.missingReason ? (
                        <div
                          className={`flex items-center gap-2 text-xs font-medium rounded-md px-3 py-2 shadow-sm border-l-4
        ${
          item.missingReason.toLowerCase() === "absent"
            ? "bg-red-50 text-red-700 border-red-400"
            : item.missingReason.toLowerCase() === "forgot"
            ? "bg-yellow-50 text-yellow-700 border-yellow-400"
            : item.missingReason.toLowerCase() === "holiday"
            ? "bg-green-50 text-green-700 border-green-400"
            : item.missingReason.toLowerCase() === "weekend"
            ? "bg-blue-50 text-blue-700 border-blue-400"
            : "bg-purple-50 text-purple-700 border-purple-400"
        }`}
                        >
                          <div
                            className={`p-1 rounded-full bg-white shadow-inner
          ${
            item.missingReason.toLowerCase() === "absent"
              ? "text-red-500"
              : item.missingReason.toLowerCase() === "forgot"
              ? "text-yellow-500"
              : item.missingReason.toLowerCase() === "holiday"
              ? "text-green-500"
              : item.missingReason.toLowerCase() === "weekend"
              ? "text-blue-500"
              : "text-purple-500"
          }`}
                          >
                            <PiFileText className="w-4 h-4" />
                          </div>
                          {item.missingReason.charAt(0).toUpperCase() +
                            item.missingReason.slice(1).toLowerCase()}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 relative">
                      <div className="group">
                        <div className="text-sm text-gray-700 max-w-xs">
                          {item?.missingNote ? (
                            item.missingNote.length > 40 ? (
                              <span className="cursor-help">
                                {item.missingNote.slice(0, 40)}...
                              </span>
                            ) : (
                              item.missingNote
                            )
                          ) : (
                            "—"
                          )}
                        </div>

                        {/* Tooltip */}
                        {item?.missingNote && item.missingNote.length > 40 && (
                          <div className="absolute z-[99999] invisible group-hover:visible bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-64 whitespace-pre-line">
                            {item.missingNote}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 relative">
                    <button
                      onClick={() => {
                        setSelectedRow(item);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye />
                    </button>
                  </td>
                  </tr>
                ))}
          </tbody>
        </table>
          <ProjectModal
        showModal={showModal}
        selectedRow={selectedRow}
        setShowModal={setShowModal}
        onClose={() => setShowModal(false)}
      />
      </div>
    </div>
  );
};

export default TimesheetTable;
