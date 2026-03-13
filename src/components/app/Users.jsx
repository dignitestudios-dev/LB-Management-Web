import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { FiPlus, FiEdit2, FiFilter } from "react-icons/fi";
import { BiSearch } from "react-icons/bi";
import { FiX } from "react-icons/fi";
import Pagination from "../global/Pagination";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import UserFiltersModal from "./UserFiltersModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    department: "",
    employeeCode: "",
    isLead: false,
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    employeeCode: "",
    isLead: false,
    joiningDate: "",
  });

  // Pagination & Search
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50); // Fixed limit
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = {
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
  }, [search, page, selectedDepartments, selectedRoles]);

  const fetchFormOptions = async () => {
    try {
      const [roleRes, deptRes] = await Promise.all([
        axios.get("/roles/"),
        axios.get("/departments/"),
      ]);
      setRoles(roleRes.data.data);
      setDepartments(deptRes.data.data);
    } catch (err) {
      ErrorToast("Failed to load form data");
    }
  };

  useEffect(() => {
    fetchFormOptions();
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
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
      "employeeCode",
      "joiningDate",
    ];
    if (required.some((key) => !form[key])) {
      ErrorToast("Please fill all fields");
      setSubmitLoading(false);
      return;
    }

    try {
      await axios.post("/users/", {
        ...form,
        joiningDate: `${form.joiningDate}T00:00:00Z`,
      });
      SuccessToast("User created successfully!");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
        department: "",
        employeeCode: "",
        isLead: false,
        joiningDate: "",
      });
      setAddModalOpen(false);
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
      employeeCode: user.employeeCode || "",
      isLead: user.isLead || false,
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const updateUser = async () => {
    if (!editingUser) return;

    const {
      name,
      email,
      role,
      department,
      employeeCode,
      isLead,
      deactivate,
      deactivateDate,
    } = editForm;

    if (!name || !email || !role || !department || !employeeCode) {
      ErrorToast("All fields are required");
      return;
    }

    if (deactivate && !deactivateDate) {
      ErrorToast("Deactivation date is required");
      return;
    }

    try {
      setEditLoading(true);

      const body = {
        userId: editingUser._id,
        name,
        role,
        department,
        employeeCode,
        isLead,
        isDeleted: deactivate ? true : false,
        ...(deactivate && { deactivateDate }),
      };

      await axios.put("/users", body);

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

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Manage Users</h2>
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition"
        >
          <FiPlus className="text-base" />
          Add User
        </button>
      </div>

      <AddUserModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        form={form}
        onFormChange={handleChange}
        onSubmit={handleSubmit}
        roles={roles}
        departments={departments}
        submitLoading={submitLoading}
      />

      <UserFiltersModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        departments={departments}
        roles={roles}
        selectedDepartments={selectedDepartments}
        selectedRoles={selectedRoles}
        onApply={(depts, roles) => {
          setSelectedDepartments(depts);
          setSelectedRoles(roles);
          setPage(1);
        }}
      />

      {/* Search + Filter row */}
      <div className="mb-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <BiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search users..."
              className="h-10 w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterModalOpen(true)}
            className={`relative inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition ${
              selectedDepartments.length > 0 || selectedRoles.length > 0
                ? "border-primary bg-primary text-white"
                : "border-slate-300 bg-white text-slate-600"
            }`}
          >
            <FiFilter size={15} />
            Filters
            {(selectedDepartments.length > 0 || selectedRoles.length > 0) && (
              <span className="ml-0.5 rounded-full bg-white/30 px-1.5 py-0.5 text-xs font-semibold">
                {selectedDepartments.length + selectedRoles.length}
              </span>
            )}
          </button>
        </div>

        {/* Applied filter chips */}
        {(selectedDepartments.length > 0 || selectedRoles.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500">Active filters:</span>
            {selectedDepartments.map((id) => {
              const dept = departments.find((d) => d._id === id);
              return dept ? (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {dept.name}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDepartments((prev) =>
                        prev.filter((d) => d !== id),
                      );
                      setPage(1);
                    }}
                  >
                    <FiX size={11} />
                  </button>
                </span>
              ) : null;
            })}
            {selectedRoles.map((id) => {
              const role = roles.find((r) => r._id === id);
              return role ? (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {role.name}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoles((prev) => prev.filter((r) => r !== id));
                      setPage(1);
                    }}
                  >
                    <FiX size={11} />
                  </button>
                </span>
              ) : null;
            })}
            <button
              type="button"
              onClick={() => {
                setSelectedDepartments([]);
                setSelectedRoles([]);
                setPage(1);
              }}
              className="text-xs font-medium text-slate-500"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full">
            <thead className="sticky -top-px z-10 bg-[#f2e7f9] text-primary">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Employee Code</th>
                <th className="px-4 py-2 border">Department</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>

            {loading ? (
              <tbody>
                {[...Array(7)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-5 rounded bg-slate-200" />
                    </td>
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-28 rounded bg-slate-200" />
                    </td>
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-44 rounded bg-slate-200" />
                    </td>
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-20 rounded bg-slate-200" />
                    </td>
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-24 rounded bg-slate-200" />
                    </td>
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-20 rounded bg-slate-200" />
                    </td>
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-7 w-7 rounded-md bg-slate-200" />
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : users?.length > 0 ? (
              <tbody>
                {users?.map((user, i) => (
                  <tr
                    key={user._id}
                    className="border-t border-slate-100 text-gray-800 hover:bg-slate-50"
                  >
                    <td className="border px-4 py-2 text-center">{i + 1}</td>
                    <td className="border px-4 py-2 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span>{user.name}</span>
                        {user.isLead && (
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            Lead
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {user.email}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {user.employeeCode}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {user.department?.name || "—"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {user.role?.name || "—"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center justify-center rounded-md bg-primary p-1.5 text-white"
                        title="Edit User"
                      >
                        <FiEdit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Pagination */}
      {users?.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      )}

      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingUser(null);
        }}
        editForm={editForm}
        onEditFormChange={handleEditChange}
        onSetEditForm={setEditForm}
        onUpdate={updateUser}
        roles={roles}
        departments={departments}
        editLoading={editLoading}
      />
    </div>
  );
};

export default Users;
