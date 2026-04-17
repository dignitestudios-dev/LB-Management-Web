import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast } from "../global/Toaster";
import { FiFilter, FiX } from "react-icons/fi";

const FALLBACK_DEPT_KEYS = ["Design", "Dev", "PM", "SQA"];

const getDeptLabel = (key) => {
  if (key === "Project Management") return "PM";
  return key;
};

const getTypeBadgeClasses = (type) => {
  const normalized = String(type || "").toLowerCase();

  if (normalized === "internal") {
    return "border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "external") {
    return "border-blue-300 bg-blue-50 text-blue-700";
  }

  return "border-slate-300 bg-slate-100 text-slate-700";
};

const ProductionHours = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [draftFilters, setDraftFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await axios.get("/global/project-hours-breakdown-with-rates", {
        params,
      });
      setData(res.data.data || []);
    } catch {
      ErrorToast("Failed to fetch production hours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.startDate, filters.endDate]);

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraftFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    if (
      draftFilters.startDate &&
      draftFilters.endDate &&
      draftFilters.startDate > draftFilters.endDate
    ) {
      ErrorToast("Start date cannot be after end date");
      return;
    }

    setFilters(draftFilters);
    setFilterOpen(false);
  };

  const clearAllFilters = () => {
    const cleared = { startDate: "", endDate: "" };
    setFilters(cleared);
    setDraftFilters(cleared);
  };

  const removeFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "",
    }));
    setDraftFilters((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const activeFilterCount =
    (filters.startDate ? 1 : 0) + (filters.endDate ? 1 : 0);

  // Derive department keys dynamically from the first row; fall back to defaults while loading
  const deptKeys =
    data.length > 0 ? Object.keys(data[0].hours) : FALLBACK_DEPT_KEYS;

  const totalCols = 4 + deptKeys.length + 1 + deptKeys.length + 1;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Production Hours
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Project hours &amp; amount breakdown by department
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`relative inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition ${
              activeFilterCount > 0
                ? "border-primary bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] text-white"
                : "border-slate-300 bg-white text-slate-600"
            }`}
          >
            <FiFilter size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 rounded-full bg-white/30 px-1.5 py-0.5 text-xs font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-12 z-20 w-[310px] rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-slate-800">Date Filters</h3>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={draftFilters.startDate}
                    onChange={handleDraftChange}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={draftFilters.endDate}
                    onChange={handleDraftChange}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="rounded-lg bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applied filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500">Active filters:</span>
          {filters.startDate && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Start: {filters.startDate}
              <button type="button" onClick={() => removeFilter("startDate")}>
                <FiX size={11} />
              </button>
            </span>
          )}
          {filters.endDate && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              End: {filters.endDate}
              <button type="button" onClick={() => removeFilter("endDate")}>
                <FiX size={11} />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-medium text-slate-500"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Table card */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full text-sm text-center border-separate border-spacing-0">
            <thead className="sticky -top-px z-10 bg-[#f2e7f9] text-primary">
              {/* Row 1 — group headers */}
              <tr>
                <th
                  rowSpan={2}
                  className="border border-purple-300 px-4 py-2 font-semibold whitespace-nowrap"
                >
                  #
                </th>
                <th
                  rowSpan={2}
                  className="border border-purple-300 px-4 py-2 font-semibold whitespace-nowrap text-left"
                >
                  Project
                </th>
                <th
                  rowSpan={2}
                  className="border border-purple-300 px-4 py-2 font-semibold whitespace-nowrap"
                >
                  Type
                </th>
                <th
                  rowSpan={2}
                  className="border border-purple-300 px-4 py-2 font-semibold whitespace-nowrap"
                >
                  Division
                </th>
                {/* Hours group */}
                <th
                  colSpan={deptKeys.length + 1}
                  className="border border-purple-300 px-4 py-2 font-semibold tracking-wide"
                >
                  Hours
                </th>
                {/* Amounts group */}
                <th
                  colSpan={deptKeys.length + 1}
                  className="border border-purple-300 px-4 py-2 font-semibold tracking-wide"
                >
                  Amounts
                </th>
              </tr>

              {/* Row 2 — sub-column headers */}
              <tr>
                {deptKeys.map((k) => (
                  <th
                    key={`h-${k}`}
                    className="border border-purple-300 px-4 py-1.5 font-medium whitespace-nowrap text-xs"
                  >
                    {getDeptLabel(k)}
                  </th>
                ))}
                <th className="border border-purple-300 px-4 py-1.5 font-semibold whitespace-nowrap text-xs">
                  Total
                </th>

                {deptKeys.map((k) => (
                  <th
                    key={`a-${k}`}
                    className="border border-purple-300 px-4 py-1.5 font-medium whitespace-nowrap text-xs"
                  >
                    {getDeptLabel(k)}
                  </th>
                ))}
                <th className="border border-purple-300 px-4 py-1.5 font-semibold whitespace-nowrap text-xs">
                  Total
                </th>
              </tr>
            </thead>

            {loading ? (
              <tbody>
                {[...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {/* # */}
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-5 rounded bg-slate-200" />
                    </td>
                    {/* Project */}
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-28 rounded bg-slate-200" />
                    </td>
                    {/* Type */}
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-16 rounded bg-slate-200" />
                    </td>
                    {/* Division */}
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-24 rounded bg-slate-200" />
                    </td>
                    {/* Hours cols + total */}
                    {[...Array(deptKeys.length + 1)].map((_, j) => (
                      <td key={`hs-${j}`} className="border px-4 py-3">
                        <div className="mx-auto h-3.5 w-10 rounded bg-slate-200" />
                      </td>
                    ))}
                    {/* Amount cols + total */}
                    {[...Array(deptKeys.length + 1)].map((_, j) => (
                      <td key={`as-${j}`} className="border px-4 py-3">
                        <div className="mx-auto h-3.5 w-10 rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : data.length > 0 ? (
              <tbody>
                {data.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-slate-100 text-gray-800 hover:bg-slate-50"
                  >
                    <td className="border px-4 py-2">{i + 1}</td>
                    <td className="border px-4 py-2 text-left font-medium whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="border px-4 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getTypeBadgeClasses(
                          row.type,
                        )}`}
                      >
                        {row.type || "-"}
                      </span>
                    </td>
                    <td className="border px-4 py-2 whitespace-nowrap">
                      {row.division}
                    </td>

                    {/* Hours per department */}
                    {deptKeys.map((k) => (
                      <td key={`hv-${k}`} className="border px-4 py-2">
                        {row.hours?.[k] ?? 0}
                      </td>
                    ))}
                    {/* Hours TOTAL */}
                    <td className="border px-4 py-2 font-semibold">
                      {row.total}
                    </td>

                    {/* Amounts per department */}
                    {deptKeys.map((k) => (
                      <td key={`av-${k}`} className="border px-4 py-2">
                        {row.amounts?.[k] ?? 0}
                      </td>
                    ))}
                    {/* Amounts TOTAL */}
                    <td className="border px-4 py-2 font-semibold">
                      {row.totalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td
                    colSpan={totalCols}
                    className="p-8 text-center text-slate-400"
                  >
                    No production data found.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionHours;
