import { useState, useRef, useEffect } from "react";

function MultiSelectFilter({
  title,
  options,
  selected,
  setSelected,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleValue = (value) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-white border rounded px-4 py-2 shadow-sm hover:bg-gray-50 flex items-center gap-2"
      >
        {title}
        {selected.length > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
            {selected.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown content */}
      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-white rounded shadow-lg p-3 z-50">
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggleValue(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelectFilter;
