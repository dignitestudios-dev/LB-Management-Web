import React, { useEffect, useState } from "react";
import { useUsers } from "../../hooks/api/Get"; // Using the same custom hook

const Shift = () => {
  const { data: shiftData, loading } = useUsers("/shifts");

  return (
    <div className="bg-[rgb(237 237 237)] p-6 rounded-xl shadow">
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <table className="w-full table-auto border border-gray-200 rounded-lg">
          <thead className="bg-red-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Shift Name</th>
              <th className="px-4 py-2 border">Shift Time</th>
              <th className="px-4 py-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {shiftData.map((shft, index) => {
              const formatHour = (hour) => {
                const period = hour >= 12 ? "PM" : "AM";
                const hour12 = hour % 12 === 0 ? 12 : hour % 12;
                return `${hour12}:00 ${period}`;
              };

              const shiftTime = `${formatHour(shft.startHour)} - ${formatHour(
                shft.endHour
              )}`;
              return (
                <tr key={shft._id} className="text-gray-800 hover:bg-gray-50">
                  <td className="px-4 text-center py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border text-center font-medium">
                    {shft.name}
                  </td>
                  <td className="px-4 py-2 border text-center font-medium">
                    {shiftTime}
                  </td>
                  <td className="px-4 py-2 border text-sm text-center">
                    {new Date(shft.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Shift;
