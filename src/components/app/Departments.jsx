import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../global/Toaster";
import { ImSpinner3 } from "react-icons/im";
import { FiEdit2, FiPlus, FiX } from "react-icons/fi";
import { BiSearch } from "react-icons/bi";
import Pagination from "../global/Pagination";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(50);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const [form, setForm] = useState({
    name: "",
    defaultRate: 0,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    defaultRate: 0,
  });

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
      setTotalPages(res?.data?.pagination?.totalPages || 1);
    } catch {
      ErrorToast("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [search, currentPage]);

  const createDepartment = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      ErrorToast("Department name is required");
      return;
    }

    try {
      setSubmitLoading(true);
      await axios.post("/departments", {
        name: form.name.trim(),
        defaultRate: Number(form.defaultRate) || 0,
      });
      SuccessToast("Department created successfully");
      setForm({ name: "", defaultRate: 0 });
      setAddModalOpen(false);
      fetchDepartments();
    } catch {
      ErrorToast("Failed to create department");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEditModal = (dept) => {
    setEditingDepartment(dept);
    setEditForm({
      name: dept.name || "",
      defaultRate: dept.defaultRate ?? 0,
    });
    setEditModalOpen(true);
  };

  const updateDepartment = async () => {
    if (!editForm.name.trim()) {
      ErrorToast("Department name is required");
      return;
    }

    try {
      setUpdating(true);
      await axios.put("/departments", {
        id: editingDepartment._id,
        name: editForm.name.trim(),
        defaultRate: Number(editForm.defaultRate) || 0,
      });
      SuccessToast("Department updated successfully");
      setEditModalOpen(false);
      setEditingDepartment(null);
      fetchDepartments();
    } catch {
      ErrorToast("Failed to update department");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Manage Departments</h2>
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition"
        >
          <FiPlus className="text-base" />
          Add Department
        </button>
      </div>

      {/* Create Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
          addModalOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            addModalOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setAddModalOpen(false)}
        />
        <div
          className={`relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl transition-all duration-200 ${
            addModalOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-800">Create New Department</h3>
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="rounded-md p-1 text-slate-400 transition"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          <form onSubmit={createDepartment} className="p-5">
            <div className="grid grid-cols-1 gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                <span>
                  Department Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter department name"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                <span>
                  Default Rate <span className="text-red-500">*</span>
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.defaultRate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, defaultRate: e.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading && <ImSpinner3 className="animate-spin text-sm" />}
                Create Department
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <BiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search departments..."
            className="h-10 w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full">
            <thead className="sticky -top-px z-10 bg-[#f2e7f9] text-primary">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Department Name</th>
                <th className="px-4 py-2 border">Default Rate</th>
                <th className="px-4 py-2 border">Created At</th>
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
                      <div className="mx-auto h-3.5 w-20 rounded bg-slate-200" />
                    </td>
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-24 rounded bg-slate-200" />
                    </td>
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-7 w-7 rounded-md bg-slate-200" />
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : departments.length > 0 ? (
              <tbody>
                {departments.map((dept, index) => (
                  <tr key={dept._id} className="border-t border-slate-100 text-gray-800 hover:bg-slate-50">
                    <td className="border px-4 py-2 text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="border px-4 py-2 text-center font-medium">{dept.name}</td>
                    <td className="border px-4 py-2 text-center">{dept.defaultRate ?? 0}</td>
                    <td className="border px-4 py-2 text-center text-sm">
                      {new Date(dept.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => openEditModal(dept)}
                        className="inline-flex items-center justify-center rounded-md bg-primary p-1.5 text-white"
                        title="Edit Department"
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
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No departments found.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Pagination */}
      {departments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Edit Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
          editModalOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            editModalOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => {
            setEditModalOpen(false);
            setEditingDepartment(null);
          }}
        />
        <div
          className={`relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl transition-all duration-200 ${
            editModalOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-800">Edit Department</h3>
            <button
              type="button"
              onClick={() => {
                setEditModalOpen(false);
                setEditingDepartment(null);
              }}
              className="rounded-md p-1 text-slate-400 transition"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                <span>
                  Department Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                <span>
                  Default Rate <span className="text-red-500">*</span>
                </span>
                <input
                  type="number"
                  min="0"
                  value={editForm.defaultRate}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, defaultRate: e.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingDepartment(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateDepartment}
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating && <ImSpinner3 className="animate-spin text-sm" />}
                Update Department
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Departments;
