import React, { useEffect, useState } from "react";
import { useUsers } from "../../hooks/api/Get";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { ImSpinner3 } from "react-icons/im";

const Users = () => {
  const { data: users, loading, setRefetch, refech } = useUsers("/users");
  const [roles, setRoles] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    shift: "",
    employeeCode: "",
  });

  // Fetch roles and departments
  const fetchFormOptions = async () => {
    try {
      const [roleRes, deptRes, shiftRes] = await Promise.all([
        axios.get("/roles/"),
        axios.get("/departments/"),
        axios.get("/shifts/"),
      ]);
      setRoles(roleRes.data.data);
      setDepartments(deptRes.data.data);
      setShifts(shiftRes.data.data);
    } catch (err) {
      ErrorToast("Failed to load roles or departments");
    }
  };

  console.log(shifts, "shift-->");

  useEffect(() => {
    fetchFormOptions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.role ||
      !form.department ||
      !form.employeeCode ||
      !form.shift
    ) {
      setSubmitLoading(false);
      ErrorToast("Please fill all fields");
      return;
    }

    try {
      await axios.post("/users/", form);
      SuccessToast("User created successfully!");
      setSubmitLoading(false);
      setRefetch(!refech);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
        department: "",
        employeeCode: "",
        shift: "",
      });
    } catch (err) {
      setSubmitLoading(false);
      ErrorToast("User creation failed");
    }
  };

  return (
    <div className="p-6">
      {/* User Creation Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[rgb(237 237 237)] p-4 rounded-lg shadow mb-6 space-y-3"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Create New User
        </h3>

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
          <select
            name="shift"
            value={form.shift}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Shifts</option>
            {shifts.map((shft) => {
              const formatHour = (hour) => {
                const period = hour >= 12 ? "PM" : "AM";
                const hour12 = hour % 12 === 0 ? 12 : hour % 12;
                return `${hour12}:00 ${period}`;
              };

              const shiftTime = `${formatHour(shft.startHour)} - ${formatHour(
                shft.endHour
              )}`;

              return (
                <option key={shft?._id} value={shft?._id}>
                  {shft?.name} ({shiftTime})
                </option>
              );
            })}
          </select>
        </div>

        <button
          type="submit"
          className="mt-4 bg-[#f40e00] text-white px-6 py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2"
          disabled={submitLoading}
        >
          Create User
          {submitLoading && <ImSpinner3 className="animate-spin" size={22} />}
        </button>
      </form>

      {/* User Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : users?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-[rgb(237 237 237)] rounded-xl shadow">
            <thead className="bg-red-100 text-gray-800">
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
                  <td className="border px-4 py-2">{user.role?.name || "—"}</td>
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
