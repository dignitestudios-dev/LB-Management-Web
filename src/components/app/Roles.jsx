import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { ImSpinner3 } from "react-icons/im";
import SearchBar from "../../components/global/SearchBar";
import Pagination from "../../components/global/Pagination";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/roles", {
        params: {
          search,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setRoles(res.data.data);
      setTotalPages(res?.data?.pagination?.totalPages);
    } catch (err) {
      ErrorToast("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [search, currentPage]);

  const createRole = async () => {
    if (!newRole.trim()) {
      ErrorToast("Role name is required");
      return;
    }

    try {
      await axios.post("/roles", { name: newRole });
      SuccessToast("Role created successfully");
      setNewRole("");
      fetchRoles();
    } catch (err) {
      ErrorToast("Failed to create role");
    }
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setEditedName(role.name);
    setEditModalOpen(true);
  };

  const updateRole = async () => {
    if (!editedName.trim()) {
      ErrorToast("Role name is required");
      return;
    }

    try {
      setUpdating(true);
      await axios.put(`/roles`, {
        id: editingRole._id,
        name: editedName,
      });
      SuccessToast("Role updated successfully");
      setEditModalOpen(false);
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      ErrorToast("Failed to update role");
    } finally {
      setUpdating(false);
    }
  };

  const deleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      await axios.delete(`/roles/${roleId}`);
      SuccessToast("Role deleted successfully");
      fetchRoles();
    } catch (err) {
      ErrorToast("Failed to delete role");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Create Role Form */}
      <div className="bg-[rgb(237_237_237)] shadow-md p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New Role</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter role name"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={createRole}
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
          setCurrentPage(1);
        }}
      />
      {/* Roles List with Search */}
      <div className="bg-[rgb(237_237_237)] shadow-md rounded-md p-4">
        {loading ? (
          <p className="text-gray-600 mt-4">Loading roles...</p>
        ) : roles.length === 0 ? (
          <p className="text-gray-500 mt-4">No roles found.</p>
        ) : (
          <>
            <table className="w-full table-auto border border-gray-200 rounded-lg mt-4">
              <thead className="bg-red-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">Role Name</th>
                  <th className="px-4 py-2 border">Created At</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, index) => (
                  <tr key={role._id} className="text-gray-800 hover:bg-gray-50">
                    <td className="px-4 py-2 text-center border">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2 text-center font-medium border">
                      {role.name}
                    </td>
                    <td className="px-4 py-2 text-center text-sm border">
                      {new Date(role.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-center border space-x-2">
                      <button
                        onClick={() => openEditModal(role)}
                        className="bg-blue-500 py-1 px-3 rounded-md text-white hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
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
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Role</h2>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Role name"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={updateRole}
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

export default Roles;
