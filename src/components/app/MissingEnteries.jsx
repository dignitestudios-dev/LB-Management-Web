import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaSpinner } from "react-icons/fa";
import instance from "../../axios";
import EmployeeMissingEntryTable from "./EmployeeMissingEntryTable";
import { FiFilter } from "react-icons/fi";
import { ErrorToast } from "../global/Toaster";
import { formatHour } from "../../lib/helpers";
import { FiX } from "react-icons/fi";
import UserFiltersModal from "./UserFiltersModal";

const MissingEnteries = () => {
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const currentMonth = getCurrentMonth();

  const formatDateLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatMonthLabel = (monthValue) => {
    if (!monthValue) return "";
    const [year, month] = monthValue.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getMonthDateBounds = (fromMonthValue, toMonthValue) => {
    if (!fromMonthValue || !toMonthValue) return { startDate: "", endDate: "" };

    const [fromYear, fromMonth] = fromMonthValue.split("-").map(Number);
    const [toYear, toMonth] = toMonthValue.split("-").map(Number);

    const firstDay = new Date(fromYear, fromMonth - 1, 1);
    const lastDay = new Date(toYear, toMonth, 0);
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === toYear && today.getMonth() + 1 === toMonth;

    return {
      startDate: formatDateLocal(firstDay),
      endDate: formatDateLocal(isCurrentMonth ? today : lastDay),
    };
  };

  const [fromMonth, setFromMonth] = useState(currentMonth);
  const [toMonth, setToMonth] = useState(currentMonth);

  const [isOpen, setIsOpen] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [tableShow, setTableShow] = useState(false);
  const [summaryLabel, setSummaryLabel] = useState(formatMonthLabel(currentMonth));
  const [extraFilterModalOpen, setExtraFilterModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const fetchFormOptions = async () => {
    try {
      const [roleRes, deptRes] = await Promise.all([
        instance.get("/roles/"),
        instance.get("/departments/"),
      ]);
      setRoles(roleRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (err) {
      ErrorToast("Failed to load filter options");
    }
  };

  useEffect(() => {
    fetchFormOptions();
  }, []);

  useEffect(() => {
    fetchAttendance(false, [], [], currentMonth, currentMonth);
  }, []);

  const fetchAttendance = async (
    shouldClose = false,
    departmentFilter = selectedDepartments,
    roleFilter = selectedRoles,
    fromFilter = fromMonth,
    toFilter = toMonth
  ) => {
    if (!fromFilter || !toFilter || fromFilter > toFilter) {
      ErrorToast("Please select a valid month range.");
      return;
    }

    setLoadingAttendance(true);
    setTableShow(true);
    try {
      const { startDate, endDate } = getMonthDateBounds(fromFilter, toFilter);
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
      });

      if (Array.isArray(departmentFilter)) {
        departmentFilter.forEach((id, index) => {
          queryParams.append(`departmentIds[${index}]`, id);
        });
      }

      if (Array.isArray(roleFilter)) {
        roleFilter.forEach((id, index) => {
          queryParams.append(`roleIds[${index}]`, id);
        });
      }

      const response = await instance.get(
        `/attendance/getTotalMissingAttendance?${queryParams.toString()}`
      );

      if (response.data.success) {
        setAttendance(response?.data.data);
        setSummaryLabel(
          fromFilter === toFilter
            ? formatMonthLabel(fromFilter)
            : `${formatMonthLabel(fromFilter)} - ${formatMonthLabel(toFilter)}`
        );
        if (shouldClose) setIsOpen(false);
        setTableShow(true);
      }
    } catch (error) {
      console.error("Error fetching filtered attendance", error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleClear = () => {
    setFromMonth(currentMonth);
    setToMonth(currentMonth);
    setSummaryLabel(formatMonthLabel(currentMonth));
    setSelectedDepartments([]);
    setSelectedRoles([]);
    setAttendance([]);
    setTableShow(false);
    setIsOpen(false);
  };

  const handleExportCSV = () => {
    if (!attendance || attendance.length === 0) {
      ErrorToast("No data to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Department",
      "Role",
      "Shift",
      "Missing Entries",
    ];

    const rows = attendance.map((item) => [
      item.name || "",
      item.email || "",
      item.departmentName || "N/A",
      item.roleName || "N/A",
      item.shift
        ? ` (${formatHour(item.shift.startHour)} - ${formatHour(
            item.shift.endHour
          )})`
        : "N/A",
      item.totalMissingEntries || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((value) => `"${value}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Missing_Entries_${fromMonth || "All"}_${toMonth || "All"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveDepartmentFilter = async (id) => {
    const nextDepartments = selectedDepartments.filter((item) => item !== id);
    setSelectedDepartments(nextDepartments);
    await fetchAttendance(false, nextDepartments, selectedRoles, fromMonth, toMonth);
  };

  const handleRemoveRoleFilter = async (id) => {
    const nextRoles = selectedRoles.filter((item) => item !== id);
    setSelectedRoles(nextRoles);
    await fetchAttendance(false, selectedDepartments, nextRoles, fromMonth, toMonth);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          {tableShow && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500">Showing Missing Entries For:</span>
              <h2 className="text-xl font-bold text-slate-800">{summaryLabel}</h2>
            </div>
          )}

          {(selectedDepartments.length > 0 || selectedRoles.length > 0) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
                      onClick={() => handleRemoveDepartmentFilter(id)}
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
                      onClick={() => handleRemoveRoleFilter(id)}
                    >
                      <FiX size={11} />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 text-sm font-medium text-primary transition hover:bg-primary/15"
            onClick={() => setIsOpen(true)}
          >
            <FiFilter size={15} />
            Filters
          </button>

          <button
            type="button"
            onClick={() => setExtraFilterModalOpen(true)}
            className={`relative inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition ${
              selectedDepartments.length > 0 || selectedRoles.length > 0
                ? "border-primary bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] text-white"
                : "border-slate-300 bg-white text-slate-600"
            }`}
          >
            <FiFilter size={15} />
            Advanced
            {(selectedDepartments.length > 0 || selectedRoles.length > 0) && (
              <span className="ml-0.5 rounded-full bg-white/30 h-5 w-5 min-h-5 min-w-5 text-xs font-semibold flex justify-center items-center">
                {selectedDepartments.length + selectedRoles.length}
              </span>
            )}
          </button>

          {tableShow && attendance.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="inline-flex h-10 items-center rounded-lg bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] px-4 text-sm font-medium text-white transition hover:brightness-110"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-semibold text-slate-800">Filters</h2>
            <button
              className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setIsOpen(false)}
            >
              <RxCross2 size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                From Month <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                value={fromMonth}
                max={currentMonth}
                onChange={(e) => {
                  const value = e.target.value;
                  setFromMonth(value);
                  if (toMonth && value > toMonth) setToMonth(value);
                }}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                To Month <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                value={toMonth}
                max={currentMonth}
                min={fromMonth}
                onChange={(e) => setToMonth(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <button
                onClick={() => fetchAttendance(true)}
                disabled={loadingAttendance}
                className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition ${
                  loadingAttendance
                    ? "cursor-not-allowed bg-primary/40 text-white"
                    : "bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] text-white hover:brightness-110"
                }`}
              >
                {loadingAttendance ? (
                  <>
                    <FaSpinner className="text-sm animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Search"
                )}
              </button>

              <button
                onClick={handleClear}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {tableShow ? (
        <EmployeeMissingEntryTable
          attendance={attendance}
          loading={loadingAttendance}
        />
      ) : (
        <div className="flex h-[60vh] flex-col items-center justify-center text-slate-500">
          <div>No Record Found</div>
        </div>
      )}

      <UserFiltersModal
        isOpen={extraFilterModalOpen}
        onClose={() => setExtraFilterModalOpen(false)}
        applyLoading={loadingAttendance}
        departments={departments}
        roles={roles}
        selectedDepartments={selectedDepartments}
        selectedRoles={selectedRoles}
        onApply={async (depts, roleList) => {
          setSelectedDepartments(depts);
          setSelectedRoles(roleList);
          await fetchAttendance(false, depts, roleList, fromMonth, toMonth);
          setExtraFilterModalOpen(false);
        }}
        onReset={async () => {
          const resetMonth = currentMonth;
          setFromMonth(resetMonth);
          setToMonth(resetMonth);
          setSummaryLabel(formatMonthLabel(resetMonth));
          setSelectedDepartments([]);
          setSelectedRoles([]);
          await fetchAttendance(false, [], [], resetMonth, resetMonth);
          setExtraFilterModalOpen(false);
        }}
      />
    </div>
  );
};

export default MissingEnteries;
