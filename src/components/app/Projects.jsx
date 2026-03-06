import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { ImSpinner3 } from "react-icons/im";
import SearchBar from "../../components/global/SearchBar";
import Pagination from "../../components/global/Pagination";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    division: "",
    projectType: "",
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [divisionId, setDivisonId] = useState("");
  const [projectType, setProjectType] = useState("");
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/division");
      setDivisions(res.data.data);
    } catch (err) {
      ErrorToast("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchDivisions();
  }, []);

  const createProject = async () => {
    if (
      !newProject.name.trim() ||
      !newProject.projectType.trim() ||
      !newProject.division.trim()
    ) {
      ErrorToast("Please fill all fields");
      return;
    }

    try {
      setCreating(true);
      await axios.post("/projects", newProject);
      SuccessToast("Project created successfully");
      setNewProject({ name: "", division: "", projectType: "" });
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
    setDivisonId(project.division._id);
    setProjectType(project.projectType);
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
        projectType,
        division: divisionId,
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
        <h3 className="text-lg font-semibold mb-2">Projects</h3>
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <input
              type="text"
              value={newProject.name}
              onChange={(e) =>
                setNewProject((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Project name"
              className="border border-gray-300 rounded-md px-3 py-2 flex-1 "
            />

            <select
              value={newProject.division}
              onChange={(e) =>
                setNewProject((prev) => ({ ...prev, division: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 "
            >
              <option value="">Select division</option>
              {divisions?.map((division) => (
                <option key={division._id} value={division._id}>
                  {division.name}
                </option>
              ))}
            </select>

            {/* Project Type Dropdown */}
            <select
              value={newProject.projectType}
              onChange={(e) =>
                setNewProject((prev) => ({
                  ...prev,
                  projectType: e.target.value,
                }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 "
            >
              <option value="">Project type</option>
              <option value="external">External</option>
              <option value="internal">Internal</option>
            </select>

            {/* Small Create Button */}
          </div>
          <button
            onClick={createProject}
            disabled={creating}
            className="bg-[#f40e00] text-white mt-4 px-12  py-2 rounded hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            {creating ? "..." : "Create"}
          </button>
        </div>
      </div>
      <SearchBar
        value={search}
        onSearch={(query) => {
          setSearch(query);
          setCurrentPage(1); // Reset page on search
        }}
      />
      <div className="bg-[rgb(237_237_237)] shadow-md rounded-md p-4">
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
                  <th className="px-4 py-2 border">Division</th>
                  <th className="px-4 py-2 border">Project Type</th>
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
                    <td className="px-4 py-2 text-center font-medium border">
                      {project.division.name}
                    </td>
                    <td className="px-4 py-2 text-center capitalize font-medium border">
                      {project.projectType}
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
            <select
              value={divisionId}
              onChange={(e) =>
                setDivisonId(e.target.value)
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
            >
              <option value="">Select division</option>
              {divisions?.map((division) => (
                <option key={division._id} value={division._id}>
                  {division.name}
                </option>
              ))}
            </select>

            <select
              value={projectType}
              onChange={(e) =>
                setProjectType(e.target.value)
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full mb-4"
            >
              <option value="">Project type</option>
              <option value="external">External</option>
              <option value="internal">Internal</option>
            </select>
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
