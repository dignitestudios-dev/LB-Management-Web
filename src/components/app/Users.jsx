import React, { useEffect, useState } from "react";
import { useUsers } from "../../hooks/api/Get";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const Users = () => {
  const { data: users, loading } = useUsers("/users");
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    employeeCode: "",
  });

  // Fetch roles and departments
  const fetchFormOptions = async () => {
    try {
      const [roleRes, deptRes] = await Promise.all([
        axios.get("/roles/"),
        axios.get("/departments/"),
      ]);
      setRoles(roleRes.data.data);
      setDepartments(deptRes.data.data);
    } catch (err) {
      ErrorToast("Failed to load roles or departments");
    }
  };

  useEffect(() => {
    fetchFormOptions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role || !form.department || !form.employeeCode) {
      ErrorToast("Please fill all fields");
      return;
    }

    try {
      await axios.post("/users/", form);
      SuccessToast("User created successfully!");
      setForm({ name: "", email: "", password: "", role: "", department: "", employeeCode: "" });
    } catch (err) {
      ErrorToast("User creation failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Users</h2>

      {/* User Creation Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-lg shadow mb-6 space-y-3"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Create New User</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
          <input
            name="employeeCode"
            type="text"
            placeholder="Employee Code"
            value={form.employeeCode}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Create User
        </button>
      </form>

      {/* User Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : users?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white rounded-xl shadow">
            <thead className="bg-blue-100 text-gray-800">
              <tr>
                <th className="px-4 py-3 border">Name</th>
                <th className="px-4 py-3 border">Email</th>
                <th className="px-4 py-3 border">Employee Code</th>
                <th className="px-4 py-3 border">Department</th>
                <th className="px-4 py-3 border">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50">
                  <td className="border px-4 py-2">{user.name}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.employeeCode}</td>
                  <td className="border px-4 py-2">
                    {user.department?.name || "—"}
                  </td>
                  <td className="border px-4 py-2">
                    {user.role?.name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No users found.</p>
      )}
    </div>
  );
};

export default Users;
