// components/ProjectSelect.js
import { useEffect, useRef, useState } from "react";
import { useProjects } from "../../hooks/api/Get";

const ProjectSelect = ({ value, onChange }) => {
  const [search, setSearch] = useState("");
  const { projects, loading, hasMore, setPage } = useProjects(search);
  const containerRef = useRef();

  // Infinite scroll trigger
  const handleScroll = () => {
    const container = containerRef.current;
    if (
      container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10 &&
      hasMore
    ) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) container.addEventListener("scroll", handleScroll);
    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore]);

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        placeholder="Search projects..."
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-1"
      />
      <div
        ref={containerRef}
        className="max-h-40 overflow-y-auto border border-gray-300 rounded-md"
      >
        <div className="text-sm">
          <div
            className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
              !value ? "bg-blue-50" : ""
            }`}
            onClick={() => onChange("")}
          >
            Select a project
          </div>
          {projects.map((proj) => (
            <div
              key={proj._id}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                value === proj._id ? "bg-blue-200" : ""
              }`}
              onClick={() => onChange(proj._id)}
            >
              {proj.name}
            </div>
          ))}
        </div>
        {loading && <div className="text-center text-sm py-2">Loading...</div>}
      </div>
    </div>
  );
};

export default ProjectSelect;
