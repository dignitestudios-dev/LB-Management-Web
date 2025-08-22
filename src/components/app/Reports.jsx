import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast } from "../global/Toaster";
import { RxCross2 } from "react-icons/rx";
import InfoCard from "../ui/InfoCard";
import { FaChevronDown } from "react-icons/fa";

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
    const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectsType, setProjectsType] = useState([]);
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = { startDate, endDate };
      if(projectId){
         params[`projectId[${0}]`] = projectId;
      }

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
      setDivisions(divRes.data.data)
      setProjects(projectRes.data.data)
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
                  <div className="font-medium">{item.name}</div>
                  {item.departmentName && (
                    <div className="text-sm text-gray-500">
                      {item.departmentName}
                    </div>
                  )}
                  {item.email && (
                    <div className="text-sm text-gray-400">{item.email}</div>
                  )}
                </div>
              </div>
              {rightLabelKey && (
                <span className="bg-gray-100 flex flex-col items-center text-gray-600 text-sm px-3 py-1 rounded-full">
                  <label className="font-semibold">Worked Time</label>
                  <h4 className="text-xs">{item[rightLabelKey]}</h4>
                </span>
              )}
              {rightLabelKey1 && (
                <span className="bg-gray-100 text-gray-600  flex flex-col items-center text-sm px-3 py-1 rounded-full">
                  <label className="font-semibold">Expected Time</label>
                  <h4 className="text-xs">{item[rightLabelKey1]}</h4>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex justify-end gap-8 mb-6">
        <button
          onClick={() => console.log("Export Logic")}
          className="bg-gray-700 hover:bg-gray-800 h-[39px] w-[100px] text-white rounded transition"
        >
          Export
        </button>

        <button
          onClick={() => {
            setDraftDepartments(selectedDepartments);
            setDraftDivisions(selectedDivisions);
            setShowDrawer(true);
          }}
          className="bg-red-600 hover:bg-red-700 h-[39px] w-[100px] text-white rounded transition"
        >
          Filters
        </button>
      </div>

      {loading && <div className="p-6 text-center">Loading...</div>}
      {!loading && (
        <div className="flex gap-4 py-4">
          <InfoCard
            title="Expected Minutes"
            value={reports?.totalSummary.sumTotalExpectedMinutes}
          />
          <InfoCard
            title="Worked Minutes"
            value={reports?.totalSummary.sumTotalWorkedMinutes}
          />
        </div>
      )}
      {!loading && reports && (
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
        </div>
      )}

      {/* Overlay */}
      {showDrawer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setShowDrawer(false)}
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
                <div className="relative">
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="appearance-none w-full border border-gray-300 bg-white rounded-md px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Select Project</option>
                    {projects?.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project?.name}
                      </option>
                    ))}
                  </select>

                  <FaChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={14}
                  />
                </div>
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
              
                  <label  className="flex items-center space-x-2">
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
                  <label  className="flex items-center space-x-2">
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
                setSelectedDepartments(draftDepartments);
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
                setDraftDepartments([])
                fetchReports();
                setShowDrawer(false);
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
