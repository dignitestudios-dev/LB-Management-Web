import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editedName, setEditedName] = useState("");
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

  const openEditModal = (role) => {
    setEditingRole(role);
    setEditedName(role.name);
    setEditModalOpen(true);
  };

  const updateRole = async () => {
    try {
      await axios.put(`/projects`, { id: editingRole._id, name: editedName });
      SuccessToast("Role updated successfully");
      setEditModalOpen(false);
      setEditingRole(null);
      fetchProjects();
    } catch (err) {
      ErrorToast("Failed to update role");
    }
  };

  const deleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      await axios.delete(`/projects/${roleId}`);
      SuccessToast("Role deleted successfully");
      fetchProjects();
    } catch (err) {
      ErrorToast("Failed to delete role");
    }
  };

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
                <th className="px-4 py-2 border">Action</th>
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
                  <td className="px-4 py-2 text-center border space-x-2">
                    <button
                      onClick={() => openEditModal(project)}
                      className=" bg-blue-500 py-1 px-3 rounded-md text-white hover:underline"
                    >
                      Edit
                    </button>
                    {/* <button
                      onClick={() => deleteRole(project._id)}
                      className="text-white py-1 bg-red-500 px-3 rounded-md hover:underline"
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Role</h2>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={updateRole}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
