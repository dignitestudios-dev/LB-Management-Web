import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { ImSpinner3 } from "react-icons/im";
import SearchBar from "../global/SearchBar";
import Pagination from "../global/Pagination";
import MultiSelectFilter from "../ui/MultipleFilterSelector";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    department: "",
    shift: "",
    employeeCode: "",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    shift: "",
    employeeCode: "",
    joiningDate: "",
  });

  // Pagination & Search
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Fixed limit
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
  try {
    setLoading(true);

    const params= {
      search,
      page,
      limit,
    };

    // Add departments
    selectedDepartments.forEach((id, idx) => {
      params[`departmentId[${idx}]`] = id;
    });

    // Add roles
    selectedRoles.forEach((id, idx) => {
      params[`roleId[${idx}]`] = id;
    });

    // Add shifts
    selectedShifts.forEach((id, idx) => {
      params[`shiftId[${idx}]`] = id;
    });

    const res = await axios.get("/users", { params });

    setUsers(res.data.data);
    setTotalPages(res?.data?.pagination?.totalPages);
  } catch (err) {
    ErrorToast("Failed to fetch users");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchUsers();
}, [search, page, selectedDepartments, selectedRoles, selectedShifts]);


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
      ErrorToast("Failed to load form data");
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
    setSubmitLoading(true);

    const required = [
      "name",
      "email",
      "password",
      "role",
      "department",
      "shift",
      "employeeCode",
      "joiningDate",
    ];
    if (required.some((key) => !form[key])) {
      ErrorToast("Please fill all fields");
      setSubmitLoading(false);
      return;
    }

    try {
      await axios.post("/users/", form);
      SuccessToast("User created successfully!");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
        department: "",
        shift: "",
        employeeCode: "",
        joiningDate: "",
      });
      fetchUsers();
    } catch (err) {
      ErrorToast("User creation failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role?._id || "",
      department: user.department?._id || "",
      shift: user.shift?._id || "",
      employeeCode: user.employeeCode || "",
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const updateUser = async () => {
    if (!editingUser) return;

    const { name, email, role, department, shift, employeeCode } = editForm;

    if (!name || !email || !role || !department || !shift || !employeeCode) {
      ErrorToast("All fields  are required");
      return;
    }

    try {
      setEditLoading(true);
      await axios.put("/users", {
        userId: editingUser._id,
        name,
        role,
        department,
        shift,
        employeeCode,
      });

      SuccessToast("User updated successfully");
      setEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      ErrorToast("Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  const formatHour = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return `${h}:00 ${period}`;
  };

  return (
    <div className="p-6">
      {/* Create User Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[rgb(237_237_237)] p-4 rounded-lg shadow mb-6 space-y-3"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Create New User
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["name", "email", "password", "employeeCode"].map((field) => (
            <input
              key={field}
              name={field}
              type={field === "password" ? "password" : "text"}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={handleChange}
              className="p-2 border rounded w-full"
            />
          ))}

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
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
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            name="shift"
            value={form.shift}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Shift</option>
            {shifts.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({formatHour(s.startHour)} - {formatHour(s.endHour)})
              </option>
            ))}
          </select>
               <input
       
              name={"joiningDate"}
              type={"date"}
              placeholder={"Joining Date"}
              value={form["joiningDate"]}
              onChange={handleChange}
              className="p-2 border rounded w-full"
            />
        </div>

        <button
          type="submit"
          className="mt-4 bg-[#f40e00] text-white px-6 py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2"
          disabled={submitLoading}
        >
          {submitLoading && <ImSpinner3 className="animate-spin" />} Create User
        </button>
      </form>
      <SearchBar
        onSearch={(q) => {
          setSearch(q);
          setPage(1); // Reset to page 1 on new search
        }}
      />
         <div className="flex gap-4 mb-4">
  <MultiSelectFilter
    title="Departments"
    options={departments.map((d) => ({ value: d._id, label: d.name }))}
    selected={selectedDepartments}
    setSelected={setSelectedDepartments}
  />
  <MultiSelectFilter
    title="Roles"
    options={roles.map((r) => ({ value: r._id, label: r.name }))}
    selected={selectedRoles}
    setSelected={setSelectedRoles}
  />
  <MultiSelectFilter
    title="Shifts"
    options={shifts.map((s) => ({ value: s._id, label: s.name }))}
    selected={selectedShifts}
    setSelected={setSelectedShifts}
  />
</div>

      {/* Users Table */}
      {loading ? (
        <p className="text-center text-gray-500">Loading users...</p>
      ) : users.length > 0 ? (
        <>
      


          <div className="overflow-x-auto p-4 bg-[rgb(237_237_237)] rounded-xl shadow">
            <table className="min-w-full border ">
              <thead className="bg-red-100 text-gray-800">
                <tr>
                  <th className="px-4 py-3 border">#</th>
                  <th className="px-4 py-3 border">Name</th>
                  <th className="px-4 py-3 border">Email</th>
                  <th className="px-4 py-3 border">Employee Code</th>
                  <th className="px-4 py-3 border">Department</th>
                  <th className="px-4 py-3 border">Role</th>
                  <th className="px-4 py-3 border">Shift</th>
                  <th className="px-4 py-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user._id} className="hover:bg-blue-50">
                    <td className="border text-center px-4 py-2">{i + 1}</td>
                    <td className="border text-center px-4 py-2">
                      {user.name}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {user.email}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {user.employeeCode}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {user.department?.name || "—"}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {user.role?.name || "—"}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {user.shift
                        ? `${user.shift.name} (${formatHour(
                            user.shift.startHour
                          )} - ${formatHour(user.shift.endHour)})`
                        : "—"}
                    </td>

                    <td className="px-4 py-2 text-center border">
                      <button
                        onClick={() => openEditModal(user)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      ) : (
        <p className="text-center text-gray-600">No users found.</p>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-xl">
            <h2 className="text-lg font-semibold mb-4">Edit User</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["name", "employeeCode"].map((field) => (
                <input
                  key={field}
                  name={field}
                  type={"text"}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={editForm[field]}
                  onChange={handleEditChange}
                  className="p-2 border rounded"
                />
              ))}

              <select
                name="role"
                value={editForm.role}
                onChange={handleEditChange}
                className="p-2 border rounded"
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                name="department"
                value={editForm.department}
                onChange={handleEditChange}
                className="p-2 border rounded"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                name="shift"
                value={editForm.shift}
                onChange={handleEditChange}
                className="p-2 border rounded"
              >
                <option value="">Select Shift</option>
                {shifts.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({formatHour(s.startHour)} -{" "}
                    {formatHour(s.endHour)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={updateUser}
                disabled={editLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                Update {editLoading && <ImSpinner3 className="animate-spin" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
