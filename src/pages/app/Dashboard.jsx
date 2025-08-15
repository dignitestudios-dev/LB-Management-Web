import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Users from "../../components/app/Users";
import Departments from "../../components/app/Departments";
import Summary from "../../components/app/Summary";
import Roles from "../../components/app/Roles";
import Projects from "../../components/app/Projects";
import Cookies from "js-cookie";
import {
  FaUsers,
  FaBuilding,
  FaChartBar,
  FaUserShield,
  FaSignOutAlt,
  FaBusinessTime,
  FaTasks,
  FaSpinner,
} from "react-icons/fa";
import Shift from "../../components/app/Shifts";
import { useLogin } from "../../hooks/api/Post";
import { useUsers } from "../../hooks/api/Get";
import { SuccessToast } from "../../components/global/Toaster";
import { IoLogOut } from "react-icons/io5";
import EmployeeTimeSheet from "../../components/app/EmployeeTimeSheet";
import { PiArticleNyTimes } from "react-icons/pi";
import Divisions from "../../components/app/Divisions";
import Reports from "../../components/app/Reports";

const   Dashboard = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  const { postData, loading } = useLogin();
  const { data: user, loading: userLoading } = useUsers("/users/me");
  const dropdownRef = useRef(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role?.name !== "Admin") {
        navigate("/app/userdashboard");
      }
    }
  }, [navigate]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <Users />;
      case "departments":
        return <Departments />;
      case "divisions":
        return <Divisions />;
      case "summary":
        return <Summary />;
      case "roles":
        return <Roles />;
      case "projects":
        return <Projects />;
      case "shifts":
        return <Shift />;
      case "timeSheet":
        return <EmployeeTimeSheet />;
      case "reports":
        return <Reports />;
      default:
        return <Summary />;
    }
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

  return (
    <div className="min-h-screen bg-[#f4f8ff] flex flex-col">
      {/* Sidebar */}
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
          <ul className="space-y-2 mt-10">
            <SidebarItem
              icon={<FaChartBar />}
              label="Get Summary"
              active={activeTab === "summary"}
              onClick={() => setActiveTab("summary")}
            />

            <SidebarItem
              icon={<FaUsers />}
              label="All Users"
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
            />
            <SidebarItem
              icon={<FaBuilding />}
              label="All Departments"
              active={activeTab === "departments"}
              onClick={() => setActiveTab("departments")}
            />
            <SidebarItem
              icon={<FaBuilding />}
              label="All Divisions"
              active={activeTab === "divisions"}
              onClick={() => setActiveTab("divisions")}
            />
            <SidebarItem
              icon={<FaBusinessTime />}
              label="Shifts"
              active={activeTab === "shifts"}
              onClick={() => setActiveTab("shifts")}
            />
            <SidebarItem
              icon={<FaUserShield />}
              label="All Roles"
              active={activeTab === "roles"}
              onClick={() => setActiveTab("roles")}
            />
            <SidebarItem
              icon={<FaTasks />}
              label="All Projects"
              active={activeTab === "projects"}
              onClick={() => setActiveTab("projects")}
            />
            <SidebarItem
              icon={<PiArticleNyTimes />}
              label="Time Sheet"
              active={activeTab === "timeSheet"}
              onClick={() => setActiveTab("timeSheet")}
            />
            <SidebarItem
              icon={<PiArticleNyTimes />}
              label="Reports"
              active={activeTab === "reports"}
              onClick={() => setActiveTab("reports")}
            />
          </ul>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="text-2xl font-semibold text-gray-800 mb-4 capitalize">
            {/* {activeTab.replace("-", " ")} */}
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

const SidebarItem = ({ icon, label, active, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg transition 
        ${
          active
            ? "bg-red-100 text-[#f40e00] font-semibold"
            : "text-gray-700 hover:bg-gray-100"
        }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  </li>
);
