import React from "react";
import { PiFileText } from "react-icons/pi";

const ProjectModal = ({ showModal, selectedRow, onClose }) => {
  return (
    showModal &&
    selectedRow && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div
          className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
            onClick={onClose}
          >
            ×
          </button>

          {/* Modal Header */}
          <h2 className="text-2xl font-bold mb-6 text-red-600 flex items-center gap-2">
            <PiFileText className="w-6 h-6" />
            Project Summary
          </h2>

          {/* Project List */}
          {selectedRow?.projects?.length > 0 ? (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
              {selectedRow?.projects?.map((proj, idx) => (
                <div
                  key={idx}
                  className="border border-red-200 bg-red-50 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >
                  {/* Project Name Heading */}
                  <div className="inline-block bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                    Project {idx + 1}
                  </div>

                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    {proj.name}
                  </h3>

                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium text-gray-600">
                        Minutes Worked:
                      </span>{" "}
                      <span className="text-red-700 font-semibold">
                        {proj.minutesWorked} minutes
                      </span>
                    </p>

                    <p>
                      <span className="font-medium text-gray-600">
                        Description:
                      </span>{" "}
                      {proj.description ? (
                        <span className="text-gray-800">{proj.description}</span>
                      ) : (
                        <span className="italic text-gray-400">
                          No description
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              No project data available.
            </p>
          )}
        </div>
      </div>
    )
  );
};

export default ProjectModal;
