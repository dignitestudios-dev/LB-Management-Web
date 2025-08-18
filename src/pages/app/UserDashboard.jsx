import React, { useEffect, useState } from "react";
import { useCheckin, useLogin } from "../../hooks/api/Post";
import { useUsers } from "../../hooks/api/Get";
import instance, { baseUrl } from "../../axios";
import Cookies from "js-cookie";
import {
  IoFingerPrintOutline,
  IoLogOut,
  IoLogOutOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { ImCross, ImSpinner3 } from "react-icons/im";
import { TbReportAnalytics } from "react-icons/tb";
import { useRef } from "react"; // already imported React
import { PiArticleNyTimes } from "react-icons/pi";
import TimesheetTable from "./TimeSheet";
import ModalMissingAttendance from "./ModalMissingAttendance";
import axios from "../../axios";
import { BiLogInCircle, BiLogOutCircle } from "react-icons/bi";
import { FaSpinner } from "react-icons/fa";
const UserDashboard = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const [missingAttendance, setMissingAttendance] = useState(null);

  const fetchAttendance = async () => {
    try {
      const response = await instance.get(`/attendance/missing`);

      if (response.data.success) {
        setMissingAttendance(response.data.data);
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching initial attendance", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [isUpdate]);

  const [currentTime, setCurrentTime] = useState(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Karachi",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date())
  );

  const today = new Date();

  const day = today.toLocaleDateString("en-US", { weekday: "long" });

  const options = { day: "2-digit", month: "long", year: "numeric" };
  const currentDate = new Date().toLocaleDateString("en-US", options);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckInLoading, setCheckInLoading] = useState(false);
  const [ForgotisModalOpen, setForgotisModalOpen] = useState(false);

  const [todayAttendance, setTodayAttendance] = useState(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { postData, loading } = useLogin();
  const { checkInData, checkInloading } = useCheckin();

  const { data: user, loading: userLoading } = useUsers("/users/me");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null); // To store the timer interval
  const [checkOutTimeForgot, setcheckOutTimeForgot] = useState(null);
  const [checkInTimeForgot, setcheckInTimeForgot] = useState(null);
  // Add these states to manage stopped time for checkout
  const [isTimeStoppedForCheckout, setIsTimeStoppedForCheckout] =
    useState(false);
  const [stoppedTime, setStoppedTime] = useState(null);

  const handleLogout = async () => {
    setLogoutLoading(true);
    await postData("/auth/logout", false, null, null, (res) => {
      Cookies.remove("token");

      localStorage.removeItem("token");

      localStorage.removeItem("user");

      SuccessToast("Logged out successfully.");

      navigate("/auth/login");
    });
    setLogoutLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Format the time based on Pakistan Standard Time
      const pakistanTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Karachi", // Ensuring Pakistan Standard Time
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(new Date());

      setCurrentTime(pakistanTime); // Update the time state
    }, 1000);

    setTimerInterval(timer); // Save the timer interval

    return () => clearInterval(timer); // Clear interval when component unmounts
  }, []);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const response = await instance.get(`/attendance/today`);
        if (response.data.success) {
          setTodayAttendance(response.data.data);
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

    clearInterval(timerInterval);
    setStoppedTime(new Date().toISOString());
    setIsTimeStoppedForCheckout(true);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!isModalOpen) {
      setIsTimeStoppedForCheckout(false);
      setStoppedTime(null);
    }
  }, [isModalOpen]);

  const rawMinutes = todayAttendance?.checkInTime
    ? Math.floor((new Date() - new Date(todayAttendance.checkInTime)) / 60000)
    : 0;

  const adjustedWorkedMinutes = Math.max(rawMinutes, 0);

  const getTimeDifference = (start, end) => {
    if (!start || !end) return null;

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    let startDate = new Date(0, 0, 0, startH, startM);
    let endDate = new Date(0, 0, 0, endH, endM);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const diffMs = endDate - startDate;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };
  const [selectedReasons, setSelectedReasons] = useState({});
  const [shiftDate, setShiftDate] = useState("");
  const [description, setDiscription] = useState("");
  const [selectmissingType, setSelectmissingType] = useState("");

  return (
    <div className="min-h-screen bg-[#f4f8ff] flex flex-col">
      {modalOpen && missingAttendance.length > 0 && (
        <ModalMissingAttendance
          setIsUpdate={setIsUpdate}
          setShiftDate={setShiftDate}
          setDiscription={setDiscription}
          setModalOpen={setModalOpen}
          setIsModalOpen={setForgotisModalOpen}
          missingAttendance={missingAttendance}
          checkInTime={checkInTimeForgot}
          checkOutTime={checkOutTimeForgot}
          setcheckOutTime={setcheckOutTimeForgot}
          setcheckInTime={setcheckInTimeForgot}
          setSelectedReasons={setSelectedReasons}
          setSelectmissingType={setSelectmissingType}
          selectedReasons={selectedReasons}
        />
      )}

      {/* Topbar */}
      <div className="w-full flex justify-between items-center px-6 py-4 bg-white border-b shadow-sm">
        <div className="text-2xl font-bold text-black">
          <img src="/logo.webp" alt="" className="w-auto h-8" />
        </div>
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
            {isProfileOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 space-y-2 text-sm text-gray-700"
              >
                <div className="space-y-1">
                  <p>
                    <strong>Name:</strong> {user?.name}
                  </p>
                  <p>
                    <strong>Code:</strong> {user?.employeeCode}
                  </p>
                  <p>
                    <strong>Department:</strong> {user?.department?.name}
                  </p>
                  <p>
                    <strong>Role:</strong> {user?.role?.name}
                  </p>
                  <p>
                    <strong>Shift:</strong> {user?.shift?.name}
                  </p>
                </div>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm transition ${
                    logoutLoading
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                >
                  {logoutLoading ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <IoLogOut className="text-lg" />
                      Logout
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r p-6 shadow-md">
          <ul className="space-y-4">
            <li
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg transition cursor-pointer font-semibold ${
                activeTab === "dashboard"
                  ? "bg-red-100 text-[#f40e00]"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <TbReportAnalytics />
              Attendance
            </li>
            <li
              onClick={() => setActiveTab("timeSheet")}
              className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg transition cursor-pointer font-semibold ${
                activeTab === "timeSheet"
                  ? "bg-red-100 text-[#f40e00]"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <PiArticleNyTimes />
              Time Sheet
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "dashboard" && (
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
                    <p className="text-sm text-gray-500 mb-1">{day}</p>
                    <h2 className="text-3xl font-bold text-gray-800 tracking-widest">
                      {currentTime}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
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
                          timeZone: "Asia/Karachi",
                        }
                      )}
                    </p>
                  </div>
                )}
                {todayAttendance?.checkInTime &&
                  !todayAttendance?.checkOutTime && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 text-sm shadow-sm text-center">
                      <p className="font-semibold uppercase tracking-wide text-xs text-yellow-600 mb-1">
                        Total Duration (Excl. Break)
                      </p>
                      <p className="text-lg font-bold">
                        {Math.floor(adjustedWorkedMinutes / 60)} hour(s){" "}
                        {adjustedWorkedMinutes % 60} minute(s)
                      </p>
                    </div>
                  )}

                {todayAttendance?.checkOutTime && (
                  <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm shadow-sm text-center">
                    <p className="font-semibold uppercase tracking-wide text-xs text-green-600 mb-1">
                      Checked Out At
                    </p>
                    <p className="text-lg font-bold">
                      {new Date(
                        todayAttendance?.checkOutTime
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Karachi",
                      })}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-4 justify-center mt-10">
                {/* Check In Button */}
                <button
                  onClick={handleCheckIn}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gray-900 to-black text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                  disabled={checkInloading}
                >
                  <IoFingerPrintOutline className="text-xl text-white" />
                  <span className="text-sm sm:text-base">
                    {checkInloading ? "Checking In..." : "Check In"}
                  </span>
                </button>

                {/* Check Out Button */}
                <button
                  onClick={handleCheckOut}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                  disabled={checkInloading}
                >
                  <IoLogOutOutline className="text-xl text-white" />
                  <span className="text-sm sm:text-base">Check Out</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-7xl">
              <h2 className="text-2xl font-bold mb-4">Today's Attendance</h2>
              {todayAttendance ? (
                <div className="space-y-3">
                  <p>
                    <strong>Check-In:</strong>{" "}
                    {new Date(todayAttendance.checkInTime).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}
                  </p>
                  {todayAttendance.checkOutTime && (
                    <p>
                      <strong>Check-Out:</strong>{" "}
                      {new Date(
                        todayAttendance.checkOutTime
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <p>No attendance data for today.</p>
              )}
            </div>
          )}
          {activeTab === "timeSheet" && <TimesheetTable />}
        </div>
      </div>

      {/* Modal */}
      {ForgotisModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-lg relative">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Select Project for Check Out
              </h2>
              <ImCross
                className="cursor-pointer"
                onClick={() => setForgotisModalOpen(false)}
              />
            </div>

            <ForgotProjectList
              // handleModalSubmit={handleModalSubmit}
              getTimeDifference={getTimeDifference}
              missingAttendance={missingAttendance}
              checkOutTimeForgot={checkOutTimeForgot}
              checkInTimeForgot={checkInTimeForgot}
              onClose={() => setForgotisModalOpen(false)}
              postData={postData}
              checkInTime={todayAttendance?.checkInTime}
              setTodayAttendance={setTodayAttendance}
              setModalOpen={setModalOpen}
              setIsModalOpen={setIsModalOpen}
              setForgotisModalOpen={setForgotisModalOpen}
              todayAttendance={todayAttendance}
              isTimeStoppedForCheckout={isTimeStoppedForCheckout}
              stoppedTime={stoppedTime}
              setIsTimeStoppedForCheckout={setIsTimeStoppedForCheckout}
              setStoppedTime={setStoppedTime}
              selectedReasons={selectedReasons}
              shiftDate={shiftDate}
              selectmissingType={selectmissingType}
              setIsUpdate={setIsUpdate}
            />
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-lg relative">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Select Project for Check Out
              </h2>
              <ImCross
                className="cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <ProjectList
              getTimeDifference={getTimeDifference}
              checkOutTimeForgot={checkOutTimeForgot}
              checkInTimeForgot={checkInTimeForgot}
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
  checkOutTimeForgot,
  getTimeDifference,
  checkInTimeForgot,
}) => {
  const { loading, data: projects } = useUsers("/projects", 1, 1000);
  const [projectCount, setProjectCount] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerms, setSearchTerms] = useState([]); // Array to store search terms for each entry
  const [selectedProjects, setSelectedProjects] = useState([]); // To store selected project for each entry
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null); // Track which dropdown is open
  const BREAK_MINUTES = 60;

  const endTime = isTimeStoppedForCheckout ? new Date(stoppedTime) : new Date();
  const rawMinutes = Math.floor((endTime - new Date(checkInTime)) / 60000);

  const handleSearchChange = (e, index) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = e.target.value || ""; // Ensure it's a string, even if empty
    setSearchTerms(updatedSearchTerms);
  };

  const handleSelect = (project, index) => {
    const updatedSelectedProjects = [...selectedProjects];
    updatedSelectedProjects[index] = project; // Update selected project for this index

    setSelectedProjects(updatedSelectedProjects);
    setSearchTerms((prevSearchTerms) => {
      const updatedSearchTerms = [...prevSearchTerms];
      updatedSearchTerms[index] = project.name; // Set the search term to selected project's name
      return updatedSearchTerms;
    });
    setOpenDropdownIndex(null); // Close dropdown after selection

    const updatedEntries = [...entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      project: project._id, // Set selected project for this entry
    };
    setEntries(updatedEntries);
  };

  const toggleDropdown = (index) => {
    setOpenDropdownIndex((prev) => (prev === index ? null : index)); // Open/close dropdown
  };

  const availableMinutes = () => {
    if (!checkInTime) return 0;
    const endTime = isTimeStoppedForCheckout
      ? new Date(stoppedTime)
      : new Date();
    return Math.max(
      Math.floor((endTime - new Date(checkInTime)) / 60000) - BREAK_MINUTES,
      0
    );
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
    setIsSubmitting(true);

    const newErrors = {};

    entries.forEach((entry, index) => {
      const entryErrors = {};
      if (!entry.project) entryErrors.project = "Project is required";
      if (!entry.hoursWorked && !entry.minutesWorked)
        entryErrors.time = "Hours or minutes required";
      if (!entry.description)
        entryErrors.description = "Description is required";

      if (Object.keys(entryErrors).length > 0) {
        newErrors[index] = entryErrors;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      ErrorToast("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    setErrors({}); // Clear previous errors

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

    if (totalEntered > totalAvailableMinutes) {
      ErrorToast(
        `Total entered time (${Math.floor(totalEntered / 60)}h ${
          totalEntered % 60
        }m) cannot exceed available time (${Math.floor(
          totalAvailableMinutes / 60
        )}h ${totalAvailableMinutes % 60}m).`
      );
      setIsSubmitting(false);
      return;
    }

    if (totalEntered !== totalAvailableMinutes) {
      ErrorToast(
        `Please use all available time before confirming checkout. Time remaining: ${Math.floor(
          remainingMinutes / 60
        )}h ${remainingMinutes % 60}m.`
      );
      setIsSubmitting(false);
      return;
    }

    const payload = {
      checkoutTime,
      projects: validProjects.map((entry) => ({
        project: entry.project,
        minutesWorked:
          (parseInt(entry.hoursWorked) || 0) * 60 +
          (parseInt(entry.minutesWorked) || 0),
        description: entry.description,
      })),
    };

    await postData("/attendance/check-out", false, null, payload, (res) => {
      SuccessToast("Checked out successfully!");
      setTodayAttendance({
        ...todayAttendance,
        checkOutTime: checkoutTime,
      });
      setIsSubmitting(false);
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
            type="text"
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
              className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
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
              <span className="text-blue-700 font-medium">
                {Math.floor(rawMinutes / 60)} hour(s) {rawMinutes % 60}{" "}
                minute(s)
              </span>
            </p>
            <p>
              <strong>Break Time:</strong>{" "}
              <span className="text-yellow-600 font-medium">
                {Math.floor(BREAK_MINUTES / 60)} hour
              </span>
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
              // Get the search term for this entry
              const searchTermForEntry = searchTerms[index] || "";

              // Filter projects based on the current search term for this entry
              const filteredProjects = projects.filter((proj) =>
                proj.name
                  .toLowerCase()
                  .includes(searchTermForEntry.toLowerCase())
              );

              const selectedProject = selectedProjects[index];
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
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Search project..."
                      value={searchTerms[index] || ""} // Bind to the individual search term
                      onChange={(e) => handleSearchChange(e, index)} // Update specific index's search term
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => toggleDropdown(index)} // Toggle dropdown visibility
                    />

                    {openDropdownIndex === index && (
                      <div className="w-[28em] mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        <ul className="max-h-60 overflow-y-auto">
                          {filteredProjects.length > 0 ? (
                            filteredProjects.map((proj) => (
                              <li
                                key={proj._id}
                                className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                                onClick={() => handleSelect(proj, index)}
                              >
                                {proj.name}
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-2 text-gray-500">
                              No projects found
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* {selectedProject && (
                      <div className="mt-2">
                        <p className="uppercase text-sm font-bold text-black">
                          Selected Project:{" "}
                          <span className="uppercase text-sm font-bold text-red-600">
                            {selectedProject.name}
                          </span>
                        </p>
                      </div>
                    )} */}

                    {errors[index]?.project && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors[index].project}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`hoursWorked-${index}`}>Hours</label>
                      <input
                        type="text"
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
                        type="text"
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

                    {errors[index]?.time && (
                      <p className="text-xs text-red-600 mt-1 col-span-2">
                        {errors[index].time}
                      </p>
                    )}
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
                  {errors[index]?.description && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors[index].description}
                    </p>
                  )}
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
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-sm transition ${
                  isSubmitting
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-white text-sm transition ${
                  isSubmitting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSubmitting ? (
                  <ImSpinner3 className="animate-spin" />
                ) : isTimeStoppedForCheckout ? (
                  "Confirm Checkout"
                ) : (
                  "Checkout"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ForgotProjectList = ({
  onClose,
  checkInTime,
  todayAttendance,
  isTimeStoppedForCheckout,
  stoppedTime,
  setIsTimeStoppedForCheckout,
  setStoppedTime,
  checkOutTimeForgot,
  getTimeDifference,
  checkInTimeForgot,
  shiftDate,
  selectedReasons,
  selectmissingType,
  setForgotisModalOpen,
  setIsUpdate,
}) => {
  const BREAK_MINUTES = 60;

  const { loading, data: projects } = useUsers("/projects", 1, 1000);
  const [projectCount, setProjectCount] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerms, setSearchTerms] = useState([]); // Array to store search terms for each entry
  const [selectedProjects, setSelectedProjects] = useState([]); // To store selected project for each entry
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null); // Track which dropdown is open

  const availableMinutes = () => {
    if (!checkInTimeForgot || !checkOutTimeForgot || !shiftDate) return 0;

    const createDateTime = (timeStr) => {
      const [hours, minutes] = timeStr.trim().split(":").map(Number);
      const date = new Date(shiftDate);
      date.setUTCHours(hours, minutes, 0, 0); // Use UTC to prevent timezone bugs
      return date;
    };

    const checkInDate = createDateTime(checkInTimeForgot);
    const checkOutDate = createDateTime(checkOutTimeForgot);

    if (checkOutDate <= checkInDate) {
      checkOutDate.setDate(checkOutDate.getDate() + 1); // Fix for night shifts
    }

    const diffInMinutes = Math.floor((checkOutDate - checkInDate) / 60000);

    return Math.max(diffInMinutes - BREAK_MINUTES, 0);
  };

  const totalAvailableMinutes = availableMinutes();

  const totalEnteredMinutes = entries.reduce((sum, entry) => {
    const hours = parseInt(entry.hoursWorked) || 0;
    const minutes = parseInt(entry.minutesWorked) || 0;
    return sum + hours * 60 + minutes;
  }, 0);

  const remainingMinutes = totalAvailableMinutes - totalEnteredMinutes;

  const handleSearchChange = (e, index) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = e.target.value || ""; // Ensure it's a string, even if empty
    setSearchTerms(updatedSearchTerms);
  };

  const handleChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  const handleSelect = (project, index) => {
    const updatedSelectedProjects = [...selectedProjects];
    updatedSelectedProjects[index] = project; // Update selected project for this index

    setSelectedProjects(updatedSelectedProjects);
    setSearchTerms((prevSearchTerms) => {
      const updatedSearchTerms = [...prevSearchTerms];
      updatedSearchTerms[index] = project.name; // Set the search term to selected project's name
      return updatedSearchTerms;
    });
    setOpenDropdownIndex(null); // Close dropdown after selection

    const updatedEntries = [...entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      project: project._id, // Set selected project for this entry
    };
    setEntries(updatedEntries);
  };

  const toggleDropdown = (index) => {
    setOpenDropdownIndex((prev) => (prev === index ? null : index)); // Open/close dropdown
  };

  const handleProjectCountSubmit = () => {
    if (projectCount && projectCount > 0 && projectCount <= 10) {
      const totalMinutes = availableMinutes();
      const evenMinutes = Math.floor(totalMinutes / projectCount);
      const remaining = totalMinutes % projectCount;

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

  const validProjects = entries.filter(
    (entry) =>
      entry.project &&
      (entry.hoursWorked || entry.minutesWorked) &&
      entry.description
  );

  const toUTCHoursOnly = (localTimeStr) => {
    if (!localTimeStr) return "";
    const localDate = new Date(`1970-01-01T${localTimeStr}:00+05:00`);
    return localDate.toISOString().substring(11, 16); // HH:mm only
  };

  const payload = {
    shiftDate: shiftDate,
    reason: selectmissingType === "checkout_missing" ? "" : selectedReasons,
    note: entries
      ?.map((entry) => entry?.description)
      .filter(Boolean)
      .join(", "),

    checkInTime: toUTCHoursOnly(checkInTimeForgot),
    checkOutTime: toUTCHoursOnly(checkOutTimeForgot),
    projects: validProjects?.map((entry) => ({
      project: entry?.project,
      minutesWorked:
        (parseInt(entry.hoursWorked) || 0) * 60 +
        (parseInt(entry.minutesWorked) || 0),
      description: entry.description,
    })),
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);

    const newErrors = {};

    entries.forEach((entry, index) => {
      const entryErrors = {};
      if (!entry.project) entryErrors.project = "Project is required";
      if (!entry.hoursWorked && !entry.minutesWorked)
        entryErrors.time = "Hours or minutes required";
      if (!entry.description)
        entryErrors.description = "Description is required";

      if (Object.keys(entryErrors).length > 0) {
        newErrors[index] = entryErrors;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      ErrorToast("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    setErrors({}); // Clear previous errors

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

    if (totalEntered > totalAvailableMinutes) {
      ErrorToast(
        `Total entered time (${Math.floor(totalEntered / 60)}h ${
          totalEntered % 60
        }m) cannot exceed available time (${Math.floor(
          totalAvailableMinutes / 60
        )}h ${totalAvailableMinutes % 60}m).`
      );
      setIsSubmitting(false);
      return;
    }

    if (totalEntered !== totalAvailableMinutes) {
      ErrorToast(
        `Please use all available time before confirming checkout. Time remaining: ${Math.floor(
          remainingMinutes / 60
        )}h ${remainingMinutes % 60}m.`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post("/attendance/missing", payload);

      SuccessToast("Submitted successfully");
      setIsUpdate((prev) => !prev);
      setForgotisModalOpen(false);
    } catch (err) {
      console.error("Submission failed:", err);
      ErrorToast("Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto p-4 bg-white rounded-lg shadow-lg">
      {projectCount === null ? (
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">
            How many projects did you work on today?
          </p>
          <input
            type="text"
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
              className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
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
              <span className="text-blue-700 font-medium">
                {getTimeDifference(checkInTimeForgot, checkOutTimeForgot)}
              </span>
            </p>
            <p>
              <strong>Break Time:</strong>{" "}
              <span className="text-yellow-600 font-medium">
                {Math.floor(BREAK_MINUTES / 60)} hour
              </span>
            </p>
            <p>
              <p>
                <strong>Time Remaining:</strong>{" "}
                <span className="text-red-600 font-medium">
                  {Math.floor(remainingMinutes / 60)}h {remainingMinutes % 60}m
                </span>
              </p>
            </p>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading projects...</p>
          ) : (
            entries.map((entry, index) => {
              const searchTermForEntry = searchTerms[index] || "";

              const filteredProjects = projects.filter((proj) =>
                proj.name
                  .toLowerCase()
                  .includes(searchTermForEntry.toLowerCase())
              );

              const selectedProject = selectedProjects[index];
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
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Search project..."
                      value={searchTerms[index] || ""} // Bind to the individual search term
                      onChange={(e) => handleSearchChange(e, index)} // Update specific index's search term
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => toggleDropdown(index)} // Toggle dropdown visibility
                    />

                    {openDropdownIndex === index && (
                      <div className="w-[28em] mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        <ul className="max-h-60 overflow-y-auto">
                          {filteredProjects.length > 0 ? (
                            filteredProjects.map((proj) => (
                              <li
                                key={proj._id}
                                className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                                onClick={() => handleSelect(proj, index)}
                              >
                                {proj.name}
                              </li>
                            ))
                          ) : (
                            <li className="px-3 py-2 text-gray-500">
                              No projects found
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {errors[index]?.project && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors[index].project}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`hoursWorked-${index}`}>Hours</label>
                      <input
                        type="text"
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
                        type="text"
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

                    {errors[index]?.time && (
                      <p className="text-xs text-red-600 mt-1 col-span-2">
                        {errors[index].time}
                      </p>
                    )}
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
                  {errors[index]?.description && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors[index].description}
                    </p>
                  )}
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
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-sm transition ${
                  isSubmitting
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-white text-sm transition ${
                  isSubmitting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSubmitting ? (
                  <ImSpinner3 className="animate-spin" />
                ) : isTimeStoppedForCheckout ? (
                  "Confirm Checkout"
                ) : (
                  "Checkout"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
