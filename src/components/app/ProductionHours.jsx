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
const MIN_YEAR = 2024;
const MONTH_OPTIONS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

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

const getMonthLabel = (monthValue) =>
  MONTH_OPTIONS.find((m) => m.value === Number(monthValue))?.label || "-";

const formatMetric = (value) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)
    : "0";

const ProductionHours = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [statsFilterOpen, setStatsFilterOpen] = useState(false);
  const [tableFilterOpen, setTableFilterOpen] = useState(false);
  const [statsFilters, setStatsFilters] = useState({
    month: currentMonth,
    year: currentYear,
  });
  const [draftStatsFilters, setDraftStatsFilters] = useState({
    month: currentMonth,
    year: currentYear,
  });
  const [tableFilters, setTableFilters] = useState({ startDate: "", endDate: "" });
  const [draftTableFilters, setDraftTableFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (tableFilters.startDate) params.startDate = tableFilters.startDate;
      if (tableFilters.endDate) params.endDate = tableFilters.endDate;
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

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    try {
      const res = await axios.get("/global/hours-metrics", {
        params: {
          month: statsFilters.month,
          year: statsFilters.year,
        },
      });
      setMetrics(res?.data?.data?.metrics || null);
    } catch {
      ErrorToast("Failed to fetch hours metrics");
      setMetrics(null);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableFilters.startDate, tableFilters.endDate]);

  useEffect(() => {
    fetchMetrics();
  }, [statsFilters.month, statsFilters.year]);

  useEffect(() => {
    if (
      Number(draftStatsFilters.year) === currentYear &&
      Number(draftStatsFilters.month) > currentMonth
    ) {
      setDraftStatsFilters((prev) => ({ ...prev, month: currentMonth }));
    }
  }, [currentMonth, currentYear, draftStatsFilters.month, draftStatsFilters.year]);

  const handleStatsDraftChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "month" ? Number(value) : value.replace(/\D/g, "").slice(0, 4);
    setDraftStatsFilters((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const applyStatsFilters = () => {
    const selectedYear = Number(draftStatsFilters.year);
    const selectedMonth = Number(draftStatsFilters.month);

    if (!Number.isInteger(selectedYear)) {
      ErrorToast("Please enter a valid year");
      return;
    }

    if (selectedYear < MIN_YEAR || selectedYear > currentYear) {
      ErrorToast(`Year must be between ${MIN_YEAR} and ${currentYear}`);
      return;
    }

    const maxMonthForYear = selectedYear === currentYear ? currentMonth : 12;
    if (
      !Number.isInteger(selectedMonth) ||
      selectedMonth < 1 ||
      selectedMonth > maxMonthForYear
    ) {
      ErrorToast(
        selectedYear === currentYear
          ? `For ${currentYear}, month cannot be greater than ${currentMonth}`
          : "Please select a valid month",
      );
      return;
    }

    setStatsFilters({ month: selectedMonth, year: selectedYear });
    setStatsFilterOpen(false);
  };

  const clearStatsFilters = () => {
    const defaults = { month: currentMonth, year: currentYear };
    setStatsFilters(defaults);
    setDraftStatsFilters(defaults);
  };

  const removeStatsFilter = (key) => {
    const defaults = { month: currentMonth, year: currentYear };
    setStatsFilters((prev) => ({ ...prev, [key]: defaults[key] }));
    setDraftStatsFilters((prev) => ({ ...prev, [key]: defaults[key] }));
  };

  const handleTableDraftChange = (e) => {
    const { name, value } = e.target;
    setDraftTableFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyTableFilters = () => {
    if (
      draftTableFilters.startDate &&
      draftTableFilters.endDate &&
      draftTableFilters.startDate > draftTableFilters.endDate
    ) {
      ErrorToast("Start date cannot be after end date");
      return;
    }
    setTableFilters(draftTableFilters);
    setTableFilterOpen(false);
  };

  const clearTableFilters = () => {
    const defaults = { startDate: "", endDate: "" };
    setTableFilters(defaults);
    setDraftTableFilters(defaults);
  };

  const removeTableFilter = (key) => {
    setTableFilters((prev) => ({ ...prev, [key]: "" }));
    setDraftTableFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const activeStatsFilterCount =
    (statsFilters.month !== currentMonth ? 1 : 0) +
    (statsFilters.year !== currentYear ? 1 : 0);
  const activeTableFilterCount =
    (tableFilters.startDate ? 1 : 0) + (tableFilters.endDate ? 1 : 0);

  const maxMonthForDraftYear =
    Number(draftStatsFilters.year) === currentYear ? currentMonth : 12;

  const statsCards = [
    {
      title: "Total Hours",
      value: formatMetric(metrics?.totalHours),
      icon: HiOutlineClock,
      cardClass: "from-primary/15 via-primary/5 to-white border-primary/30",
      iconClass: "bg-primary/15 text-primary",
    },
    {
      title: "Billable Hours",
      value: formatMetric(metrics?.billableHours),
      icon: HiOutlineCurrencyDollar,
      cardClass: "from-primary/15 via-primary/5 to-white border-primary/30",
      iconClass: "bg-primary/15 text-primary",
    },
    {
      title: "Non-Billable Hours",
      value: formatMetric(metrics?.nonBillableHours),
      icon: HiOutlineBriefcase,
      cardClass: "from-primary/15 via-primary/5 to-white border-primary/30",
      iconClass: "bg-primary/15 text-primary",
    },
    {
      title: "Working Days",
      value: formatMetric(metrics?.totalWorkingDays),
      icon: HiOutlineCalendarDays,
      cardClass: "from-primary/15 via-primary/5 to-white border-primary/30",
      iconClass: "bg-primary/15 text-primary",
    },
    {
      title: "Active Employees",
      value: formatMetric(metrics?.activeEmployeesCount),
      icon: HiOutlineUsers,
      cardClass: "from-primary/15 via-primary/5 to-white border-primary/30",
      iconClass: "bg-primary/15 text-primary",
    },
  ];
  const firstRowCards = statsCards.slice(0, 3);
  const secondRowCards = statsCards.slice(3);

  const deptKeys =
    data.length > 0 ? Object.keys(data[0].hours || {}) : FALLBACK_DEPT_KEYS;
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
              onClick={() => {
                setStatsFilterOpen((prev) => !prev);
                setTableFilterOpen(false);
              }}
              className={`relative inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition ${
                activeStatsFilterCount > 0
                  ? "border-primary bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] text-white"
                  : "border-slate-300 bg-white text-slate-600"
              }`}
            >
              <FiFilter size={15} />
              Filters
              {activeStatsFilterCount > 0 && (
                <span className="ml-0.5 rounded-full bg-white/30 px-1.5 py-0.5 text-xs font-semibold">
                  {activeStatsFilterCount}
                </span>
              )}
            </button>

            {statsFilterOpen && (
              <div className="absolute right-0 top-12 z-20 w-[310px] rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-800">Month &amp; Year</h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Select Month
                    </label>
                    <select
                      name="month"
                      value={draftStatsFilters.month}
                      onChange={handleStatsDraftChange}
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      {MONTH_OPTIONS.filter((m) => m.value <= maxMonthForDraftYear).map(
                        (month) => (
                          <option key={month.value} value={month.value}>
                            {month.value} - {month.label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Enter Year
                    </label>
                    <input
                      type="number"
                      name="year"
                      min={MIN_YEAR}
                      max={currentYear}
                      value={draftStatsFilters.year}
                      onChange={handleStatsDraftChange}
                      onBlur={() => {
                        if (!draftStatsFilters.year) {
                          setDraftStatsFilters((prev) => ({ ...prev, year: currentYear }));
                        }
                      }}
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={clearStatsFilters}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={applyStatsFilters}
                    className="rounded-lg bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {activeStatsFilterCount > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500">Active filters:</span>
            {statsFilters.month !== currentMonth && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Month: {getMonthLabel(statsFilters.month)}
                <button type="button" onClick={() => removeStatsFilter("month")}>
                  <FiX size={11} />
                </button>
              </span>
            )}
            {statsFilters.year !== currentYear && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Year: {statsFilters.year}
                <button type="button" onClick={() => removeStatsFilter("year")}>
                  <FiX size={11} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearStatsFilters}
              className="text-xs font-medium text-slate-500"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {metricsLoading ? (
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
                  className={`h-[120px] rounded-xl border bg-gradient-to-br p-3 shadow-sm transition hover:shadow-md ${card.cardClass}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/90">
                      {card.title}
                    </p>
                    <span className={`rounded-lg p-2 ${card.iconClass}`}>
                      <Icon size={22} />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold leading-none text-slate-900">
                    {card.value}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {getMonthLabel(statsFilters.month)} {statsFilters.year}
                  </p>
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
                  className={`h-[120px] rounded-xl border bg-gradient-to-br p-3 shadow-sm transition hover:shadow-md ${card.cardClass}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/90">
                      {card.title}
                    </p>
                    <span className={`rounded-lg p-2 ${card.iconClass}`}>
                      <Icon size={22} />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold leading-none text-slate-900">
                    {card.value}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {getMonthLabel(statsFilters.month)} {statsFilters.year}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="flex items-center justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setTableFilterOpen((prev) => !prev);
              setStatsFilterOpen(false);
            }}
            className={`relative inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition ${
              activeTableFilterCount > 0
                ? "border-primary bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] text-white"
                : "border-slate-300 bg-white text-slate-600"
            }`}
          >
            <FiFilter size={15} />
            Filters
            {activeTableFilterCount > 0 && (
              <span className="ml-0.5 rounded-full bg-white/30 px-1.5 py-0.5 text-xs font-semibold">
                {activeTableFilterCount}
              </span>
            )}
          </button>

          {tableFilterOpen && (
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
                    value={draftTableFilters.startDate}
                    onChange={handleTableDraftChange}
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
                    value={draftTableFilters.endDate}
                    onChange={handleTableDraftChange}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={clearTableFilters}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={applyTableFilters}
                  className="rounded-lg bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTableFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500">Active filters:</span>
          {tableFilters.startDate && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Start: {tableFilters.startDate}
              <button type="button" onClick={() => removeTableFilter("startDate")}>
                <FiX size={11} />
              </button>
            </span>
          )}
          {tableFilters.endDate && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              End: {tableFilters.endDate}
              <button type="button" onClick={() => removeTableFilter("endDate")}>
                <FiX size={11} />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={clearTableFilters}
            className="text-xs font-medium text-slate-500"
          >
            Clear all
          </button>
        </div>
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
            ) : data.length > 0 ? (
              <tbody>
                {data.map((row, i) => (
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
