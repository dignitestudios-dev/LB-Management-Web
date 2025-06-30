import React, { useEffect, useState } from 'react';
import axios from '../../axios'; // ✅ your axios instance
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/roles/');
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
      await axios.post('/roles/', { name: newRole });
      SuccessToast("Role created successfully");
      setNewRole('');
      fetchRoles();
    } catch (err) {
      ErrorToast("Failed to create role");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">

      {/* Add Role Form */}
      <div className="bg-white shadow-md p-4 rounded-md mb-6">
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Role List */}
      <div className="bg-white shadow-md rounded-md p-4">
        <h3 className="text-lg font-semibold mb-3">All Roles</h3>
        {loading ? (
          <p>Loading roles...</p>
        ) : (
          <ul className="space-y-2">
            {roles.map((role) => (
              <li
                key={role._id}
                className="border-b py-2 text-gray-800"
              >
                <strong>{role.name}</strong> <span className="text-sm text-gray-500">({new Date(role.createdAt).toLocaleDateString()})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Roles;
