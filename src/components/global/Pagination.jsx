// components/Pagination.jsx
import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-4 gap-2">
      <button
        className={`px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-80 disabled:cursor-not-allowed`}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>
      <span className="px-3 py-1">{`Page ${currentPage} of ${totalPages}`}</span>
      <button
        className="bg-blue-500 px-4 rounded-md text-white disabled:opacity-80 disabled:cursor-not-allowed"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
