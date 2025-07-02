import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../global/Toaster";
import { ImSpinner3 } from "react-icons/im";
import SearchBar from "../global/SearchBar";
import Pagination from "../global/Pagination";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/departments", {
        params: {
          search,
          page: currentPage,
          itemsPerPage,
        },
      });
      setDepartments(res.data.data);
      setTotalPages(res?.data?.pagination?.totalPages);
    } catch (err) {
      ErrorToast("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [search, currentPage]);

  const createDepartment = async () => {
    if (!newDepartment.trim()) {
      ErrorToast("Department name is required");
      return;
    }

    try {
      await axios.post("/departments", { name: newDepartment });
      SuccessToast("Department created successfully");
      setNewDepartment("");
      fetchDepartments();
    } catch (err) {
      ErrorToast("Failed to create department");
    }
  };

  const openEditModal = (dept) => {
    setEditingDepartment(dept);
    setEditedName(dept.name);
    setEditModalOpen(true);
  };

  const updateDepartment = async () => {
    if (!editedName.trim()) {
      ErrorToast("Department name is required");
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
      setEditingDepartment(null);
      fetchDepartments();
    } catch (err) {
      ErrorToast("Failed to update department");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-[rgb(237_237_237)] p-6 rounded-xl shadow">
      {/* Create Department */}
      <div className="bg-[rgb(237_237_237)] shadow-md p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New Department</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter department name"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={createDepartment}
            className="bg-[#f40e00] text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Department List */}
      <h2 className="text-xl font-bold text-[#f40e00] mb-4">All Departments</h2>
      <SearchBar
        value={search}
        onSearch={(query) => {
          setSearch(query);
          setCurrentPage(1); // Reset to page 1 on search
        }}
      />

      {loading ? (
        <p className="text-gray-600 mt-4">Loading...</p>
      ) : (
        <>
          <table className="w-full table-auto border border-gray-200 rounded-lg mt-4">
            <thead className="bg-red-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 text-center border">
                  Department Name
                </th>
                <th className="px-4 py-2 text-center border">Created At</th>
                <th className="px-4 py-2 text-center border">Action</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No departments found.
                  </td>
                </tr>
              ) : (
                departments.map((dept, index) => (
                  <tr key={dept._id} className="text-gray-800 hover:bg-gray-50">
                    <td className="px-4 py-2 text-center border">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2 text-center border font-medium">
                      {dept.name}
                    </td>
                    <td className="px-4 py-2 text-center border text-sm">
                      {new Date(dept.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-center border text-sm">
                      <button
                        onClick={() => openEditModal(dept)}
                        className="bg-blue-500 py-1 px-3 rounded-md text-white hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
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

export default Departments;
