import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast } from "../global/Toaster";
import { RxCross2 } from "react-icons/rx";
import InfoCard from "../ui/InfoCard";
// import { FaChevronDown } from "react-icons/fa";
import { HiUser } from "react-icons/hi";
import { MdDateRange } from "react-icons/md";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import {
  HiBuildingOffice2,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { convertToHoursAndMinutes } from "../../lib/helpers";
// import { RxCross2 } from "react-icons/rx";

function Reports() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [draftDepartments, setDraftDepartments] = useState([]);
  const [draftDivisions, setDraftDivisions] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [openProjectDropdown, setOpenProjectDropdown] = useState(false);
  const [summaryTriggered, setSummaryTriggered] = useState({});
  const [projects, setProjects] = useState([]);
  const [projectsType, setProjectsType] = useState([]);
  const appliedFilters = [];
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = { startDate, endDate };
      selectedProjects.forEach((id, idx) => {
        params[`projectId[${idx}]`] = id;
      });

      projectsType.forEach((id, idx) => {
        params[`projectTypes[${idx}]`] = id;
      });
      draftDepartments.forEach((id, idx) => {
        params[`departmentId[${idx}]`] = id;
      });
      draftDivisions.forEach((id, idx) => {
        params[`divisionIds[${idx}]`] = id;
      });

      const res = await axios.get("/departments/getReports", { params });
      setReports(res.data);
    } catch (err) {
      ErrorToast("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const deptRes = await axios.get("/departments/");
      const divRes = await axios.get("/division");
      const projectRes = await axios.get("/projects?page=1&limit=1000");
      setDepartments(deptRes.data.data);
      setDivisions(divRes.data.data);
      setProjects(projectRes.data.data);
    } catch (err) {
      ErrorToast("Failed to load form data");
    }
  };

  useEffect(() => {
    fetchFormOptions();
  }, []);

  useEffect(() => {
    fetchReports();
  }, []);

const exportToCSV = () => {
  if (!reports) return;

  // Map IDs to Names
  const getNames = (ids, list) =>
    ids?.map((id) => list.find((item) => item._id === id)?.name || id).join(", ") || "";

  let data = [];

  // ==========================
  // Applied Filters Section
  // ==========================
  data.push(["Applied Filters"]);
  if (summaryTriggered?.startDate && summaryTriggered?.endDate)
    data.push([`Date Range: ${summaryTriggered.startDate} to ${summaryTriggered.endDate}`]);
  if (summaryTriggered?.selectedUser?.name)
    data.push([`Employee: ${summaryTriggered.selectedUser.name}`]);
  if (summaryTriggered?.selectedDepartments?.length)
    data.push([
      `Departments: ${getNames(summaryTriggered.selectedDepartments, departments)}`,
    ]);
  if (summaryTriggered?.selectedDivisions?.length)
    data.push([
      `Divisions: ${getNames(summaryTriggered.selectedDivisions, divisions)}`,
    ]);
  if (summaryTriggered?.selectedProjects?.length)
    data.push([
      `Projects: ${getNames(summaryTriggered.selectedProjects, projects)}`,
    ]);
  if (summaryTriggered?.projectsType?.length)
    data.push([`Project Type: ${summaryTriggered.projectsType}`]);
  data.push([""]); // Empty line for separation

  // ==========================
  // Helper: Convert Minutes to H:M
  // ==========================
  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  let hasEmployees = reports.topEmployees?.length > 0 || reports.bottomEmployees?.length > 0;
  let hasProjects = reports.topProjects?.length > 0 || reports.bottomProjects?.length > 0;

  // ==========================
  // Employee Data Section
  // ==========================
  if (hasEmployees) {
    data.push(["Name", "Department", "Worked Time", "Expected Time"]);

    if (reports.topEmployees?.length > 0) {
      data.push(["--- Top Employees ---"]);
      reports.topEmployees.forEach((e) => {
        data.push([
          e.name,
          e.departmentName || "",
          formatTime(e.totalWorkedMinutes || 0),
          formatTime(e.totalExpectedMinutes || 0),
        ]);
      });
    }

    if (reports.bottomEmployees?.length > 0) {
      data.push(["--- Bottom Employees ---"]);
      reports.bottomEmployees.forEach((e) => {
        data.push([
          e.name,
          e.departmentName || "",
          formatTime(e.totalWorkedMinutes || 0),
          formatTime(e.totalExpectedMinutes || 0),
        ]);
      });
    }

    data.push([""]);
  }

  // ==========================
  // Project Data Section
  // ==========================
  if (hasProjects) {
    data.push(["Project Name", "Worked Time"]);

    if (reports.topProjects?.length > 0) {
      data.push(["--- Top Projects ---"]);
      reports.topProjects.forEach((p) => {
        data.push([p.name, formatTime(p.totalWorkedMinutes || 0)]);
      });
    }

    if (reports.bottomProjects?.length > 0) {
      data.push(["--- Least Projects ---"]);
      reports.bottomProjects.forEach((p) => {
        data.push([p.name, formatTime(p.totalWorkedMinutes || 0)]);
      });
    }

    data.push([""]);
  }

  // ==========================
  // Summary Row
  // ==========================
  if (hasEmployees || hasProjects) {
    data.push([
      "TOTAL WORKED",
      formatTime(reports.totalSummary?.sumTotalWorkedMinutes || 0),
      "TOTAL EXPECTED",
      formatTime(reports.totalSummary?.sumTotalExpectedMinutes || 0),
    ]);
  } else {
    // If no employees/projects, only show filters and summary
    data.push([
      "TOTAL WORKED",
      formatTime(reports.totalSummary?.sumTotalWorkedMinutes || 0),
    ]);
  }

  // ==========================
  // Convert to CSV & Download
  // ==========================
  const csvContent = data.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `reports_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



  const formatMinutes = (mins) => {
    if (!mins) return "0h 0m";
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  };

  const renderList = (title, list, rightLabelKey, rightLabelKey1) => (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col">
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      <hr className="border-dashed mb-3" />
      <div className="flex flex-col gap-3 overflow-y-auto max-h-80 pr-2">
        {list?.map((item, idx) => {
          const initials = item.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
          return (
            <div
              key={idx}
              className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold"
                  style={{
                    backgroundColor: `hsl(${(idx * 50) % 360}, 70%, 50%)`,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  {item.departmentName && (
                    <div className="text-xs text-gray-500">
                      {item.departmentName}
                    </div>
                  )}
                  {item.email && (
                    <div className="text-xs text-gray-400">{item.email}</div>
                  )}
                </div>
              </div>
              {rightLabelKey && (
                <span className="bg-gray-100 flex flex-col items-center text-gray-600 text-sm px-3 py-1 rounded-full">
                  <label className="font-semibold text-nowrap">Worked Time</label>
                  <h4 className="text-xs">{item[rightLabelKey]}</h4>
                </span>
              )}
              {rightLabelKey1 && (
                <span className="bg-gray-100 text-gray-600  flex flex-col items-center text-sm px-3 py-1 rounded-full">
                  <label className="font-semibold text-nowrap">Expected Time</label>
                  <h4 className="text-xs">{item[rightLabelKey1]}</h4>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (summaryTriggered?.startDate && summaryTriggered?.endDate) {
    appliedFilters.push(
      <div
        key="date"
        className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm w-fit"
      >
        <MdDateRange className="text-red-500 text-2xl" />
        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-1 rounded-md">
            {summaryTriggered.startDate}
          </span>
          <span className="text-gray-400 text-sm font-semibold">to</span>
          <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-1 rounded-md">
            {summaryTriggered.endDate}
          </span>
        </div>
      </div>
    );
  }

  if (summaryTriggered?.selectedDepartments?.length > 0) {
    appliedFilters.push(
      <div
        key="departments"
        className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm w-fit"
      >
        <HiBuildingOffice2 className="text-red-500 text-lg" />
        <div className="flex gap-1 items-baseline">
          <span className="text-sm text-gray-500 font-medium">
            Departments:
          </span>
          <h2 className="text-sm font-semibold text-gray-800">
            {summaryTriggered.selectedDepartments
              .map((id) => departments.find((d) => d._id === id)?.name || "—")
              .join(", ")}
          </h2>
        </div>
      </div>
    );
  }
  if (summaryTriggered?.selectedProjects?.length > 0) {
    appliedFilters.push(
      <div
        key="proj"
        className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm w-fit"
      >
        <HiOutlineClipboardDocumentList className="text-red-500 text-lg" />
        <div className="flex gap-1 items-baseline">
          <span className="text-sm text-gray-500 font-medium">Projects:</span>
          <h2 className="text-sm font-semibold text-gray-800">
            {summaryTriggered.selectedProjects
              .map((id) => projects.find((p) => p._id === id)?.name || "—")
              .join(", ")}
          </h2>
        </div>
      </div>
    );
  }
  // Division
  if (summaryTriggered?.selectedDivisions?.length > 0) {
    appliedFilters.push(
      <div
        key="divisions"
        className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm w-fit"
      >
        <HiBuildingOffice2 className="text-red-500 text-lg" />
        <div className="flex gap-1 items-baseline">
          <span className="text-sm text-gray-500 font-medium">Divisions:</span>
          <h2 className="text-sm font-semibold text-gray-800">
            {summaryTriggered.selectedDivisions
              .map((id) => divisions.find((d) => d._id === id)?.name || "—")
              .join(", ")}
          </h2>
        </div>
      </div>
    );
  }

  if (summaryTriggered?.projectsType?.length > 0) {
    appliedFilters.push(
      <div
        key="proj"
        className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm w-fit"
      >
        <HiOutlineClipboardDocumentList className="text-red-500 text-lg" />
        <div className="flex gap-1 items-baseline">
          <span className="text-sm text-gray-500 font-medium">Projects:</span>
          <h2 className="text-sm font-semibold text-gray-800 capitalize">
            {summaryTriggered.projectsType.join(", ")}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Action Buttons */}

      <div className="flex justify-end gap-8 mb-6">
        <button
          onClick={exportToCSV}
          className="bg-gray-700 hover:bg-gray-800 h-[39px] w-[100px] text-white rounded transition"
        >
          Export
        </button>

        <button
          onClick={() => {
            setDraftDepartments(selectedDepartments);
            // setDraftDivisions(selectedDivisions);
            setShowDrawer(true);
          }}
          className="bg-red-600 hover:bg-red-700 h-[39px] w-[100px] text-white rounded transition"
        >
          Filters
        </button>
      </div>
      {appliedFilters.length > 0 && (
        <div className="space-y-2 bg-white border mt-3 border-gray-200 rounded-2xl p-4 shadow-sm w-fit">
          {appliedFilters}
        </div>
      )}
      {loading && <div className="p-6 text-center">Loading...</div>}
      {!loading && (
        <div className="flex gap-4 py-4">
          {reports?.topEmployees?.length > 0 &&(
              <InfoCard
                title="Expected Hours"
                value={convertToHoursAndMinutes(
                  reports?.totalSummary.sumTotalExpectedMinutes
                )}
              />
            )}
          <InfoCard
            title="Worked Hours"
            value={convertToHoursAndMinutes(
              reports?.totalSummary.sumTotalWorkedMinutes
            )}
          />
        </div>
      )}
      {!loading &&
        reports &&
        reports.topEmployees.length > 0 &&
       reports.bottomEmployees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderList(
              "Top Contributors",
              reports.topEmployees?.map((e) => ({
                ...e,
                totalWorkedHours: `${Math.floor(e.totalWorkedMinutes / 60)}h ${
                  e.totalWorkedMinutes % 60
                }m`,
                totalExpectedMinutes: `${Math.floor(
                  e.totalExpectedMinutes / 60
                )}h ${e.totalExpectedMinutes % 60}m`,
              })),
              "totalWorkedHours",
              "totalExpectedMinutes"
            )}

            {renderList(
              "Least Contributors",
              reports.bottomEmployees?.map((e) => ({
                ...e,
                totalWorkedHours: `${Math.floor(e.totalWorkedMinutes / 60)}h ${
                  e.totalWorkedMinutes % 60
                }m`,
                totalExpectedMinutes: `${Math.floor(
                  e.totalExpectedMinutes / 60
                )}h ${e.totalExpectedMinutes % 60}m`,
              })),
              "totalWorkedHours",
              "totalExpectedMinutes"
            )}
            {renderList(
              "Top Contributed Projects",
              reports.topProjects?.map((e) => ({
                ...e,
                totalWorkedHours: `${Math.floor(e.totalWorkedMinutes / 60)}h ${
                  e.totalWorkedMinutes % 60
                }m`,
                totalExpectedMinutes: `${Math.floor(
                  e.totalExpectedMinutes / 60
                )}h ${e.totalExpectedMinutes % 60}m`,
              })),
              "totalWorkedHours",
              // "totalExpectedMinutes"
            )}
            {renderList(
              "Least Contributed Projects",
              reports.bottomProjects?.map((e) => ({
                ...e,
                totalWorkedHours: `${Math.floor(e.totalWorkedMinutes / 60)}h ${
                  e.totalWorkedMinutes % 60
                }m`,
                totalExpectedMinutes: `${Math.floor(
                  e.totalExpectedMinutes / 60
                )}h ${e.totalExpectedMinutes % 60}m`,
              })),
              "totalWorkedHours",
              // "totalExpectedMinutes"
            )}
          </div>
        )}

      {/* Overlay */}
      {showDrawer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => {
            setShowDrawer(false);
            setOpenProjectDropdown(false);
          }}
        ></div>
      )}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] bg-white z-50 shadow-lg transform transition-transform duration-300 ${
          showDrawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setShowDrawer(false)}>
                <RxCross2 className="text-xl text-gray-500 hover:text-red-600" />
              </button>
            </div>

            {/* Date Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="w-full relative">
              <label className="block text-sm mb-1">Projects</label>

              <div
                className="border border-gray-300 bg-white rounded-md px-4 py-2 text-sm text-gray-700 shadow-sm cursor-pointer flex justify-between items-center"
                onClick={() => setOpenProjectDropdown(!openProjectDropdown)}
              >
                <span>
                  {selectedProjects.length > 0
                    ? `${selectedProjects.length} Selected`
                    : "Select Projects"}
                </span>
                <FaChevronDown className="text-gray-400" size={14} />
              </div>

              {openProjectDropdown && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-md max-h-48 overflow-y-auto">
                  {projects?.map((project) => (
                    <label
                      key={project._id}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={project._id}
                        checked={selectedProjects.includes(project._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjects([
                              ...selectedProjects,
                              project._id,
                            ]);
                          } else {
                            setSelectedProjects(
                              selectedProjects.filter(
                                (id) => id !== project._id
                              )
                            );
                          }
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">{project.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold mb-1">
                Departments
              </label>
              <div className="space-y-2">
                {departments.map((d) => (
                  <label key={d._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={d._id}
                      checked={draftDepartments.includes(d._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDraftDepartments([...draftDepartments, d._id]);
                        } else {
                          setDraftDepartments(
                            draftDepartments.filter((id) => id !== d._id)
                          );
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{d.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-1">
                Divisions
              </label>
              <div className="space-y-2">
                {divisions.map((d) => (
                  <label key={d._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={d._id}
                      checked={draftDivisions.includes(d._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDraftDivisions([...draftDivisions, d._id]);
                        } else {
                          setDraftDivisions(
                            draftDivisions.filter((id) => id !== d._id)
                          );
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{d.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-1">
                Project Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={"internal"}
                    checked={projectsType.includes("internal")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProjectsType([...projectsType, "internal"]);
                      } else {
                        setProjectsType(
                          projectsType.filter((id) => id !== "internal")
                        );
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Internal</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={"external"}
                    checked={projectsType.includes("external")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProjectsType([...projectsType, "external"]);
                      } else {
                        setProjectsType(
                          projectsType.filter((id) => id !== "external")
                        );
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">External</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                const updatedDepartments = draftDepartments;
                const updatedDivisions = draftDivisions;
                setOpenProjectDropdown(false);
                setSelectedDepartments(updatedDepartments);
                setSelectedDivisions(updatedDivisions);

                setSummaryTriggered({
                  selectedDepartments: updatedDepartments,
                  selectedDivisions: updatedDivisions,
                  selectedProjects,
                  projectsType,
                  startDate,
                  endDate,
                });

                fetchReports();
                setShowDrawer(false);
              }}
              className="w-1/2 h-[45px] rounded-md bg-red-600 hover:bg-red-700 text-white"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedDepartments([]);
                setSelectedDivisions([]);
                setDraftDivisions([]);
                setSelectedProjects([]);
                setProjectsType([]);
                setDraftDepartments([]);
                setOpenProjectDropdown(false);
              }}
              className="w-1/2 h-[45px] rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
