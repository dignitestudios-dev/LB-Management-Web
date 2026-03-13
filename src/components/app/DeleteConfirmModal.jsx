// components/DeleteConfirmModal.js
import React from "react";
import { RxCross2 } from "react-icons/rx";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, deleteLoading }) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-sm rounded-xl bg-white p-6 shadow-lg transition-all duration-200 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <RxCross2 size={18} />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Confirm Delete
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this attendance?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleteLoading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
