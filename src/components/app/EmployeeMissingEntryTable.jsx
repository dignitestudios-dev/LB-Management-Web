import React, { useState } from "react";
import { BsClockHistory } from "react-icons/bs";
import { SlCalender } from "react-icons/sl";
import { FaEye } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import ProjectModal from "./ProjectModal";
import { ErrorToast, SuccessToast } from "../global/Toaster";
import instance, { baseUrl } from "../../axios";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { X } from "lucide-react";

const EmployeeMissingEntryTable = ({ attendance, loading }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingdelete, setloading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState();
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
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="sticky -top-px z-10 bg-[#f2e7f9] text-primary">
            <tr className="text-xs md:text-sm uppercase font-semibold tracking-wider">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <SlCalender className="w-4 h-4" />
                  Name
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FiMail className="w-4 h-4" />
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
                Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Role
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
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded-md w-20"></div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="mx-auto h-8 w-8 rounded-md bg-gray-200"></div>
                    </td>
                  </tr>
                ))
              : attendance?.map((item, index) => (
                  <tr
                    key={index}
                    className="cursor-pointer transition-all duration-200 hover:bg-slate-50"
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
                    <td className="px-6 py-4 text-center align-middle">
                      <button
                        onClick={() => {
                          setSelectedEmployee(item);
                          setShowDetailsModal(true);
                        }}
                        className="inline-flex items-center justify-center rounded-md bg-primary p-1.5 text-white"
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
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
          showDetailsModal
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
            showDetailsModal ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setShowDetailsModal(false)}
        />

        <div
          className={`relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl transition-all duration-200 ${
            showDetailsModal
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          } h-[50vh] overflow-hidden overflow-y-auto`}
        >
          <div
            className="absolute right-4 font-bold cursor-pointer text-slate-500 hover:text-slate-700"
            onClick={() => setShowDetailsModal(false)}
          >
            <X />
          </div>

          <h2 className="text-lg font-semibold mb-4 text-primary">
            Missing Attendance - {selectedEmployee?.name || "Employee"}
          </h2>

          <table className="min-w-full border border-slate-200">
            <thead className="bg-[#f2e7f9] text-primary">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedEmployee?.missingDays?.map((day, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-900">{day.date}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{day.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMissingEntryTable;
