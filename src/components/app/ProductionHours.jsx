import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast } from "../global/Toaster";
import { FiFilter, FiX } from "react-icons/fi";
import {
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineUsers,
} from "react-icons/hi2";

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

const formatMetric = (value) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)
    : "0";

const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ProductionHours = () => {
  const now = new Date();
  const currentMonthDefaults = {
    startDate: formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: formatDateLocal(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };

  const [rows, setRows] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(currentMonthDefaults);
  const [draftFilters, setDraftFilters] = useState(currentMonthDefaults);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await axios.get("/global/project-hours-breakdown-with-rates", {
        params,
      });

      setRows(res?.data?.data?.result || []);
      setMetrics(res?.data?.data?.metrics || null);
    } catch {
      ErrorToast("Failed to fetch production hours");
      setRows([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.startDate, filters.endDate]);

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraftFilters((prev) => ({ ...prev, [name]: value }));
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
    const cleared = currentMonthDefaults;
    setFilters(cleared);
    setDraftFilters(cleared);
  };

  const removeFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
    setDraftFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const activeFilterCount =
    (filters.startDate ? 1 : 0) + (filters.endDate ? 1 : 0);

  const statsLabel =
    filters.startDate || filters.endDate
      ? `${filters.startDate || "Start"} - ${filters.endDate || "End"}`
      : "All dates";

  const statsCards = [
    { title: "Total Hours", value: formatMetric(metrics?.totalHours), icon: HiOutlineClock },
    {
      title: "Billable Hours",
      value: formatMetric(metrics?.billableHours),
      icon: HiOutlineCurrencyDollar,
    },
    {
      title: "Non-Billable Hours",
      value: formatMetric(metrics?.nonBillableHours),
      icon: HiOutlineBriefcase,
    },
    {
      title: "Working Days",
      value: formatMetric(metrics?.totalWorkingDays),
      icon: HiOutlineCalendarDays,
    },
    {
      title: "Active Employees",
      value: formatMetric(metrics?.activeEmployeesCount),
      icon: HiOutlineUsers,
    },
  ];

  const firstRowCards = statsCards.slice(0, 3);
  const secondRowCards = statsCards.slice(3);

  const deptKeys =
    rows.length > 0 ? Object.keys(rows[0].hours || {}) : FALLBACK_DEPT_KEYS;
  const totalCols = 4 + deptKeys.length + 1 + deptKeys.length + 1;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Production Hours</h2>
            <p className="mt-0.5 text-sm text-slate-500">
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
                <h3 className="text-sm font-semibold text-slate-800">Start &amp; End Date</h3>
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

        {activeFilterCount > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={`metrics-top-skeleton-${index}`}
                className="h-[120px] animate-pulse rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="mt-3 h-6 w-16 rounded bg-slate-200" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-[66.666%] lg:grid-cols-2">
            {[...Array(2)].map((_, index) => (
              <div
                key={`metrics-bottom-skeleton-${index}`}
                className="h-[120px] animate-pulse rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="mt-3 h-6 w-16 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {firstRowCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="h-[120px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {card.title}
                    </p>
                    <span className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon size={20} />
                    </span>
                  </div>
                  <p className="mt-3 text-[26px] font-bold leading-none text-slate-900 tabular-nums">
                    {card.value}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">{statsLabel}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-[66.666%] lg:grid-cols-2">
            {secondRowCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="h-[120px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {card.title}
                    </p>
                    <span className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon size={20} />
                    </span>
                  </div>
                  <p className="mt-3 text-[26px] font-bold leading-none text-slate-900 tabular-nums">
                    {card.value}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">{statsLabel}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full border-separate border-spacing-0 text-center text-sm">
            <thead className="sticky -top-px z-10 bg-[#f2e7f9] text-primary">
              <tr>
                <th
                  rowSpan={2}
                  className="whitespace-nowrap border border-purple-300 px-4 py-2 font-semibold"
                >
                  #
                </th>
                <th
                  rowSpan={2}
                  className="whitespace-nowrap border border-purple-300 px-4 py-2 text-left font-semibold"
                >
                  Project
                </th>
                <th
                  rowSpan={2}
                  className="whitespace-nowrap border border-purple-300 px-4 py-2 font-semibold"
                >
                  Type
                </th>
                <th
                  rowSpan={2}
                  className="whitespace-nowrap border border-purple-300 px-4 py-2 font-semibold"
                >
                  Division
                </th>
                <th
                  colSpan={deptKeys.length + 1}
                  className="border border-purple-300 px-4 py-2 font-semibold tracking-wide"
                >
                  Hours
                </th>
                <th
                  colSpan={deptKeys.length + 1}
                  className="border border-purple-300 px-4 py-2 font-semibold tracking-wide"
                >
                  Amounts
                </th>
              </tr>
              <tr>
                {deptKeys.map((k) => (
                  <th
                    key={`h-${k}`}
                    className="whitespace-nowrap border border-purple-300 px-4 py-1.5 text-xs font-medium"
                  >
                    {getDeptLabel(k)}
                  </th>
                ))}
                <th className="whitespace-nowrap border border-purple-300 px-4 py-1.5 text-xs font-semibold">
                  Total
                </th>
                {deptKeys.map((k) => (
                  <th
                    key={`a-${k}`}
                    className="whitespace-nowrap border border-purple-300 px-4 py-1.5 text-xs font-medium"
                  >
                    {getDeptLabel(k)}
                  </th>
                ))}
                <th className="whitespace-nowrap border border-purple-300 px-4 py-1.5 text-xs font-semibold">
                  Total
                </th>
              </tr>
            </thead>

            {loading ? (
              <tbody>
                {[...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-5 rounded bg-slate-200" />
                    </td>
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-28 rounded bg-slate-200" />
                    </td>
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-16 rounded bg-slate-200" />
                    </td>
                    <td className="border px-4 py-3">
                      <div className="mx-auto h-3.5 w-24 rounded bg-slate-200" />
                    </td>
                    {[...Array(deptKeys.length + 1)].map((_, j) => (
                      <td key={`hs-${j}`} className="border px-4 py-3">
                        <div className="mx-auto h-3.5 w-10 rounded bg-slate-200" />
                      </td>
                    ))}
                    {[...Array(deptKeys.length + 1)].map((_, j) => (
                      <td key={`as-${j}`} className="border px-4 py-3">
                        <div className="mx-auto h-3.5 w-10 rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : rows.length > 0 ? (
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-slate-100 text-gray-800 hover:bg-slate-50"
                  >
                    <td className="border px-4 py-2">{i + 1}</td>
                    <td className="whitespace-nowrap border px-4 py-2 text-left font-medium">
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
                    <td className="whitespace-nowrap border px-4 py-2">
                      {row.division}
                    </td>
                    {deptKeys.map((k) => (
                      <td key={`hv-${k}`} className="border px-4 py-2">
                        {row.hours?.[k] ?? 0}
                      </td>
                    ))}
                    <td className="border px-4 py-2 font-semibold">{row.total}</td>
                    {deptKeys.map((k) => (
                      <td key={`av-${k}`} className="border px-4 py-2">
                        {row.amounts?.[k] ?? 0}
                      </td>
                    ))}
                    <td className="border px-4 py-2 font-semibold">{row.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={totalCols} className="p-8 text-center text-slate-400">
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
