import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { ImSpinner3 } from "react-icons/im";

const MONTHS = [
  { num: 1, label: "Jan" },
  { num: 2, label: "Feb" },
  { num: 3, label: "Mar" },
  { num: 4, label: "Apr" },
  { num: 5, label: "May" },
  { num: 6, label: "Jun" },
  { num: 7, label: "Jul" },
  { num: 8, label: "Aug" },
  { num: 9, label: "Sep" },
  { num: 10, label: "Oct" },
  { num: 11, label: "Nov" },
  { num: 12, label: "Dec" },
];

const currentYear = new Date().getFullYear();

const UpdateRatesModal = ({ isOpen, onClose, departments, onUpdate, updateLoading }) => {
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [year, setYear] = useState(currentYear);
  const [rate, setRate] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedDepts([]);
      setSelectedMonths([]);
      setYear(currentYear);
      setRate("");
    }
  }, [isOpen]);

  const toggleDept = (id) =>
    setSelectedDepts((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );

  const toggleMonth = (num) =>
    setSelectedMonths((prev) =>
      prev.includes(num) ? prev.filter((m) => m !== num) : [...prev, num]
    );

  const toggleAllMonths = () =>
    setSelectedMonths((prev) =>
      prev.length === 12 ? [] : MONTHS.map((m) => m.num)
    );

  const handleSubmit = () => {
    onUpdate({
      departmentIds: selectedDepts,
      months: selectedMonths,
      year,
      rate: Number(rate),
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
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
          <h3 className="text-base font-semibold text-slate-800">Update Rates</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className="flex flex-col gap-5">

            {/* Departments */}
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">
                Departments <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {departments?.map((dept) => {
                  const active = selectedDepts.includes(dept._id);
                  return (
                    <button
                      key={dept._id}
                      type="button"
                      onClick={() => toggleDept(dept._id)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      {dept.name}
                    </button>
                  );
                })}
              </div>
              {selectedDepts.length > 0 && (
                <p className="mt-1.5 text-xs text-slate-400">
                  {selectedDepts.length} selected
                </p>
              )}
            </div>

            {/* Months */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">
                  Months <span className="text-red-500">*</span>
                </p>
                <button
                  type="button"
                  onClick={toggleAllMonths}
                  className="text-xs font-medium text-primary"
                >
                  {selectedMonths.length === 12 ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {MONTHS.map((m) => {
                  const active = selectedMonths.includes(m.num);
                  return (
                    <button
                      key={m.num}
                      type="button"
                      onClick={() => toggleMonth(m.num)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year + Rate */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                <span>
                  Year <span className="text-red-500">*</span>
                </span>
                <input
                  type="number"
                  value={year}
                  min={2022}
                  max={currentYear}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 2022 && val <= currentYear) setYear(val);
                  }}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                <span>
                  Rate <span className="text-red-500">*</span>
                </span>
                <input
                  type="number"
                  value={rate}
                  min={0}
                  placeholder="Enter rate"
                  onChange={(e) => setRate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              updateLoading ||
              selectedDepts.length === 0 ||
              selectedMonths.length === 0 ||
              !rate
            }
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateLoading && (
              <ImSpinner3 className="animate-spin text-sm" />
            )}
            Update Rates
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateRatesModal;
