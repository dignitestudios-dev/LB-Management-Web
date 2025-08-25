import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../global/Toaster";
import { ImSpinner3 } from "react-icons/im";
import SearchBar from "../global/SearchBar";
import Pagination from "../global/Pagination";
import toast from "react-hot-toast";

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newLoading, setNewLoading] = useState(false);
  const [newHoliday, setNewHoliday] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/attendance/getAllHolidays");
      console.log(res);
      setHolidays(res.data.data);
      setTotalPages(res?.data?.pagination?.totalPages);
    } catch (err) {
      ErrorToast("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const createHoliday = async () => {
    if (!newHoliday.trim() || !shiftDate.trim()) {
      ErrorToast("All fields are required");
      return;
    }
    setNewLoading(true);
    try {
      await axios.post("/attendance/createHoliday", {
        reason: newHoliday,
        shiftDate,
      });
      SuccessToast("Holiday created successfully");
      setNewHoliday("");
      setShiftDate("");
      fetchHolidays();
    } catch (err) {
      ErrorToast("Failed to create holiday");
    }
    setNewLoading(false);
  };

  const openEditModal = (dept) => {
    setEditingHoliday(dept);
    setEditedName(dept.name);
    setEditModalOpen(true);
  };

  const updateHoliday = async () => {
    if (!editedName.trim()) {
      ErrorToast("Holiday name is required");
      return;
    }

    try {
      setUpdating(true);
      await axios.put(`/departments`, {
        id: editingDepartment._id,
        name: editedName,
      });
      SuccessToast("Department updated successfully");
      setEditModalOpen(false);
      setEditingHoliday(null);
      fetchHolidays();
    } catch (err) {
      ErrorToast("Failed to update department");
    } finally {
      setUpdating(false);
    }
  };
  console.log(holidays);
  return (
    <div className=" p-6 rounded-xl shadow">
      <div className="bg-[rgb(237_237_237)] shadow-md p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New Holiday</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter holiday name"
            value={newHoliday}
            onChange={(e) => setNewHoliday(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <input
            type="date"
            placeholder="Enter Date "
            value={shiftDate}
            onChange={(e) => setShiftDate(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={createHoliday}
            disabled={newLoading}
            className="bg-[#f40e00] text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Create
          </button>
        </div>
      </div>
      {/* 
      <SearchBar
        value={search}
        onSearch={(query) => {
          setSearch(query);
          setCurrentPage(1); // Reset to page 1 on search
        }}
      /> */}

      {loading ? (
        <p className="text-gray-600 mt-4">Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-[rgb(237_237_237)] rounded-xl shadow p-4 ">
            <table className="min-w-full border bg-[rgb(237_237_237)] rounded-xl shadow">
              <thead className="bg-red-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 text-center border">Holiday</th>
                  <th className="px-4 py-2 text-center border">Shift Date</th>
                  <th className="px-4 py-2 text-center border">Created At</th>
                  <th className="px-4 py-2 text-center border">Action</th>
                </tr>
              </thead>
              <tbody>
                {holidays.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      No holidays found.
                    </td>
                  </tr>
                ) : (
                  holidays.map((hol, index) => (
                    <tr
                      key={hol._id}
                      className="text-gray-800 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 text-center border">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2 text-center border font-medium">
                        {hol.reason}
                      </td>
                      <td className="px-4 py-2 text-center border font-medium">
                     {new Date(hol.shiftDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-center border text-sm">
                        {new Date(hol.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-center border text-sm">
                        <button
                          onClick={async () => {
                            const res = await axios.delete(
                              `/attendance/deleteHoliday?holidayId=${hol._id}`
                            );
                            if (res.data.success) {
                              toast.success(res.data.message);
                              fetchHolidays();
                              return;
                            }
                          }}
                          className="bg-red-500 py-1 px-3 rounded-md text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div> */}
        </>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Department</h2>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={updateDepartment}
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

export default Holidays;
