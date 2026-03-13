import React from "react";
import { FiX } from "react-icons/fi";
import { PiFileText } from "react-icons/pi";

const ProjectModal = ({ showModal, selectedRow, onClose }) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        showModal && selectedRow
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          showModal && selectedRow ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-xl transition-all duration-200 ${
          showModal && selectedRow
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <PiFileText className="h-5 w-5 text-primary" />
              Project Summary
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          <div className="p-5">
            {selectedRow?.projects?.length > 0 ? (
              <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
                {selectedRow?.projects?.map((proj, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-2 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Project {idx + 1}
                    </div>

                    <h3 className="mb-2 text-base font-semibold text-slate-800">
                      {proj.name}
                    </h3>

                    <div className="space-y-1 text-sm text-slate-700">
                      <p>
                        <span className="font-medium text-slate-600">
                          Minutes Worked:
                        </span>{" "}
                        <span className="font-semibold text-primary">
                          {proj.minutesWorked} minutes
                        </span>
                      </p>

                      <p>
                        <span className="font-medium text-slate-600">
                          Description:
                        </span>{" "}
                        {proj.description ? (
                          <span className="text-slate-800">{proj.description}</span>
                        ) : (
                          <span className="italic text-slate-400">
                            No description
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                No project data available.
              </p>
            )}

            <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ProjectModal;
