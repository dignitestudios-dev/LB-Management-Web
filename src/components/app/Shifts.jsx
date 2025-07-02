import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../global/Toaster";
import { ImSpinner3 } from "react-icons/im";
import SearchBar from "../global/SearchBar";
import Pagination from "../global/Pagination";

const Shift = () => {
  const [shiftsData, setShiftsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newShiftName, setNewShiftName] = useState("");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editStartHour, setEditStartHour] = useState("");
  const [editEndHour, setEditEndHour] = useState("");
  const [updating, setUpdating] = useState(false);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/shifts", {
        params: { search, page, limit },
      });
      setShiftsData(res.data.data);
      setTotalPages(res?.data?.pagination?.totalPages);
    } catch (err) {
      ErrorToast("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [search, page]);

  const createShift = async () => {
    if (!newShiftName.trim() || !startHour.trim() || !endHour.trim()) {
      ErrorToast("Please fill out all shift fields");
      return;
    }

    try {
      await axios.post("/shifts", {
        name: newShiftName,
        startHour,
        endHour,
      });
      SuccessToast("Shift created successfully");
      setNewShiftName("");
      setStartHour("");
      setEndHour("");
      fetchShifts();
    } catch (err) {
      ErrorToast("Failed to create shift");
    }
  };

  const openEditModal = (shift) => {
    setEditingShift(shift);
    setEditedName(shift.name);
    setEditStartHour(shift.startHour);
    setEditEndHour(shift.endHour);
    setEditModalOpen(true);
  };

  const updateShift = async () => {
    if (!editedName.trim() || !editStartHour.trim() || !editEndHour.trim()) {
      ErrorToast("All fields are required");
      return;
    }

    try {
      setUpdating(true);
      await axios.put(`/shifts`, {
        id: editingShift._id,
        name: editedName,
        startHour: editStartHour,
        endHour: editEndHour,
      });
      SuccessToast("Shift updated successfully");
      setEditModalOpen(false);
      setEditingShift(null);
      fetchShifts();
    } catch (err) {
      ErrorToast("Failed to update shift");
    } finally {
      setUpdating(false);
    }
  };

  const formatHour = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:00 ${period}`;
  };

  return (
    <div className="bg-[rgb(237_237_237)] p-6 rounded-xl shadow">
      {/* Create Shift */}
      <div className="bg-[rgb(237_237_237)] shadow-md p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New Shift</h3>
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Enter Shift Name"
            value={newShiftName}
            onChange={(e) => setNewShiftName(e.target.value)}
            className="border p-2 rounded w-full sm:w-[200px]"
          />
          <input
            type="number"
            placeholder="Start Hour (0-23)"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
            className="border p-2 rounded w-full sm:w-[150px]"
          />
          <input
            type="number"
            placeholder="End Hour (0-23)"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
            className="border p-2 rounded w-full sm:w-[150px]"
          />
          <button
            onClick={createShift}
            className="bg-[#f40e00] text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        onSearch={(query) => {
          setSearch(query);
          setPage(1);
        }}
      />

      {/* Shift Table */}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : shiftsData.length > 0 ? (
        <>
          <table className="w-full table-auto border border-gray-200 rounded-lg">
            <thead className="bg-red-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Shift Name</th>
                <th className="px-4 py-2 border">Shift Time</th>
                <th className="px-4 py-2 border">Created At</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {shiftsData.map((shift, index) => {
                const shiftTime = `${formatHour(
                  shift.startHour
                )} - ${formatHour(shift.endHour)}`;
                return (
                  <tr key={shift._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-2 border text-center font-medium">
                      {shift.name}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {shiftTime}
                    </td>
                    <td className="px-4 py-2 border text-center text-sm">
                      {new Date(shift.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => openEditModal(shift)}
                        className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      ) : (
        <p className="text-center text-gray-600">No shifts found.</p>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Shift</h2>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full border p-2 rounded mb-3"
              placeholder="Shift Name"
            />
            <input
              type="number"
              value={editStartHour}
              onChange={(e) => setEditStartHour(e.target.value)}
              className="w-full border p-2 rounded mb-3"
              placeholder="Start Hour (0-23)"
            />
            <input
              type="number"
              value={editEndHour}
              onChange={(e) => setEditEndHour(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="End Hour (0-23)"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={updateShift}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                Update {updating && <ImSpinner3 className="animate-spin" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shift;
