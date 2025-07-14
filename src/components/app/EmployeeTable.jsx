import React from "react";

const EmployeeTable = ({ attendance }) => {
  return (
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
          {false ? (
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
                  {item?.checkInTime === null && item?.checkOutTime === null ? (
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                      🚫 Absent
                    </span>
                  ) : item?.checkInTime === null ? (
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                      ⛔ Missing
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      🕒{" "}
                      {new Date(item?.checkInTime).toLocaleTimeString("en-PK", {
                        timeZone: "Asia/Karachi",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  )}
                </td>

                {/* Check Out */}
                <td className="px-6 py-4">
                  {item?.checkInTime === null && item?.checkOutTime === null ? (
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                      🚫 Absent
                    </span>
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
                  {item?.missingReason}
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
  );
};

export default EmployeeTable;
