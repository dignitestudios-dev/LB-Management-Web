import React, { useEffect, useState } from "react";

import { useCheckin, useLogin } from "../../hooks/api/Post";

import { useUsers } from "../../hooks/api/Get";

import { baseUrl } from "../../axios";

import Cookies from "js-cookie";

import { IoLogOut } from "react-icons/io5";

import { useNavigate } from "react-router";

import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { ImCross } from "react-icons/im";

const UserDashboard = () => {
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckInLoading, setCheckInLoading] = useState(false);

  const [todayAttendance, setTodayAttendance] = useState(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { postData, loading } = useLogin();
  const { checkInData, checkInloading } = useCheckin();

  const { data: user, loading: userLoading } = useUsers("/users/me");

  const [timerInterval, setTimerInterval] = useState(null); // To store the timer interval

  // Add these states to manage stopped time for checkout
  const [isTimeStoppedForCheckout, setIsTimeStoppedForCheckout] =
    useState(false);
  const [stoppedTime, setStoppedTime] = useState(null);

  const handleLogout = async () => {
    await postData("/auth/logout", false, null, null, (res) => {
      Cookies.remove("token");

      localStorage.removeItem("token");

      localStorage.removeItem("user");

      SuccessToast("Logged out successfully.");

      navigate("/auth/login");
    });
  };

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

    setTimerInterval(timer); // Save the timer interval

    // return () => clearInterval(timer);
  }, []);
  

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
          setTodayAttendance(result.data);
        }
      } catch (error) {
        console.error("Error fetching today's attendance", error);
      }
    };

    fetchToday();
  }, []);

  const handleCheckIn = async () => {
    const checkInTime = new Date().toISOString();

    await checkInData(
      "/attendance/check-in",
      false,
      null,
      { checkInTime },
      (res) => {
        SuccessToast("Check-In successful!");
        setTodayAttendance({ ...todayAttendance, checkInTime });
      }
    );
  };

  const handleCheckOut = () => {
    if (todayAttendance?.checkOutTime) {
      SuccessToast("You are already checked out today.");

      return;
    }

    // Stop the timer and record the time when Check Out is clicked
    clearInterval(timerInterval);
    setStoppedTime(new Date().toISOString());
    setIsTimeStoppedForCheckout(true);
    setIsModalOpen(true);
  };

  // Reset stopped time when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setIsTimeStoppedForCheckout(false);
      setStoppedTime(null);
    }
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-[#f4f8ff] p-6 flex flex-col items-center">
      {/* ✅ HEADER */}

      <div className="w-full flex justify-between items-center mb-6 px-2 max-w-7xl">
        <div className="text-2xl font-bold text-black">LB Management</div>

        {userLoading ? (
          <p className="text-sm font-medium text-gray-500">Loading...</p>
        ) : (
          <div className="relative">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <p className="text-sm font-medium text-gray-700">
                Welcome, {user?.name || "Guest"}
              </p>

              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500 shadow-sm">
                <img
                  src="/user.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 🔽 Dropdown */}

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 space-y-2 text-sm text-gray-700">
                <div className="space-y-1">
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>

                  <p>
                    <strong>Code:</strong> {user.employeeCode}
                  </p>

                  <p>
                    <strong>Department:</strong> {user.department.name}
                  </p>

                  <p>
                    <strong>Role:</strong> {user.role.name}
                  </p>
                </div>

                <hr className="my-2" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                >
                  <IoLogOut className="text-lg" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ MAIN DASHBOARD CARD */}

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-7xl">
        <h1 className="text-3xl font-bold text-center text-black mb-4">
          Daily Reporting
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-center bg-[#eaf1ff] p-6 rounded-xl shadow-md w-full">
          <div
            className="w-64 h-64 mx-auto flex flex-col items-center justify-center rounded-full shadow-inner border border-gray-200 bg-cover"
            style={{ backgroundImage: 'url("/clock.png")' }}
          >
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Monday</p>

              <h2 className="text-3xl font-bold text-gray-800 tracking-widest">
                {currentTime}
              </h2>

              <p className="text-sm text-gray-500 mt-1">June 30, 2025</p>

              <p className="text-sm text-gray-500">Asia/Karachi</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-6 mt-3 mb-3">
          {todayAttendance?.checkInTime && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-3 text-sm shadow-sm text-center">
              <p className="font-semibold uppercase tracking-wide text-xs text-blue-600 mb-1">
                Checked In At
              </p>

              <p className="text-lg font-bold">
                {new Date(todayAttendance.checkInTime).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }
                )}
              </p>
            </div>
          )}

          {todayAttendance?.checkOutTime && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm shadow-sm text-center">
              <p className="font-semibold uppercase tracking-wide text-xs text-green-600 mb-1">
                Checked Out At
              </p>

              <p className="text-lg font-bold">
                {new Date(todayAttendance.checkOutTime).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }
                )}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center mt-10">
          <button
            onClick={handleCheckIn}
            className="px-6 py-2 rounded-full bg-black text-white font-semibold shadow transition-all duration-200"
            disabled={checkInloading}
          >
            {checkInloading ? "Checking In..." : "Check In"}
          </button>
          <button
            onClick={handleCheckOut}
            className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition-all duration-200"
            disabled={checkInloading}
          >
            Check Out
          </button>
        </div>
      </div>

      {/* ✅ MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-lg relative">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Select Project for Check Out
              </h2>
              <ImCross
                className="cursor-pointer"
                onClick={() => {
                  setIsModalOpen(false);
                }}
              />
            </div>

            <ProjectList
              onClose={() => setIsModalOpen(false)}
              postData={postData}
              checkInTime={todayAttendance?.checkInTime}
              setTodayAttendance={setTodayAttendance}
              todayAttendance={todayAttendance}
              isTimeStoppedForCheckout={isTimeStoppedForCheckout}
              stoppedTime={stoppedTime}
              setIsTimeStoppedForCheckout={setIsTimeStoppedForCheckout}
              setStoppedTime={setStoppedTime}
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
const ProjectList = ({
  onClose,
  postData,
  checkInTime,
  setTodayAttendance,
  todayAttendance,
  isTimeStoppedForCheckout,
  stoppedTime,
  setIsTimeStoppedForCheckout,
  setStoppedTime,
}) => {
  const { loading, data: projects } = useUsers("/projects");

  const [projectCount, setProjectCount] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const availableMinutes = () => {
    if (!checkInTime) return 0;
    const endTime = isTimeStoppedForCheckout
      ? new Date(stoppedTime)
      : new Date();
    return Math.floor((endTime - new Date(checkInTime)) / 60000);
  };

  const totalAvailableMinutes = availableMinutes();

  const totalEnteredMinutes = entries.reduce((sum, entry) => {
    const hours = parseInt(entry.hoursWorked) || 0;
    const minutes = parseInt(entry.minutesWorked) || 0;
    return sum + hours * 60 + minutes;
  }, 0);

  const remainingMinutes = totalAvailableMinutes - totalEnteredMinutes;

  const handleChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  const handleProjectCountSubmit = () => {
    if (projectCount && projectCount > 0 && projectCount <= 10) {
      const totalMinutes = availableMinutes();
      const evenMinutes = Math.floor(totalMinutes / projectCount);
      const remaining = totalMinutes % projectCount;

      // Distribute evenMinutes to all, and +1 to the first few if there's a remainder
      const initialEntries = Array.from({ length: projectCount }, (_, i) => ({
        project: "",
        hoursWorked: 0,
        minutesWorked: 0,
        description: "",
      }));

      setEntries(initialEntries);
      setShowProjectForm(true);
    }
  };

  const handleSubmit = async () => {
    // Remove local time stop logic, use parent's stoppedTime
    const checkoutTime = stoppedTime || new Date().toISOString();

    const validProjects = entries.filter(
      (entry) =>
        entry.project &&
        (entry.hoursWorked || entry.minutesWorked) &&
        entry.description
    );

    const totalEntered = validProjects.reduce((sum, entry) => {
      const hours = parseInt(entry.hoursWorked) || 0;
      const minutes = parseInt(entry.minutesWorked) || 0;
      return sum + hours * 60 + minutes;
    }, 0);

    if (validProjects.length === 0) {
      ErrorToast("Please fill at least one valid project entry.");
      return;
    }

    if (totalEntered > totalAvailableMinutes) {
      ErrorToast(
        `Total entered time (${Math.floor(totalEntered / 60)}h ${
          totalEntered % 60
        }m) cannot exceed available time (${Math.floor(
          totalAvailableMinutes / 60
        )}h ${totalAvailableMinutes % 60}m).`
      );
      return;
    }

    const payload = {
      checkoutTime,
      projects: validProjects.map((entry) => ({
        project: entry.project,
        minutesWorked:
          (parseInt(entry.hoursWorked) || 0) * 60 +
          (parseInt(entry.minutesWorked) || 0), // Convert hours to minutes
        description: entry.description,
      })),
    };

    await postData("/attendance/check-out", false, null, payload, (res) => {
      SuccessToast("Checked out successfully!");
      setTodayAttendance({
        ...todayAttendance,
        checkOutTime: checkoutTime,
      });
      onClose();
    });
  };

  const getDuration = () => {
    const mins = totalAvailableMinutes;
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    if (isTimeStoppedForCheckout) {
      return `${h} hour(s) ${m} minute(s)`;
    }

    const s =
      Math.floor((new Date() - new Date(todayAttendance?.checkInTime)) / 1000) %
      60;
    return `${h} hour(s) ${m} minute(s) ${s} second(s)`;
  };

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto p-4 bg-white rounded-lg shadow-lg">
      {projectCount === null ? (
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">
            How many projects did you work on today?
          </p>
          <input
            type="number"
            min="1"
            max="10"
            placeholder="Enter number of projects"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const count = parseInt(e.target.value);
              if (isNaN(count) || count < 1 || count > 10) {
                setProjectCount(null);
                return;
              }
              setProjectCount(count);
            }}
          />
          {projectCount && (
            <button
              onClick={handleProjectCountSubmit}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Okay
            </button>
          )}
        </div>
      ) : !showProjectForm ? (
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">
            You selected {projectCount} project(s). Click "Okay" to proceed.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setProjectCount(null);
                setEntries([]);
              }}
              className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
            >
              Back
            </button>
            <button
              onClick={handleProjectCountSubmit}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Okay
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Total Time Duration:</strong>{" "}
              <span className="text-blue-700 font-medium">{getDuration()}</span>
            </p>
            <p>
              <strong>Time Remaining:</strong>{" "}
              <span className="text-red-600 font-medium">
                {Math.floor(remainingMinutes / 60)}h {remainingMinutes % 60}m
              </span>
            </p>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading projects...</p>
          ) : (
            entries.map((entry, index) => {
              const otherMinutes = entries.reduce((sum, ent, i) => {
                if (i !== index) {
                  const hours = parseInt(ent.hoursWorked) || 0;
                  const minutes = parseInt(ent.minutesWorked) || 0;
                  return sum + hours * 60 + minutes;
                }
                return sum;
              }, 0);

              const maxForThis = totalAvailableMinutes - otherMinutes;
              const maxHours = Math.floor(maxForThis / 60);
              const maxMinutes = maxForThis % 60;

              return (
                <div
                  key={index}
                  className="border border-blue-100 bg-blue-50 rounded-lg p-4 space-y-3 shadow-sm"
                >
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={entry.project}
                    onChange={(e) =>
                      handleChange(index, "project", e.target.value)
                    }
                  >
                    <option value="">Select a project</option>
                    {projects.map((proj) => (
                      <option key={proj._id} value={proj._id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`hoursWorked-${index}`}>Hours</label>
                      <input
                        type="number"
                        placeholder={`Hours (max: ${maxHours})`}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={entry.hoursWorked}
                        min="0"
                        max={maxHours}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          if (val < 0) return;

                          const currentMinutes =
                            parseInt(entry.minutesWorked) || 0;
                          const totalMinutesForEntry =
                            val * 60 + currentMinutes;

                          if (totalMinutesForEntry <= maxForThis) {
                            handleChange(index, "hoursWorked", val);
                          } else {
                            ErrorToast(
                              `Total time for this entry cannot exceed ${Math.floor(
                                maxForThis / 60
                              )}h ${maxForThis % 60}m.`
                            );
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor={`minutesWorked-${index}`}>Minutes</label>
                      <input
                        type="number"
                        placeholder={`Minutes (0-59)`}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={entry.minutesWorked}
                        min="0"
                        max="59"
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          if (val < 0 || val > 59) return;

                          const currentHours = parseInt(entry.hoursWorked) || 0;
                          const totalMinutesForEntry = currentHours * 60 + val;

                          if (totalMinutesForEntry <= maxForThis) {
                            handleChange(index, "minutesWorked", val);
                          } else {
                            ErrorToast(
                              `Total time for this entry cannot exceed ${Math.floor(
                                maxForThis / 60
                              )}h ${maxForThis % 60}m.`
                            );
                          }
                        }}
                      />
                    </div>
                  </div>

                  <textarea
                    placeholder="Description"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={entry.description}
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                  />
                </div>
              );
            })
          )}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                setProjectCount(null);
                setEntries([]);
                setShowProjectForm(false);
                setIsTimeStoppedForCheckout(false);
                setStoppedTime(null);
              }}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              ← Back
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
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
              >
                {isTimeStoppedForCheckout ? "Confirm Checkout" : "Checkout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
