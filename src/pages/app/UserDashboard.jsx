import React, { useEffect, useState } from 'react';
import { useLogin } from "../../hooks/api/Post";
import { useUsers } from "../../hooks/api/Get";
import { baseUrl } from "../../axios"; // assuming this is where baseUrl is defined


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
  const [todayAttendance, setTodayAttendance] = useState(null);

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

  console.log(todayAttendance,"todayAttendance")

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const response = await fetch(`${baseUrl}/attendance/today`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          setTodayAttendance(result.data); // ✅ includes both checkInTime & checkoutTime
        }
      } catch (error) {
        console.error("Error fetching today's attendance", error);
      }
    };
    fetchToday();
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
        setTodayAttendance({ ...todayAttendance, checkInTime }); // update immediately
      }
    );
  };

  const handleCheckOut = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f8ff] p-6 flex flex-col items-center">
      <div className="bg-[rgb(237 237 237)] p-8 rounded-2xl shadow-lg w-full max-w-9xl">
        <h1 className="text-3xl font-bold text-center text-black mb-4">Attendance UserDashboard</h1>

        <div className="flex flex-col md:flex-row justify-between items-center bg-[#eaf1ff] p-6 rounded-xl shadow-md w-full">
          <div className="w-64 h-64 mx-auto flex flex-col items-center justify-center  rounded-full shadow-inner border border-gray-200 bg-cover" style={{ backgroundImage: 'url("/clock.png");' }}>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Monday</p>
              <h2 className="text-3xl font-bold text-gray-800 tracking-widest">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </h2>
              <p className="text-sm text-gray-500 mt-1">June 30, 2025</p>
              <p className="text-sm text-gray-500">Asia/Karachi</p>
            </div>
          </div>


        </div>

        <div className='flex justify-center items-center gap-6 mt-3 mb-3'>
       {/* ✅ Check-In Time */}
{todayAttendance?.checkInTime && (
  <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-3 text-sm shadow-sm text-center">
    <p className="font-semibold uppercase tracking-wide text-xs text-[#f40e00] mb-1">Checked In At</p>
    <p className="text-lg font-bold">
      {new Date(todayAttendance.checkInTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}
    </p>
  </div>
)}

{/* ✅ Check-Out Time */}
{todayAttendance?.checkOutTime && (
  <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm shadow-sm text-center">
    <p className="font-semibold uppercase tracking-wide text-xs text-green-600 mb-1">Checked Out At</p>
    <p className="text-lg font-bold">
      {new Date(todayAttendance.checkOutTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}
    </p>
  </div>
)}

        </div>


        <div className="flex gap-4 justify-center mt-10">
          <button
            onClick={handleCheckIn}
            className="px-6 py-2 rounded-full bg-black text-white font-semibold shadow transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Checking In..." : "Check In"}
          </button>
          <button
            onClick={handleCheckOut}
            className="px-6 py-2 rounded-full bg-red-600 hover:hover:bg-red-700 text-white font-semibold shadow transition-all duration-200"
            disabled={loading}
          >
            Check Out
          </button>
        </div>
      </div>

      {/* Project Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[rgb(237 237 237)] w-full max-w-xl rounded-xl p-6 shadow-lg relative">
            <div className='flex justify-between'>
              <h2 className="text-xl font-semibold mb-4 text-[#f40e00]">Select Project for Check Out</h2>
            </div>

            <ProjectList
              onClose={() => setIsModalOpen(false)}
              postData={postData}
              checkInTime={todayAttendance?.checkInTime}
            />

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
const ProjectList = ({ onClose, postData, checkInTime }) => {
  const { loading, data: projects } = useUsers("/projects");
  const [entries, setEntries] = useState([
    { project: "", minutesWorked: "", description: "" },
  ]);

  // 🕒 Get total available minutes since check-in
  const availableMinutes = () => {
    if (!checkInTime) return 0;
    const now = new Date();
    return Math.floor((now - new Date(checkInTime)) / 60000);
  };

  const totalAvailableMinutes = availableMinutes();

  const totalEnteredMinutes = entries.reduce(
    (sum, entry) => sum + (parseInt(entry.minutesWorked) || 0),
    0
  );

  const remainingMinutes = totalAvailableMinutes - totalEnteredMinutes;

  const handleChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  const addNewEntry = () => {
    setEntries([...entries, { project: "", minutesWorked: "", description: "" }]);
  };

  const handleSubmit = async () => {
    const checkoutTime = new Date().toISOString();

    const validProjects = entries.filter(
      (entry) => entry.project && entry.minutesWorked && entry.description
    );

    const totalEntered = validProjects.reduce(
      (sum, entry) => sum + parseInt(entry.minutesWorked),
      0
    );

    if (validProjects.length === 0) {
      alert("Please fill at least one valid project entry.");
      return;
    }

    if (totalEntered > totalAvailableMinutes) {
      alert(`Total entered minutes (${totalEntered}) cannot exceed available time (${totalAvailableMinutes}).`);
      return;
    }

    const payload = {
      checkoutTime,
      projects: validProjects.map((entry) => ({
        project: entry.project,
        minutesWorked: parseInt(entry.minutesWorked),
        description: entry.description,
      })),
    };

    await postData("/attendance/check-out", false, null, payload, (res) => {
      alert("Checked out successfully!");
      console.log("Checkout Payload:", payload);
      onClose();
    });
  };

  // Format readable time
  const getDuration = () => {
    const mins = totalAvailableMinutes;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} hour(s) ${m} minute(s)`;
  };

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto p-4 bg-[rgb(237 237 237)] rounded-lg shadow-lg">
      {/* 🕐 Session Time Info */}
      <div className="text-sm text-gray-700 space-y-1">
        <p>
          <strong>Total Time Since Check-In:</strong>{" "}
          <span className="text-[#f40e00] font-medium">{getDuration()}</span>
        </p>
        <p>
          <strong>Time Remaining:</strong>{" "}
          <span className="text-red-600 font-medium">{remainingMinutes} minutes</span>
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading projects...</p>
      ) : (
        entries.map((entry, index) => {
          const otherMinutes = entries.reduce((sum, ent, i) => {
            if (i !== index) return sum + (parseInt(ent.minutesWorked) || 0);
            return sum;
          }, 0);

          const maxForThis = totalAvailableMinutes - otherMinutes;

          return (
            <div
              key={index}
              className="border border-blue-100 bg-blue-50 rounded-lg p-4 space-y-3 shadow-sm"
            >
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={entry.project}
                onChange={(e) => handleChange(index, "project", e.target.value)}
              >
                <option value="">Select a project</option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder={`Minutes Worked (max: ${maxForThis})`}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={entry.minutesWorked}
                min="0"
                max={maxForThis}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val) || val < 0) return;
                  if (val <= maxForThis) {
                    handleChange(index, "minutesWorked", val);
                  } else {
                    alert(`You can't enter more than ${maxForThis} minutes for this entry.`);
                  }
                }}
              />

              <textarea
                placeholder="Description"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                value={entry.description}
                onChange={(e) => handleChange(index, "description", e.target.value)}
              />
            </div>
          );
        })
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={addNewEntry}
          className="text-sm font-medium text-[#f40e00] hover:underline"
        >
          + Add Another Project
        </button>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-[#f40e00] text-white hover:bg-red-700 text-sm"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};


