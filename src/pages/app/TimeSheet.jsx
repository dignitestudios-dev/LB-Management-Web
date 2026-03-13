import React, { useEffect, useState } from "react";
import instance from "../../axios";
import { RxCross2 } from "react-icons/rx";
import { SlCalender } from "react-icons/sl";
import { BsClockHistory } from "react-icons/bs";
import { PiFileText } from "react-icons/pi";
import { CiClock2, CiUser } from "react-icons/ci";
import { FaEye } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import ProjectModal from "../../components/app/ProjectModal";

const TimesheetTable = () => {
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const currentMonth = getCurrentMonth();

  const formatDateLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatMonthLabel = (monthValue) => {
    if (!monthValue) return "";
    const [year, month] = monthValue.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
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
  const [checkInTimeStart, setCheckInTimeStart] = useState("");
  const [checkInTimeEnd, setCheckInTimeEnd] = useState("");
  const [checkOutTimeStart, setCheckOutTimeStart] = useState("");
  const [checkOutTimeEnd, setCheckOutTimeEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [summaryLabel, setSummaryLabel] = useState(formatMonthLabel(currentMonth));

  const fetchAttendance = async (from = fromMonth, to = toMonth, shouldClose = false) => {
    if (!from || !to || from > to) {
      return;
    }

    setLoading(true);
    try {
      const { startDate, endDate } = getMonthDateBounds(from, to);
      const params = new URLSearchParams({ startDate, endDate });

      if (checkInTimeStart) params.append("checkInStart", checkInTimeStart);
      if (checkInTimeEnd) params.append("checkInEnd", checkInTimeEnd);
      if (checkOutTimeStart) params.append("checkOutStart", checkOutTimeStart);
      if (checkOutTimeEnd) params.append("checkOutEnd", checkOutTimeEnd);

      const response = await instance.get(`/attendance?${params.toString()}`);

      if (response.data.success) {
        setAttendance(response.data.data);
        setSummaryLabel(
          from === to
            ? formatMonthLabel(from)
            : `${formatMonthLabel(from)} - ${formatMonthLabel(to)}`
        );
        if (shouldClose) setIsOpen(false);
      }
    } catch (error) {
      console.error("Error fetching attendance", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(currentMonth, currentMonth);
  }, []);

  const handleClearFilters = () => {
    setFromMonth(currentMonth);
    setToMonth(currentMonth);
    setCheckInTimeStart("");
    setCheckInTimeEnd("");
    setCheckOutTimeStart("");
    setCheckOutTimeEnd("");
    fetchAttendance(currentMonth, currentMonth, true);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-slate-500">Showing Timesheet For:</span>
            <h2 className="text-xl font-bold text-slate-800">{summaryLabel}</h2>
          </div>
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
          className={`absolute top-0 right-0 h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-xl transition-transform duration-300 ease-out ${
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
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
                }}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                To Month <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                value={toMonth}
                max={currentMonth}
                min={fromMonth}
                onChange={(e) => setToMonth(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Check In Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={checkInTimeStart}
                  onChange={(e) => setCheckInTimeStart(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <input
                  type="time"
                  value={checkInTimeEnd}
                  onChange={(e) => setCheckInTimeEnd(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Check Out Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={checkOutTimeStart}
                  onChange={(e) => setCheckOutTimeStart(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <input
                  type="time"
                  value={checkOutTimeEnd}
                  onChange={(e) => setCheckOutTimeEnd(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <button
                onClick={() => fetchAttendance(fromMonth, toMonth, true)}
                disabled={loading}
                className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition ${
                  loading
                    ? "cursor-not-allowed bg-primary/40 text-white"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {loading ? "Loading..." : "Search"}
              </button>

              <button
                onClick={handleClearFilters}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full">
            <thead className="sticky -top-px z-10 bg-[#f2e7f9] text-primary">
              <tr>
                <th className="border px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <SlCalender className="h-4 w-4" />
                    Shift Date
                  </div>
                </th>
                <th className="border px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <BsClockHistory className="h-4 w-4" />
                    Check In
                  </div>
                </th>
                <th className="border px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <BsClockHistory className="h-4 w-4" />
                    Check Out
                  </div>
                </th>
                <th className="border px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                  Worked Hours
                </th>
                <th className="border px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                  Reason
                </th>
                <th className="border px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <PiFileText className="h-4 w-4" />
                    Notes
                  </div>
                </th>
                <th className="border px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2">Action</div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="border px-6 py-4"><div className="h-4 w-24 rounded-md bg-gray-200"></div></td>
                    <td className="border px-6 py-4"><div className="h-6 w-20 rounded-full bg-gray-200"></div></td>
                    <td className="border px-6 py-4"><div className="h-6 w-20 rounded-full bg-gray-200"></div></td>
                    <td className="border px-6 py-4"><div className="h-4 w-16 rounded-md bg-gray-200"></div></td>
                    <td className="border px-6 py-4"><div className="h-6 w-16 rounded-full bg-gray-200"></div></td>
                    <td className="border px-6 py-4"><div className="h-4 w-32 rounded-md bg-gray-200"></div></td>
                    <td className="border px-6 py-4"><div className="h-7 w-7 rounded-md bg-gray-200"></div></td>
                  </tr>
                ))
              ) : attendance?.attendances?.length > 0 ? (
                attendance.attendances.map((item, index) => (
                  <tr
                    key={index}
                    className="cursor-pointer text-gray-800 transition-all duration-200 hover:bg-slate-50"
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
                    <td className="px-6 py-4">
                      {item?.checkInTime === null && item?.checkOutTime === null ? (
                        item?.missingReason === "Weekend" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                            <SlCalender className="h-3 w-3" />
                            Day Off
                          </span>
                        ) : item?.missingReason === "holiday" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                            <SlCalender className="h-3 w-3" />
                            Holiday
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
                            <CiUser className="h-3 w-3" />
                            Absent
                          </span>
                        )
                      ) : item?.checkInTime === null ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                          <CiClock2 className="h-3 w-3" />
                          Missing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                          <CiClock2 className="h-3 w-3" />
                          {new Date(item?.checkInTime).toLocaleTimeString("en-PK", {
                            timeZone: "Asia/Karachi",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item?.checkInTime === null && item?.checkOutTime === null ? (
                        item?.missingReason === "Weekend" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                            <SlCalender className="h-3 w-3" />
                            Day Off
                          </span>
                        ) : item?.missingReason === "holiday" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                            <SlCalender className="h-3 w-3" />
                            Holiday
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
                            <CiUser className="h-3 w-3" />
                            Absent
                          </span>
                        )
                      ) : item?.checkOutTime === null ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                          <CiClock2 className="h-3 w-3" />
                          Missing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                          <CiClock2 className="h-3 w-3" />
                          {new Date(item?.checkOutTime).toLocaleTimeString("en-PK", {
                            timeZone: "Asia/Karachi",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item?.checkInTime === null && item?.checkOutTime === null ? (
                        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">N/A</span>
                      ) : item?.totalMinutes === 0 ? (
                        <span className="inline-block rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">Missing</span>
                      ) : (
                        <span className="text-sm font-semibold">
                          {`${Math.floor(item.totalMinutes / 60)}h ${item.totalMinutes % 60}m`}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item?.missingReason ? (
                        <div
                          className={`flex items-center gap-2 rounded-md border-l-4 px-3 py-2 text-xs font-medium shadow-sm ${
                            item.missingReason.toLowerCase() === "absent"
                              ? "border-red-400 bg-red-50 text-red-700"
                              : item.missingReason.toLowerCase() === "forgot"
                                ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                                : item.missingReason.toLowerCase() === "holiday"
                                  ? "border-green-400 bg-green-50 text-green-700"
                                  : item.missingReason.toLowerCase() === "weekend"
                                    ? "border-blue-400 bg-blue-50 text-blue-700"
                                    : "border-purple-400 bg-purple-50 text-purple-700"
                          }`}
                        >
                          <div
                            className={`rounded-full bg-white p-1 shadow-inner ${
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
                            <PiFileText className="h-4 w-4" />
                          </div>
                          {item.missingReason.charAt(0).toUpperCase() +
                            item.missingReason.slice(1).toLowerCase()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="relative px-6 py-4">
                      <div className="group">
                        <div className="max-w-xs text-sm text-gray-700">
                          {item?.missingNote ? (
                            item.missingNote.length > 40 ? (
                              <span className="cursor-help">{item.missingNote.slice(0, 40)}...</span>
                            ) : (
                              item.missingNote
                            )
                          ) : (
                            "—"
                          )}
                        </div>
                        {item?.missingNote && item.missingNote.length > 40 && (
                          <div className="absolute left-1/2 top-0 z-[99999] invisible w-64 -translate-x-1/2 -translate-y-full whitespace-pre-line rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg group-hover:visible">
                            {item.missingNote}
                            <div className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-full border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                      <div className="inline-flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRow(item);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center justify-center rounded-md bg-primary p-1.5 text-white"
                          title="View Details"
                        >
                          <FaEye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No timesheet records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProjectModal
        showModal={showModal}
        selectedRow={selectedRow}
        setShowModal={setShowModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default TimesheetTable;