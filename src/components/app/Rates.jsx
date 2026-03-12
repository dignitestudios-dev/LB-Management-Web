import React, { useEffect, useRef, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { FiEdit2 } from "react-icons/fi";
import UpdateRatesModal from "./UpdateRatesModal";
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const currentYear = new Date().getFullYear();

const Rates = () => {
  const [rates, setRates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [year, setYear] = useState(currentYear);
  const [inputYear, setInputYear] = useState(String(currentYear));
  const debounceRef = useRef(null);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/rates", { params: { year } });
      setRates(res.data.data);
    } catch (err) {
      ErrorToast("Failed to fetch rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [year]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("/departments/");
        setDepartments(res.data.data);
      } catch {
        ErrorToast("Failed to load departments");
      }
    };
    fetchDepartments();
  }, []);

  const handleUpdateRates = async ({ departmentIds, months, year: rateYear, rate }) => {
    if (!departmentIds.length) return ErrorToast("Select at least one department");
    if (!months.length) return ErrorToast("Select at least one month");
    if (!rate && rate !== 0) return ErrorToast("Enter a rate value");
    try {
      setUpdateLoading(true);
      await axios.put("/rates", { departmentIds, months, year: rateYear, rate });
      SuccessToast("Rates updated successfully");
      setUpdateModalOpen(false);
      fetchRates();
    } catch {
      ErrorToast("Failed to update rates");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleYearChange = (e) => {
    const raw = e.target.value;
    setInputYear(raw);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const val = Number(raw);
      if (val >= 2022 && val <= currentYear && val !== year) {
        setYear(val);
      }
    }, 600);
  };

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Rates</h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              value={inputYear}
              min={2022}
              max={currentYear}
              onChange={handleYearChange}
              className="h-10 w-28 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <button
            onClick={() => setUpdateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition"
          >
            <FiEdit2 size={14} />
            Update Rates
          </button>
        </div>
      </div>

      {/* Rates Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full">
            <thead className="sticky -top-px z-10 bg-[#f2e7f9] text-primary">
              <tr>
                <th className="border px-4 py-2 text-left font-semibold">
                  Department
                </th>
                {MONTH_NAMES.map((m) => (
                  <th key={m} className="border px-4 py-2 font-semibold">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>

            {loading ? (
              <tbody>
                {[...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="border px-4 py-3">
                      <div className="h-3.5 w-28 rounded bg-slate-200" />
                    </td>
                    {[...Array(12)].map((_, j) => (
                      <td key={j} className="border px-4 py-3">
                        <div className="mx-auto h-3.5 w-10 rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : rates?.length > 0 ? (
              <tbody>
                {rates.map((rate) => (
                  <tr
                    key={rate._id}
                    className="border-t border-slate-100 text-gray-800 hover:bg-slate-50"
                  >
                    <td className="border px-4 py-2 font-medium text-slate-700">
                      {rate.name}
                    </td>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <td
                        key={month}
                        className="border px-4 py-2 text-center tabular-nums"
                      >
                        {rate.months?.[String(month)] ?? rate.defaultRate ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td
                    colSpan="13"
                    className="p-8 text-center text-slate-400"
                  >
                    No rates found for {year}.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>

      <UpdateRatesModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        departments={departments}
        onUpdate={handleUpdateRates}
        updateLoading={updateLoading}
      />
    </div>
  );
};

export default Rates;
