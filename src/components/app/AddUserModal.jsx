import React from "react";
import { FiX } from "react-icons/fi";
import { ImSpinner3 } from "react-icons/im";

const AddUserModal = ({
  isOpen,
  onClose,
  form,
  onFormChange,
  onSubmit,
  roles,
  departments,
  submitLoading,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-xl transition-all duration-200 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">
            Create New User
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {["name", "email", "password", "employeeCode"].map((field) => (
              <label
                key={field}
                className="flex flex-col gap-1.5 text-sm font-medium text-slate-700"
              >
                <span className="flex items-center gap-0.5">
                  {field === "employeeCode"
                    ? "Employee Code"
                    : field.charAt(0).toUpperCase() + field.slice(1)}
                  <span className="text-red-500">*</span>
                </span>
                <input
                  name={field}
                  type={field === "password" ? "password" : "text"}
                  placeholder={
                    field === "employeeCode"
                      ? "Enter employee code"
                      : `Enter ${field}`
                  }
                  value={form[field]}
                  onChange={onFormChange}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            ))}

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              <span className="flex items-center gap-0.5">
                Role <span className="text-red-500">*</span>
              </span>
              <select
                name="role"
                value={form.role}
                onChange={onFormChange}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Select Role</option>
                {roles?.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              <span className="flex items-center gap-0.5">
                Department <span className="text-red-500">*</span>
              </span>
              <select
                name="department"
                value={form.department}
                onChange={onFormChange}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Select Department</option>
                {departments?.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              <span className="flex items-center gap-0.5">
                Joining Date <span className="text-red-500">*</span>
              </span>
              <input
                name="joiningDate"
                type="date"
                value={form.joiningDate}
                onChange={onFormChange}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            {/* Is Lead */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">Is Lead</p>
                  <p className="text-xs text-slate-500">
                    Mark this user as a team lead.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onFormChange({
                      target: {
                        name: "isLead",
                        type: "checkbox",
                        checked: !form.isLead,
                      },
                    })
                  }
                  aria-pressed={form.isLead}
                  className={`inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    form.isLead
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-300 bg-white text-slate-600"
                  }`}
                >
                  <span className="w-16 text-left">
                    {form.isLead ? "Lead" : "Standard"}
                  </span>
                  <span
                    className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${
                      form.isLead ? "bg-primary" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                        form.isLead ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] px-5 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitLoading && <ImSpinner3 className="animate-spin" />}
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
