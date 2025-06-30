import React, { useEffect, useState } from 'react';
import { useLogin } from "../../hooks/api/Post"; // your POST hook
import { useUsers } from "../../hooks/api/Get";  // your GET hook

const UserDashboard = () => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  );
  const [isModalOpen, setIsModalOpen] = useState(false);


  const { postData, loading } = useLogin();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    const checkInTime = new Date().toISOString();
    await postData(
      "/attendance/check-in",
      false,
      null,
      { checkInTime },
      (res) => {
        alert("Check-In successful!");
        console.log("Check-In Data:", res);
      }
    );
  };

  const handleCheckOut = () => {
    setIsModalOpen(true); // show modal to select project
  };

  return (
    <div className="min-h-screen bg-[#f4f8ff] p-6 flex flex-col items-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-9xl">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-4">Attendance UserDashboard</h1>

        <div className="flex flex-col md:flex-row justify-between items-center bg-[#eaf1ff] p-6 rounded-xl shadow-md">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-gray-500 uppercase tracking-wider">Current Time</p>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-800">{currentTime}</h2>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCheckIn}
              className="px-6 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Checking In..." : "Check In"}
            </button>
            <button
              onClick={handleCheckOut}
              className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition-all duration-200"
              disabled={loading}
            >
              Check Out
            </button>
          </div>
        </div>

      </div>


      {/* Project Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-lg relative">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Select Project for Check Out</h2>
            <ProjectList onClose={() => setIsModalOpen(false)} postData={postData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

// ===========================
// ProjectList Component Inline
// ===========================
const ProjectList = ({ onClose, postData }) => {
  const { loading, data: projects } = useUsers("/projects");
  const [projectData, setProjectData] = useState({});

  const handleChange = (projectId, field, value) => {
    setProjectData((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const checkoutTime = new Date().toISOString();

    const selectedProjects = Object.entries(projectData)
      .filter(([_, val]) => val.minutesWorked && val.description)
      .map(([projectId, val]) => ({
        project: projectId,
        minutesWorked: parseInt(val.minutesWorked),
        description: val.description,
      }));

    if (selectedProjects.length === 0) {
      alert("Please fill at least one project's minutes and description.");
      return;
    }

    const payload = {
      checkoutTime,
      projects: selectedProjects,
    };

    await postData("/attendance/check-out", false, null, payload, (res) => {
      alert("Checked out successfully!");
      console.log("Checkout Payload:", payload);
      onClose();
    });
  };

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      {loading ? (
        <p>Loading projects...</p>
      ) : (
        projects.map((project) => (
          <div key={project._id} className="border-b pb-4 mb-4">
            <h3 className="font-semibold text-blue-600">{project.name}</h3>
            <div className="mt-2 space-y-2">
              <input
                type="number"
                placeholder="Minutes Worked"
                className="w-full border rounded-md p-2"
                value={projectData[project._id]?.minutesWorked || ""}
                onChange={(e) =>
                  handleChange(project._id, "minutesWorked", e.target.value)
                }
              />
              <textarea
                placeholder="Description"
                className="w-full border rounded-md p-2"
                rows={2}
                value={projectData[project._id]?.description || ""}
                onChange={(e) =>
                  handleChange(project._id, "description", e.target.value)
                }
              />
            </div>
          </div>
        ))
      )}

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
};


