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
  const [todayAttendanceLoading, setTodayAttendanceLoading] = useState(true);

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
      setTodayAttendanceLoading(true);
      try {
        const response = await instance.get(`/attendance/today`);
        if (response.data.success) {
          setTodayAttendance(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching today's attendance", error);
      } finally {
        setTodayAttendanceLoading(false);
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
  const isActionApiLoading = userLoading || todayAttendanceLoading || checkInloading;

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
  const [selectedReasons, setSelectedReasons] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [description, setDiscription] = useState("");
  const [selectmissingType, setSelectmissingType] = useState("");

  return (
    <div className="min-h-screen bg-[#f4f8ff] flex flex-col">
      <ModalMissingAttendance
        isOpen={modalOpen && missingAttendance?.length > 0}
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

      {/* Topbar */}
      <div className="w-full flex justify-between items-center px-6 py-4 bg-white border-b shadow-sm">
        <div className="text-2xl font-bold text-black">
          <img src="/logo-dx.webp" alt="" className="w-auto h-8" />
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
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-sm">
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
                      ? "bg-primary/50 cursor-not-allowed"
                      : "bg-primary"
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
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-primary/5"
              }`}
            >
              <TbReportAnalytics />
              Attendance
            </li>
            <li
              onClick={() => setActiveTab("timeSheet")}
              className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg transition cursor-pointer font-semibold ${
                activeTab === "timeSheet"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-primary/5"
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
              <h1 className="text-3xl font-bold text-center text-slate-800 mb-4">
                Daily Reporting
              </h1>

              <div className="flex flex-col md:flex-row justify-between items-center bg-[#faf6fd] p-6 rounded-xl w-full">
                <div
                  className="w-64 h-64 mx-auto flex flex-col items-center justify-center rounded-full shadow-inner border border-primary/20 bg-cover"
                  style={{ backgroundImage: 'url("/clock.png")' }}
                >
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-1">{day}</p>
                    <h2 className="text-3xl font-bold text-primary tracking-widest">
                      {currentTime}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">{currentDate}</p>
                    <p className="text-sm text-slate-500">Asia/Karachi</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center gap-6 mt-3 mb-3">
                {todayAttendance?.checkInTime && (
                  <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-center text-sm text-primary shadow-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary/80">
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
                    <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-center text-sm text-primary shadow-sm">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary/80">
                        Total Duration
                      </p>
                      <p className="text-lg font-bold">
                        {Math.floor(adjustedWorkedMinutes / 60)} hour(s){" "}
                        {adjustedWorkedMinutes % 60} minute(s)
                      </p>
                    </div>
                  )}

                {todayAttendance?.checkOutTime && (
                  <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-center text-sm text-primary shadow-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary/80">
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
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3] text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                  disabled={isActionApiLoading}
                >
                  <IoFingerPrintOutline className="text-xl text-white" />
                  <span className="text-sm sm:text-base">Check In</span>
                </button>

                {/* Check Out Button */}
                <button
                  onClick={handleCheckOut}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-slate-900 via-black to-slate-600 text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                  disabled={isActionApiLoading}
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
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
          ForgotisModalOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
            ForgotisModalOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setForgotisModalOpen(false)}
        />
        <div
          className={`relative w-full max-w-xl rounded-xl bg-white p-6 shadow-lg transition-all duration-200 ${
            ForgotisModalOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-xl font-semibold text-slate-800">
              Select Project for Check Out
            </h2>
            <ImCross
              className="cursor-pointer text-slate-500 hover:text-slate-700"
              onClick={() => setForgotisModalOpen(false)}
            />
          </div>

          <ForgotProjectList
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

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
          isModalOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
            isModalOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsModalOpen(false)}
        />
        <div
          className={`relative w-full max-w-xl rounded-xl bg-white p-6 shadow-lg transition-all duration-200 ${
            isModalOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-xl font-semibold text-slate-800">
              Select Project for Check Out
            </h2>
            <ImCross
              className="cursor-pointer text-slate-500 hover:text-slate-700"
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
}) => {
  const { loading, data: projects } = useUsers("/projects", 1, 1000);
  const [entries, setEntries] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerms, setSearchTerms] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const projectsList = Array.isArray(projects) ? projects : [];

  const endTime = isTimeStoppedForCheckout ? new Date(stoppedTime) : new Date();
  const rawMinutes = Math.floor((endTime - new Date(checkInTime)) / 60000);

  const createEmptyEntry = (projectId = "") => ({
    project: projectId,
    hoursWorked: 0,
    minutesWorked: 0,
    description: "",
  });

  const normalizeProjectName = (value = "") =>
    value.toLowerCase().trim().replace(/\s+/g, " ");

  const findDefaultProject = (list, projectName) => {
    const normalizedTarget = normalizeProjectName(projectName).replace(/\s/g, "");
    return list.find((project) => {
      const normalizedName = normalizeProjectName(project?.name || "").replace(
        /\s/g,
        ""
      );
      return (
        normalizedName === normalizedTarget ||
        normalizedName.includes(normalizedTarget) ||
        normalizedTarget.includes(normalizedName)
      );
    });
  };

  useEffect(() => {
    if (isInitialized || loading || projectsList.length === 0)
      return;

    const defaultProjectNames = ["Free Project", "Break"];
    const matchedProjects = defaultProjectNames.map((projectName) =>
      findDefaultProject(projectsList, projectName) || null
    );
    const initializedEntries = matchedProjects.map((project) =>
      createEmptyEntry(project?._id || "")
    );

    const workedMinutes = (() => {
      if (!checkInTime) return 0;
      const currentEndTime = isTimeStoppedForCheckout
        ? new Date(stoppedTime)
        : new Date();
      return Math.max(Math.floor((currentEndTime - new Date(checkInTime)) / 60000), 0);
    })();

    if (workedMinutes < 8 * 60) {
      const extraMinutes = 8 * 60 - workedMinutes;
      const breakIndex = matchedProjects.findIndex(
        (project) =>
          normalizeProjectName(project?.name || "").replace(/\s/g, "") === "break"
      );
      if (breakIndex >= 0) {
        initializedEntries[breakIndex] = {
          ...initializedEntries[breakIndex],
          hoursWorked: Math.floor(extraMinutes / 60),
          minutesWorked: extraMinutes % 60,
        };
      }
    }

    setEntries(initializedEntries);
    setSearchTerms(matchedProjects.map((project) => project?.name || ""));
    setSelectedProjects(matchedProjects);
    setIsInitialized(true);
  }, [isInitialized, loading, projects, checkInTime, isTimeStoppedForCheckout, stoppedTime]);

  const handleAddProject = () => {
    setEntries((prev) => [...prev, createEmptyEntry()]);
    setSearchTerms((prev) => [...prev, ""]);
    setSelectedProjects((prev) => [...prev, null]);
  };

  const handleRemoveProject = (index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setSearchTerms((prev) => prev.filter((_, i) => i !== index));
    setSelectedProjects((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = {};
      Object.keys(prev).forEach((key) => {
        const currentIndex = Number(key);
        if (currentIndex < index) next[currentIndex] = prev[currentIndex];
        if (currentIndex > index) next[currentIndex - 1] = prev[currentIndex];
      });
      return next;
    });
    setOpenDropdownIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
  };

  const handleSearchChange = (e, index) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = e.target.value || "";
    setSearchTerms(updatedSearchTerms);
  };

  const handleSelect = (project, index) => {
    const updatedSelectedProjects = [...selectedProjects];
    updatedSelectedProjects[index] = project;

    setSelectedProjects(updatedSelectedProjects);
    setSearchTerms((prevSearchTerms) => {
      const updatedSearchTerms = [...prevSearchTerms];
      updatedSearchTerms[index] = project.name;
      return updatedSearchTerms;
    });
    setOpenDropdownIndex(null);

    const updatedEntries = [...entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      project: project._id,
    };
    setEntries(updatedEntries);
  };

  const toggleDropdown = (index) => {
    setOpenDropdownIndex((prev) => (prev === index ? null : index));
  };

  const availableMinutes = () => {
    if (!checkInTime) return 0;
    const currentEndTime = isTimeStoppedForCheckout
      ? new Date(stoppedTime)
      : new Date();
    return Math.max(Math.floor((currentEndTime - new Date(checkInTime)) / 60000), 0);
  };

  const MIN_REQUIRED_MINUTES = 8 * 60;
  const totalAvailableMinutes = availableMinutes();
  const totalRequiredMinutes = Math.max(totalAvailableMinutes, MIN_REQUIRED_MINUTES);
  const minimumExtraMinutes = Math.max(MIN_REQUIRED_MINUTES - totalAvailableMinutes, 0);

  const totalEnteredMinutes = entries.reduce((sum, entry) => {
    const hours = parseInt(entry.hoursWorked) || 0;
    const minutes = parseInt(entry.minutesWorked) || 0;
    return sum + hours * 60 + minutes;
  }, 0);

  const remainingMinutes = totalRequiredMinutes - totalEnteredMinutes;

  const getEntryProjectName = (entry, index) => {
    const selected = selectedProjects[index];
    if (selected?.name) return selected.name;
    const projectFromList = projectsList.find((project) => project?._id === entry?.project);
    if (projectFromList?.name) return projectFromList.name;
    return searchTerms[index] || "";
  };

  const isFlexibleProjectEntry = (entry, index) => {
    const normalizedName = normalizeProjectName(getEntryProjectName(entry, index)).replace(
      /\s/g,
      ""
    );
    return normalizedName === "break" || normalizedName === "freeproject";
  };

  const handleChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const newErrors = {};

    entries.forEach((entry, index) => {
      const entryErrors = {};
      if (!entry.project) entryErrors.project = "Project is required";
      if (!entry.hoursWorked && !entry.minutesWorked)
        entryErrors.time = "Hours or minutes required";
      if (!entry.description) entryErrors.description = "Description is required";

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

    setErrors({});

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

    if (totalEntered > totalRequiredMinutes) {
      ErrorToast(
        `Total entered time (${Math.floor(totalEntered / 60)}h ${
          totalEntered % 60
        }m) cannot exceed required allocation (${Math.floor(
          totalRequiredMinutes / 60
        )}h ${totalRequiredMinutes % 60}m).`
      );
      setIsSubmitting(false);
      return;
    }

    if (totalEntered !== totalRequiredMinutes) {
      ErrorToast(
        `Please complete required allocation before confirming checkout. Time remaining: ${Math.floor(
          remainingMinutes / 60
        )}h ${remainingMinutes % 60}m.`
      );
      setIsSubmitting(false);
      return;
    }

    if (minimumExtraMinutes > 0) {
      const nonFlexibleMinutes = entries.reduce((sum, entry, index) => {
        const entryMinutes =
          (parseInt(entry.hoursWorked) || 0) * 60 + (parseInt(entry.minutesWorked) || 0);
        return isFlexibleProjectEntry(entry, index) ? sum : sum + entryMinutes;
      }, 0);

      if (nonFlexibleMinutes > totalAvailableMinutes) {
        ErrorToast(
          `When worked time is below 8 hours, the extra ${Math.floor(
            minimumExtraMinutes / 60
          )}h ${minimumExtraMinutes % 60}m must be allocated only to Free Project or Break.`
        );
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      projects: validProjects.map((entry) => ({
        project: entry.project,
        minutesWorked:
          (parseInt(entry.hoursWorked) || 0) * 60 +
          (parseInt(entry.minutesWorked) || 0),
        description: entry.description,
      })),
    };

    try {
      const response = await postData("/attendance/check-out", false, null, payload);

      if (response?.success) {
        SuccessToast("Checked out successfully!");
        setTodayAttendance({
          ...todayAttendance,
          checkOutTime: checkoutTime,
        });
        onClose();
      } else if (response?.message) {
        ErrorToast(response.message);
      }
    } catch (error) {
      ErrorToast(error?.response?.data?.message || "Failed to checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="text-sm text-gray-700 space-y-1">
        <p>
          <strong>Total Time Duration:</strong>{" "}
          <span className="text-primary font-medium">
            {Math.floor(rawMinutes / 60)} hour(s) {rawMinutes % 60} minute(s)
          </span>
        </p>
        <p>
          <strong>Required Allocation:</strong>{" "}
          <span className="text-primary font-medium">
            {Math.floor(totalRequiredMinutes / 60)}h {totalRequiredMinutes % 60}m
          </span>
        </p>
        {minimumExtraMinutes > 0 && (
          <p className="text-xs text-amber-700">
            Extra {Math.floor(minimumExtraMinutes / 60)}h {minimumExtraMinutes % 60}m
            {" "}must be filled in Free Project or Break.
          </p>
        )}
        <p>
          <strong>Time Remaining:</strong>{" "}
          <span className="text-primary font-medium">
            {Math.floor(remainingMinutes / 60)}h {remainingMinutes % 60}m
          </span>
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading projects...</p>
      ) : (
        entries.map((entry, index) => {
          const searchTermForEntry = searchTerms[index] || "";
          const filteredProjects = projectsList.filter((proj) =>
            proj.name.toLowerCase().includes(searchTermForEntry.toLowerCase())
          );

          const otherMinutes = entries.reduce((sum, ent, i) => {
            if (i !== index) {
              const hours = parseInt(ent.hoursWorked) || 0;
              const minutes = parseInt(ent.minutesWorked) || 0;
              return sum + hours * 60 + minutes;
            }
            return sum;
          }, 0);

          const maxForThis = totalRequiredMinutes - otherMinutes;
          const maxHours = Math.floor(maxForThis / 60);

          return (
            <div
              key={index}
              className="rounded-lg border border-primary/20 bg-primary/10 p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Project #{index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(index)}
                  disabled={loading || entries.length <= 1}
                  className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search project..."
                  value={searchTerms[index] || ""}
                  onChange={(e) => handleSearchChange(e, index)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onClick={() => toggleDropdown(index)}
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
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={entry.hoursWorked}
                    min="0"
                    max={maxHours}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (val < 0) return;

                      const currentMinutes = parseInt(entry.minutesWorked) || 0;
                      const totalMinutesForEntry = val * 60 + currentMinutes;

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
                    placeholder="Minutes (0-59)"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={2}
                value={entry.description}
                onChange={(e) => handleChange(index, "description", e.target.value)}
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

      <div className="flex justify-start">
        <button
          onClick={handleAddProject}
          disabled={loading}
          className="group inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-gradient-to-r from-primary/10 to-fuchsia-100 px-3 py-2 text-xs font-semibold text-primary shadow-sm transition hover:from-primary/20 hover:to-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-sm leading-none shadow-sm">
              +
            </span>
            Add Another Project
          </span>
        </button>
      </div>

      <div className="flex justify-end items-center pt-2">
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
            disabled={isSubmitting || loading}
            className={`px-4 py-2 rounded-md text-white text-sm transition ${
              isSubmitting || loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isSubmitting ? (
              <ImSpinner3 className="animate-spin" />
            ) : loading ? (
              "Loading projects..."
            ) : isTimeStoppedForCheckout ? (
              "Confirm Checkout"
            ) : (
              "Checkout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ForgotProjectList = ({
  onClose,
  isTimeStoppedForCheckout,
  checkOutTimeForgot,
  getTimeDifference,
  checkInTimeForgot,
  shiftDate,
  selectedReasons,
  setForgotisModalOpen,
  setIsUpdate,
}) => {
  const { loading, data: projects } = useUsers("/projects", 1, 1000);
  const [entries, setEntries] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerms, setSearchTerms] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const projectsList = Array.isArray(projects) ? projects : [];

  const createEmptyEntry = (projectId = "") => ({
    project: projectId,
    hoursWorked: 0,
    minutesWorked: 0,
    description: "",
  });

  const normalizeProjectName = (value = "") =>
    value.toLowerCase().trim().replace(/\s+/g, " ");

  const findDefaultProject = (list, projectName) => {
    const normalizedTarget = normalizeProjectName(projectName).replace(/\s/g, "");
    return list.find((project) => {
      const normalizedName = normalizeProjectName(project?.name || "").replace(
        /\s/g,
        ""
      );
      return (
        normalizedName === normalizedTarget ||
        normalizedName.includes(normalizedTarget) ||
        normalizedTarget.includes(normalizedName)
      );
    });
  };

  useEffect(() => {
    if (isInitialized || loading || projectsList.length === 0)
      return;

    const defaultProjectNames = ["Free Project", "Break"];
    const matchedProjects = defaultProjectNames.map((projectName) =>
      findDefaultProject(projectsList, projectName) || null
    );
    const initializedEntries = matchedProjects.map((project) =>
      createEmptyEntry(project?._id || "")
    );

    const workedMinutes = (() => {
      if (!checkInTimeForgot || !checkOutTimeForgot || !shiftDate) return 0;
      const createDateTime = (timeStr) => {
        const [hours, minutes] = timeStr.trim().split(":").map(Number);
        const date = new Date(shiftDate);
        date.setUTCHours(hours, minutes, 0, 0);
        return date;
      };
      const checkInDate = createDateTime(checkInTimeForgot);
      const checkOutDate = createDateTime(checkOutTimeForgot);
      if (checkOutDate <= checkInDate) checkOutDate.setDate(checkOutDate.getDate() + 1);
      return Math.max(Math.floor((checkOutDate - checkInDate) / 60000), 0);
    })();

    if (workedMinutes < 8 * 60) {
      const extraMinutes = 8 * 60 - workedMinutes;
      const breakIndex = matchedProjects.findIndex(
        (project) =>
          normalizeProjectName(project?.name || "").replace(/\s/g, "") === "break"
      );
      if (breakIndex >= 0) {
        initializedEntries[breakIndex] = {
          ...initializedEntries[breakIndex],
          hoursWorked: Math.floor(extraMinutes / 60),
          minutesWorked: extraMinutes % 60,
        };
      }
    }

    setEntries(initializedEntries);
    setSearchTerms(matchedProjects.map((project) => project?.name || ""));
    setSelectedProjects(matchedProjects);
    setIsInitialized(true);
  }, [isInitialized, loading, projects, checkInTimeForgot, checkOutTimeForgot, shiftDate]);

  const handleAddProject = () => {
    setEntries((prev) => [...prev, createEmptyEntry()]);
    setSearchTerms((prev) => [...prev, ""]);
    setSelectedProjects((prev) => [...prev, null]);
  };

  const handleRemoveProject = (index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setSearchTerms((prev) => prev.filter((_, i) => i !== index));
    setSelectedProjects((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = {};
      Object.keys(prev).forEach((key) => {
        const currentIndex = Number(key);
        if (currentIndex < index) next[currentIndex] = prev[currentIndex];
        if (currentIndex > index) next[currentIndex - 1] = prev[currentIndex];
      });
      return next;
    });
    setOpenDropdownIndex((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
  };

  const availableMinutes = () => {
    if (!checkInTimeForgot || !checkOutTimeForgot || !shiftDate) return 0;

    const createDateTime = (timeStr) => {
      const [hours, minutes] = timeStr.trim().split(":").map(Number);
      const date = new Date(shiftDate);
      date.setUTCHours(hours, minutes, 0, 0);
      return date;
    };

    const checkInDate = createDateTime(checkInTimeForgot);
    const checkOutDate = createDateTime(checkOutTimeForgot);

    if (checkOutDate <= checkInDate) {
      checkOutDate.setDate(checkOutDate.getDate() + 1);
    }

    const diffInMinutes = Math.floor((checkOutDate - checkInDate) / 60000);
    return Math.max(diffInMinutes, 0);
  };

  const MIN_REQUIRED_MINUTES = 8 * 60;
  const totalAvailableMinutes = availableMinutes();
  const totalRequiredMinutes = Math.max(totalAvailableMinutes, MIN_REQUIRED_MINUTES);
  const minimumExtraMinutes = Math.max(MIN_REQUIRED_MINUTES - totalAvailableMinutes, 0);

  const totalEnteredMinutes = entries.reduce((sum, entry) => {
    const hours = parseInt(entry.hoursWorked) || 0;
    const minutes = parseInt(entry.minutesWorked) || 0;
    return sum + hours * 60 + minutes;
  }, 0);

  const remainingMinutes = totalRequiredMinutes - totalEnteredMinutes;

  const getEntryProjectName = (entry, index) => {
    const selected = selectedProjects[index];
    if (selected?.name) return selected.name;
    const projectFromList = projectsList.find((project) => project?._id === entry?.project);
    if (projectFromList?.name) return projectFromList.name;
    return searchTerms[index] || "";
  };

  const isFlexibleProjectEntry = (entry, index) => {
    const normalizedName = normalizeProjectName(getEntryProjectName(entry, index)).replace(
      /\s/g,
      ""
    );
    return normalizedName === "break" || normalizedName === "freeproject";
  };

  const handleSearchChange = (e, index) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = e.target.value || "";
    setSearchTerms(updatedSearchTerms);
  };

  const handleChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  const handleSelect = (project, index) => {
    const updatedSelectedProjects = [...selectedProjects];
    updatedSelectedProjects[index] = project;

    setSelectedProjects(updatedSelectedProjects);
    setSearchTerms((prevSearchTerms) => {
      const updatedSearchTerms = [...prevSearchTerms];
      updatedSearchTerms[index] = project.name;
      return updatedSearchTerms;
    });
    setOpenDropdownIndex(null);

    const updatedEntries = [...entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      project: project._id,
    };
    setEntries(updatedEntries);
  };

  const toggleDropdown = (index) => {
    setOpenDropdownIndex((prev) => (prev === index ? null : index));
  };

  const toUTCHoursOnly = (localTimeStr) => {
    if (!localTimeStr) return "";
    const localDate = new Date(`1970-01-01T${localTimeStr}:00+05:00`);
    return localDate.toISOString().substring(11, 16);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const newErrors = {};

    entries.forEach((entry, index) => {
      const entryErrors = {};
      if (!entry.project) entryErrors.project = "Project is required";
      if (!entry.hoursWorked && !entry.minutesWorked)
        entryErrors.time = "Hours or minutes required";
      if (!entry.description) entryErrors.description = "Description is required";

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

    setErrors({});

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

    if (totalEntered > totalRequiredMinutes) {
      ErrorToast(
        `Total entered time (${Math.floor(totalEntered / 60)}h ${
          totalEntered % 60
        }m) cannot exceed required allocation (${Math.floor(
          totalRequiredMinutes / 60
        )}h ${totalRequiredMinutes % 60}m).`
      );
      setIsSubmitting(false);
      return;
    }

    if (totalEntered !== totalRequiredMinutes) {
      ErrorToast(
        `Please complete required allocation before confirming checkout. Time remaining: ${Math.floor(
          remainingMinutes / 60
        )}h ${remainingMinutes % 60}m.`
      );
      setIsSubmitting(false);
      return;
    }

    if (minimumExtraMinutes > 0) {
      const nonFlexibleMinutes = entries.reduce((sum, entry, index) => {
        const entryMinutes =
          (parseInt(entry.hoursWorked) || 0) * 60 + (parseInt(entry.minutesWorked) || 0);
        return isFlexibleProjectEntry(entry, index) ? sum : sum + entryMinutes;
      }, 0);

      if (nonFlexibleMinutes > totalAvailableMinutes) {
        ErrorToast(
          `When worked time is below 8 hours, the extra ${Math.floor(
            minimumExtraMinutes / 60
          )}h ${minimumExtraMinutes % 60}m must be allocated only to Free Project or Break.`
        );
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      shiftDate: shiftDate,
      reason: selectedReasons,
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

    try {
      await axios.post("/attendance/missing", payload);
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
      <div className="text-sm text-gray-700 space-y-1">
        <p>
          <strong>Total Time Duration:</strong>{" "}
          <span className="text-primary font-medium">
            {getTimeDifference(checkInTimeForgot, checkOutTimeForgot)}
          </span>
        </p>
        <p>
          <strong>Required Allocation:</strong>{" "}
          <span className="text-primary font-medium">
            {Math.floor(totalRequiredMinutes / 60)}h {totalRequiredMinutes % 60}m
          </span>
        </p>
        {minimumExtraMinutes > 0 && (
          <p className="text-xs text-amber-700">
            Extra {Math.floor(minimumExtraMinutes / 60)}h {minimumExtraMinutes % 60}m
            {" "}must be filled in Free Project or Break.
          </p>
        )}
        <p>
          <strong>Time Remaining:</strong>{" "}
          <span className="text-primary font-medium">
            {Math.floor(remainingMinutes / 60)}h {remainingMinutes % 60}m
          </span>
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading projects...</p>
      ) : (
        entries.map((entry, index) => {
          const searchTermForEntry = searchTerms[index] || "";
          const filteredProjects = projectsList.filter((proj) =>
            proj.name.toLowerCase().includes(searchTermForEntry.toLowerCase())
          );

          const otherMinutes = entries.reduce((sum, ent, i) => {
            if (i !== index) {
              const hours = parseInt(ent.hoursWorked) || 0;
              const minutes = parseInt(ent.minutesWorked) || 0;
              return sum + hours * 60 + minutes;
            }
            return sum;
          }, 0);

          const maxForThis = totalRequiredMinutes - otherMinutes;
          const maxHours = Math.floor(maxForThis / 60);

          return (
            <div
              key={index}
              className="rounded-lg border border-primary/20 bg-primary/10 p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Project #{index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(index)}
                  disabled={loading || entries.length <= 1}
                  className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search project..."
                  value={searchTerms[index] || ""}
                  onChange={(e) => handleSearchChange(e, index)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onClick={() => toggleDropdown(index)}
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
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={entry.hoursWorked}
                    min="0"
                    max={maxHours}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (val < 0) return;

                      const currentMinutes = parseInt(entry.minutesWorked) || 0;
                      const totalMinutesForEntry = val * 60 + currentMinutes;

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
                    placeholder="Minutes (0-59)"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={2}
                value={entry.description}
                onChange={(e) => handleChange(index, "description", e.target.value)}
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

      <div className="flex justify-start">
        <button
          onClick={handleAddProject}
          disabled={loading}
          className="group inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-gradient-to-r from-primary/10 to-fuchsia-100 px-3 py-2 text-xs font-semibold text-primary shadow-sm transition hover:from-primary/20 hover:to-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-sm leading-none shadow-sm">
              +
            </span>
            Add Another Project
          </span>
        </button>
      </div>

      <div className="flex justify-end items-center pt-2">
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
            disabled={isSubmitting || loading}
            className={`px-4 py-2 rounded-md text-white text-sm transition ${
              isSubmitting || loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isSubmitting ? (
              <ImSpinner3 className="animate-spin" />
            ) : loading ? (
              "Loading projects..."
            ) : isTimeStoppedForCheckout ? (
              "Confirm Checkout"
            ) : (
              "Checkout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
