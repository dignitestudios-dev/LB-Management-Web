import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { ImSpinner3 } from "react-icons/im";
import SearchBar from "../../components/global/SearchBar";
import Pagination from "../../components/global/Pagination";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/projects", {
        params: {
          search,
          page: currentPage,
          itemsPerPage,
        },
      });
      setProjects(res.data.data);
      setTotalPages(res?.data?.pagination?.totalPages);
    } catch (err) {
      ErrorToast("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, currentPage]);

  const createProject = async () => {
    if (!newProjectName.trim()) {
      ErrorToast("Please enter a project name");
      return;
    }

    try {
      setCreating(true);
      await axios.post("/projects", { name: newProjectName });
      SuccessToast("Project created successfully");
      setNewProjectName("");
      fetchProjects();
    } catch (err) {
      ErrorToast("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setEditedName(project.name);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingProject(null);
    setEditedName("");
  };

  const updateProject = async () => {
    if (!editedName.trim()) {
      ErrorToast("Project name cannot be empty");
      return;
    }

    try {
      setUpdating(true);
      await axios.put(`/projects`, {
        id: editingProject._id,
        name: editedName,
      });
      SuccessToast("Project updated successfully");
      closeEditModal();
      fetchProjects();
    } catch (err) {
      ErrorToast("Failed to update project");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Create Project Form */}
      <div className="bg-[rgb(237_237_237)] shadow-md p-4 rounded-md mb-6">
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
            className="bg-[#f40e00] text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <div className="bg-[rgb(237_237_237)] shadow-md rounded-md p-4">
        <h3 className="text-lg font-semibold mb-3 text-[#f40e00]">
          All Projects
        </h3>

        <SearchBar
          value={search}
          onSearch={(query) => {
            setSearch(query);
            setCurrentPage(1); // Reset page on search
          }}
        />

        {/* Project List */}
        {loading ? (
          <p className="text-gray-600 mt-4">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500 mt-4">No projects found.</p>
        ) : (
          <>
            <table className="w-full table-auto border border-gray-200 rounded-lg mt-4">
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
                    <td className="px-4 py-2 text-center border">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2 text-center font-medium border">
                      {project.name}
                    </td>
                    <td className="px-4 py-2 text-center text-sm border">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-center border">
                      <button
                        onClick={() => openEditModal(project)}
                        className="bg-blue-500 py-1 px-3 rounded-md text-white hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Project</h2>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Project name"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={updateProject}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                Update {updating && <ImSpinner3 className="animate-spin" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
