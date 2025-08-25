import React, { useEffect, useState } from "react";
import { BsClockHistory } from "react-icons/bs";
import { SlCalender } from "react-icons/sl";
import { FaEye } from "react-icons/fa";
import ProjectModal from "./ProjectModal";
import { ErrorToast, SuccessToast } from "../global/Toaster";
import instance, { baseUrl } from "../../axios";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { X } from "lucide-react";
import MultiSelectFilter from "../ui/MultipleFilterSelector";

const EmployeeMissingEntryTable = ({
  attendance,
  loading,
  setAttendance,
  fetchAttendance,
}) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingdelete, setloading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState();
   const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [shifts, setShifts] = useState([]);
const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState([]);
  // New State for Eye Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleDeleteAttendance = async (id) => {
    if (!id) return;
    setloading(true);
    try {
      const response = await instance.delete(`${baseUrl}/attendance/${id}`);

      if (response.data.success) {
        SuccessToast("Delete Successfully");
        setDeleteModalOpen(false);
        fetchAttendance();
      } else {
        ErrorToast(response.data.message || "Failed to delete attendance");
      }
    } catch (error) {
      console.error("Error deleting attendance:", error);
      ErrorToast("Error deleting attendance");
    } finally {
      setloading(false);
    }
  };
  const fetchFormOptions = async () => {
    try {
      const [roleRes, deptRes, shiftRes] = await Promise.all([
        instance.get("/roles/"),
        instance.get("/departments/"),
        instance.get("/shifts/"),
      ]);
      setRoles(roleRes.data.data);
      setDepartments(deptRes.data.data);
      setShifts(shiftRes.data.data);
    } catch (err) {
      ErrorToast("Failed to load form data");
    }
  };

  useEffect(() => {
    fetchFormOptions();
  }, []);


  useEffect(()=>{
    fetchAttendance(selectedDepartments , selectedRoles , selectedShifts)
  },[selectedDepartments , selectedRoles , selectedShifts])
  return (
    <div>
      <div className="bg-white shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
            <tr className="text-red-600 text-xs md:text-sm uppercase font-semibold tracking-wider">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <SlCalender className="w-4 h-4" />
                  Name
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <BsClockHistory className="w-4 h-4" />
                  Email
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <BsClockHistory className="w-4 h-4" />
                  Missing Entries
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <BsClockHistory className="w-4 h-4" />
                    <MultiSelectFilter
            title="Departments"
            options={departments.map((d) => ({ value: d._id, label: d.name }))}
            selected={selectedDepartments}
            setSelected={setSelectedDepartments}
          />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <BsClockHistory className="w-4 h-4" />
                      <MultiSelectFilter
            title="Roles"
            options={roles.map((r) => ({ value: r._id, label: r.name }))}
            selected={selectedRoles}
            setSelected={setSelectedRoles}
          />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <BsClockHistory className="w-4 h-4" />
                      <MultiSelectFilter
            title="Shifts"
            options={shifts.map((s) => ({ value: s._id, label: s.name }))}
            selected={selectedShifts}
            setSelected={setSelectedShifts}
          />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </td>
                  </tr>
                ))
              : attendance?.map((item, index) => (
                  <tr
                    key={index}
                    className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.email}</td>
                    <td className="px-6 py-4">{item.totalMissingEntries}</td>
                    <td className="px-6 py-4">{item.departmentName}</td>
                    <td className="px-6 py-4">{item.roleName}</td>
                    <td className="px-6 py-4">{item.shift?.startHour+ "-" +item.shift?.endHour}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedEmployee(item);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* Existing Modals */}
        <ProjectModal
          showModal={showModal}
          selectedRow={selectedRow}
          setShowModal={setShowModal}
          onClose={() => setShowModal(false)}
        />
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteId(null);
          }}
          onConfirm={() => handleDeleteAttendance(deleteId)}
          deleteLoading={loadingdelete}
        />
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white relative rounded-xl h-[50vh] overflow-hidden overflow-y-auto shadow-xl p-6 w-full max-w-lg">
            <div className="absolute right-4 font-bold cursor-pointer"  onClick={() => setShowDetailsModal(false)}><X/></div>
            <h2 className="text-lg font-semibold mb-4">
              Missing Attendance - {selectedEmployee.name}
            </h2>
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedEmployee.missingDays?.map((day, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {day.date}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {day.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeMissingEntryTable;
