import React, { useState } from "react";
import { FiX } from "react-icons/fi";

const UserFiltersModal = ({
  isOpen,
  onClose,
  departments,
  roles,
  selectedDepartments,
  selectedRoles,
  onApply,
  onReset,
  applyLoading = false,
}) => {
  const [localDepts, setLocalDepts] = useState(selectedDepartments);
  const [localRoles, setLocalRoles] = useState(selectedRoles);

  // Sync local state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalDepts(selectedDepartments);
      setLocalRoles(selectedRoles);
    }
  }, [isOpen]);

  const toggleDept = (id) =>
    setLocalDepts((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );

  const toggleRole = (id) =>
    setLocalRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );

  const handleReset = () => {
    if (onReset) {
      onReset();
      return;
    }

    setLocalDepts([]);
    setLocalRoles([]);
  };

  const handleApply = async () => {
    onClose();
    await onApply(localDepts, localRoles);
  };

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
        className={`relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl transition-all duration-200 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">Filters</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-5">
          {/* Departments */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Department
            </p>
            <div className="flex flex-wrap gap-2">
              {departments?.map((d) => {
                const active = localDepts.includes(d._id);
                return (
                  <button
                    key={d._id}
                    type="button"
                    onClick={() => toggleDept(d._id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "border-primary bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] text-white"
                        : "border-slate-300 bg-white text-slate-600"
                    }`}
                  >
                    {d.name}
                  </button>
                );
              })}
              {!departments?.length && (
                <p className="text-xs text-slate-400">No departments available</p>
              )}
            </div>
          </div>

          {/* Roles */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Role</p>
            <div className="flex flex-wrap gap-2">
              {roles?.map((r) => {
                const active = localRoles.includes(r._id);
                return (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => toggleRole(r._id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "border-primary bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] text-white"
                        : "border-slate-300 bg-white text-slate-600"
                    }`}
                  >
                    {r.name}
                  </button>
                );
              })}
              {!roles?.length && (
                <p className="text-xs text-slate-400">No roles available</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={applyLoading}
            className="text-sm font-medium text-slate-500"
          >
            Reset
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={applyLoading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={applyLoading}
              className={`rounded-lg px-5 py-2 text-sm font-medium text-white ${
                applyLoading
                  ? "cursor-not-allowed bg-primary/40"
                      : "bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] hover:brightness-110"
              }`}
            >
              {applyLoading ? "Applying..." : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFiltersModal;
