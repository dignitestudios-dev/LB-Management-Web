import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/projects/");
      setProjects(res.data.data);
    } catch (err) {
      ErrorToast("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      ErrorToast("Please enter a project name");
      return;
    }

    try {
      setCreating(true);
      await axios.post("/projects/", { name: newProjectName });
      SuccessToast("Project created successfully");
      setNewProjectName("");
      fetchProjects(); // refresh list
    } catch (err) {
      ErrorToast("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className=" max-w-7xl mx-auto">
      {/* Create Project Form */}
      <div className="bg-[rgb(237 237 237)] shadow-md p-4 rounded-md mb-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter project name"
            className="border rounded-md p-2 flex-1"
          />
          <button
            onClick={createProject}
            disabled={creating}
            className="bg-[#f40e00] text-white px-4 py-2 rounded hover:bg-red-700"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
      <div className="bg-[rgb(237 237 237)] shadow-md rounded-md p-4">
        <h3 className="text-lg font-semibold mb-3">All Projects</h3>
        {/* Project List */}
        {loading ? (
          <p className="text-gray-600">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500">No projects found.</p>
        ) : (
          <table className="w-full table-auto border border-gray-200 rounded-lg">
            <thead className="bg-red-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Project Name</th>
                <th className="px-4 py-2 border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr
                  key={project._id}
                  className="text-gray-800 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 text-center border">{index + 1}</td>
                  <td className="px-4 py-2 text-center font-medium border">
                    {project.name}
                  </td>
                  <td className="px-4 py-2 text-center text-sm border">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Projects;
