import React, { useEffect, useState } from 'react';
import axios from '../../axios';
import { ErrorToast, SuccessToast } from '../../components/global/Toaster';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/projects/');
      setProjects(res.data.data);
    } catch (err) {
      ErrorToast('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      ErrorToast('Please enter a project name');
      return;
    }

    try {
      setCreating(true);
      await axios.post('/projects/', { name: newProjectName });
      SuccessToast('Project created successfully');
      setNewProjectName('');
      fetchProjects(); // refresh list
    } catch (err) {
      ErrorToast('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Projects</h2>

      {/* Create Project Form */}
      <div className="mb-6">
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      {/* Project List */}
      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500">No projects found.</p>
      ) : (
        <ul className="divide-y">
          {projects.map((project) => (
            <li key={project._id} className="py-4">
              <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
              <p className="text-sm text-gray-500">
                Created on: {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Projects;
