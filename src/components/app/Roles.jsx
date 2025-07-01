import React, { useEffect, useState } from "react";
import axios from "../../axios"; // ✅ your axios instance
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editedName, setEditedName] = useState("");
  // Fetch roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/roles/");
      setRoles(res.data.data);
    } catch (err) {
      ErrorToast("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  // Create new role
  const createRole = async () => {
    if (!newRole.trim()) {
      ErrorToast("Role name is required");
      return;
    }

    try {
      await axios.post("/roles/", { name: newRole });
      SuccessToast("Role created successfully");
      setNewRole("");
      fetchRoles();
    } catch (err) {
      ErrorToast("Failed to create role");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openEditModal = (role) => {
    setEditingRole(role);
    setEditedName(role.name);
    setEditModalOpen(true);
  };

  const updateRole = async () => {
    try {
      await axios.put(`/roles`, { id: editingRole._id, name: editedName });
      SuccessToast("Role updated successfully");
      setEditModalOpen(false);
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      ErrorToast("Failed to update role");
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
      {/* Add Role Form */}
      <div className="bg-[rgb(237 237 237)] shadow-md p-4 rounded-md mb-6">
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
            Add
          </button>
        </div>
      </div>

      {/* Role List */}
      <div className="bg-[rgb(237 237 237)] shadow-md rounded-md p-4">
        <h3 className="text-lg font-semibold mb-3">All Roles</h3>
        {loading ? (
          <p className="text-gray-600">Loading roles...</p>
        ) : roles.length === 0 ? (
          <p className="text-gray-500">No roles found.</p>
        ) : (
          <table className="w-full table-auto border border-gray-200 rounded-lg">
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
                  <td className="px-4 py-2 text-center border">{index + 1}</td>
                  <td className="px-4 py-2 text-center font-medium border">
                    {role.name}
                  </td>
                  <td className="px-4 py-2 text-center text-sm border">
                    {new Date(role.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-center border space-x-2">
                    <button
                      onClick={() => openEditModal(role)}
                      className=" bg-blue-500 py-1 px-3 rounded-md text-white hover:underline"
                    >
                      Edit
                    </button>
                    {/* <button
                      onClick={() => deleteRole(role._id)}
                      className="text-white bg-red-500 py-1 px-3 rounded-md hover:underline"
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Role</h2>
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
                onClick={updateRole}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
