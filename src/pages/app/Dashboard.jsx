import { useState } from "react";
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
} from "react-icons/fa";
import Shift from "../../components/app/Shifts";
import { useLogin } from "../../hooks/api/Post";
import { useUsers } from "../../hooks/api/Get";
import { SuccessToast } from "../../components/global/Toaster";
import { IoLogOut } from "react-icons/io5";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const navigate = useNavigate();
  const { postData, loading } = useLogin();
  const { data: user, loading: userLoading } = useUsers("/users/me");

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <Users />;
      case "departments":
        return <Departments />;
      case "summary":
        return <Summary />;
      case "roles":
        return <Roles />;
      case "projects":
        return <Projects />;
      case "shifts":
        return <Shift />;
      default:
        return <Summary />;
    }
  };

  const handleLogout = async () => {
    await postData("/auth/logout", false, null, null, (res) => {
      Cookies.remove("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      SuccessToast("Logged out successfully.");
      navigate("/auth/login");
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f4f8ff]">
      {/* Sidebar */}
      <aside className="w-64 bg-[rgb(237 237 237)] shadow-2xl border-r border-gray-200 p-6 flex flex-col">
        <div>
          <h1 className="text-xl font-bold text-[#f40e00] uppercase mb-1">
            LB Management
          </h1>
          <h2 className="text-md text-gray-600 mb-6">Admin Panel</h2>

          <ul className="space-y-2">
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
              icon={<FaUserShield />}
              label="All Projects"
              active={activeTab === "projects"}
              onClick={() => setActiveTab("projects")}
            />
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
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
        <div className="text-2xl font-semibold text-gray-800 mb-4 capitalize">
          {activeTab.replace("-", " ")}
        </div>
        {renderContent()}
      </main>
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
