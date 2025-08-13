import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../global/Toaster";
import { ImSpinner3 } from "react-icons/im";
import SearchBar from "../global/SearchBar";
import Pagination from "../global/Pagination";

const Divisions = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newDivisions, setNewDivisions] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDivision, setEditingDiviosion] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/division", {
        params: {
          search,
          page: currentPage,
          itemsPerPage,
        },
      });
      setDivisions(res.data.data);
      setTotalPages(res?.data?.pagination?.totalPages);
    } catch (err) {
      ErrorToast("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, [search, currentPage]);

  const createDivision = async () => {
    if (!newDivisions.trim()) {
      ErrorToast("Division name is required");
      return;
    }

    try {
      await axios.post("/division", { name: newDivisions });
      SuccessToast("Division created successfully");
      setNewDivisions("");
      fetchDivisions();
    } catch (err) {
      ErrorToast("Failed to create Division");
    }
  };

  const openEditModal = (dept) => {
    setEditingDiviosion(dept);
    setEditedName(dept.name);
    setEditModalOpen(true);
  };

  const updateDivision = async () => {
    if (!editedName.trim()) {
      ErrorToast("Division name is required");
      return;
    }

    try {
      setUpdating(true);
      await axios.put(`/division`, {
        id: editingDivision._id,
        name: editedName,
      });
      SuccessToast("Division updated successfully");
      setEditModalOpen(false);
      setEditingDiviosion(null);
      fetchDivisions();
    } catch (err) {
      ErrorToast("Failed to update Division");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className=" p-6 rounded-xl shadow">
      {/* Create Department */}
      <div className="bg-[rgb(237_237_237)] shadow-md p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New Division</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter division name"
            value={newDivisions}
            onChange={(e) => setNewDivisions(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={createDivision}
            className="bg-[#f40e00] text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Create
          </button>
        </div>
      </div>

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
          <div className="overflow-x-auto bg-[rgb(237_237_237)] rounded-xl shadow p-4 ">
            <table className="min-w-full border bg-[rgb(237_237_237)] rounded-xl shadow">
              <thead className="bg-red-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 text-center border">
                    Division Name
                  </th>
                  <th className="px-4 py-2 text-center border">Created At</th>
                  <th className="px-4 py-2 text-center border">Action</th>
                </tr>
              </thead>
              <tbody>
                {divisions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      No departments found.
                    </td>
                  </tr>
                ) : (
                  divisions.map((dept, index) => (
                    <tr
                      key={dept._id}
                      className="text-gray-800 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 text-center border">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2 text-center border font-medium">
                        {dept.name}
                      </td>
                      <td className="px-4 py-2 text-center border text-sm">
                        {new Date(dept.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 space-x-2 text-center border text-sm">
                        <button
                          onClick={() => openEditModal(dept)}
                          className="bg-blue-500 py-1 px-3 rounded-md text-white hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              setLoading(true);
                              await axios.delete(`/division/${dept._id}`);
                            } catch (error) {
                              ErrorToast(error);
                            } finally {
                                fetchDivisions()
                              setLoading(false);
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
            <h2 className="text-lg font-semibold mb-4">Edit Division</h2>
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
                onClick={updateDivision}
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

export default Divisions;
