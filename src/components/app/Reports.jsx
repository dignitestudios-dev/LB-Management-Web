import React, { useEffect, useState } from "react";
import axios from "../../axios";
import MultiSelectFilter from "../ui/MultipleFilterSelector";
import { ErrorToast } from "../global/Toaster";

function Reports() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  const fetchReports = async () => {
  try {
    setLoading(true);

    const params= {
      startDate,
      endDate
    };

    // Add departments
    selectedDepartments.forEach((id, idx) => {
      params[`departmentId[${idx}]`] = id;
    });

    // // Add roles
    // selectedRoles.forEach((id, idx) => {
    //   params[`roleId[${idx}]`] = id;
    // });

    // // Add shifts
    // selectedShifts.forEach((id, idx) => {
    //   params[`shiftId[${idx}]`] = id;
    // });

    const res = await axios.get("/departments/getReports", { params });
     setReports(res.data);
    // setTotalPages(res?.data?.pagination?.totalPages);
  } catch (err) {
    ErrorToast("Failed to fetch reports");
  } finally {
    setLoading(false);
  }
};

  const fetchFormOptions = async () => {
    try {
      const [deptRes] = await Promise.all([
        //   axios.get("/roles/"),
        axios.get("/departments/"),
        //   axios.get("/shifts/"),
      ]);
      // setRoles(roleRes.data.data);
      setDepartments(deptRes.data.data);
      // setShifts(shiftRes.data.data);
    } catch (err) {
      ErrorToast("Failed to load form data");
    }
  };

  useEffect(() => {
    fetchFormOptions();
  }, []);

  useEffect(() => {
 
      fetchReports();
    
  }, [startDate, endDate , selectedDepartments]);

  useEffect(() => {
    fetchReports();
  }, []);

  const renderList = (title, list, rightLabelKey) => (
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
                <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                  {item[rightLabelKey]}
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
      {/* Date Range Picker UI */}
      <div className="flex gap-4 mb-6 items-center bg-white p-4 rounded-lg shadow">
        <div>
   
          <input
            type="date"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
     
          <input
            type="date"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <MultiSelectFilter
          title="Departments"
          options={departments.map((d) => ({ value: d._id, label: d.name }))}
          selected={selectedDepartments}
          setSelected={setSelectedDepartments}
        />
      </div>

      {loading && <div className="p-6 text-center">Loading...</div>}

      {!loading && reports && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderList(
            "Top Employees",
            reports.topEmployees?.map((e) => ({
              ...e,
              totalWorkedHours: `${Math.floor(e.totalWorkedMinutes / 60)}h ${
                e.totalWorkedMinutes % 60
              }m`,
            })),
            "totalWorkedHours"
          )}

          {renderList(
            "Bottom Employees",
            reports.bottomEmployees?.map((e) => ({
              ...e,
              totalWorkedHours: `${Math.floor(e.totalWorkedMinutes / 60)}h ${
                e.totalWorkedMinutes % 60
              }m`,
            })),
            "totalWorkedHours"
          )}

          {renderList(
            "Top Projects",
            reports.topProjects?.map((p) => ({
              ...p,
              totalWorkedHours: `${Math.floor(p.totalWorkedMinutes / 60)}h ${
                p.totalWorkedMinutes % 60
              }m`,
            })),
            "totalWorkedHours"
          )}

          {renderList(
            "Bottom Projects",
            reports.bottomProjects?.map((p) => ({
              ...p,
              totalWorkedHours: `${Math.floor(p.totalWorkedMinutes / 60)}h ${
                p.totalWorkedMinutes % 60
              }m`,
            })),
            "totalWorkedHours"
          )}
        </div>
      )}
    </div>
  );
}

export default Reports;
