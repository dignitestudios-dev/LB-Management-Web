import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast } from "../global/Toaster";

const FALLBACK_DEPT_KEYS = ["Design", "Dev", "PM", "SQA"];

const getDeptLabel = (key) => {
  if (key === "Project Management") return "PM";
  return key;
};

const ProductionHours = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "/global/project-hours-breakdown-with-rates"
      );
      setData(res.data.data || []);
    } catch {
      ErrorToast("Failed to fetch production hours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      </div>

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
                    <td className="border px-4 py-2 capitalize">{row.type}</td>
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
                      {row.TOTAL}
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
