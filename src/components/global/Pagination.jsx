import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const visiblePages = pages.filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 1 && p <= currentPage + 1)
  );

  const withEllipsis = [];
  visiblePages.forEach((p, i) => {
    if (i > 0 && p - visiblePages[i - 1] > 1) {
      withEllipsis.push("...");
    }
    withEllipsis.push(p);
  });

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-xs text-slate-500">
        Page <span className="font-medium text-slate-700">{currentPage}</span>{" "}
        of <span className="font-medium text-slate-700">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronLeft size={15} />
        </button>

        {withEllipsis.map((item, i) =>
          item === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="inline-flex h-8 w-8 items-center justify-center text-sm text-slate-400"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition ${
                item === currentPage
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

