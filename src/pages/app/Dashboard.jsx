import React, { useState } from "react";
import { useNavigate } from "react-router";
import Users from "../../components/app/Users";
import Departments from "../../components/app/Departments";
import Summary from "../../components/app/Summary";
import Roles from "../../components/app/Roles";
import Projects from "../../components/app/Projects";
import {
  FaUsers,
  FaBuilding,
  FaChartBar,
  FaUserShield,
  FaSignOutAlt,
  FaBusinessTime,
} from "react-icons/fa";
import Shift from "../../components/app/Shifts";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();

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

        {/* Logout Button */}
        <div className="space-y-4 mt-60">
          <button
            onClick={() => navigate("/auth/login")}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-lg transition"
          >
            <FaSignOutAlt className="text-base" />
            Logout
          </button>
          <div className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} LaunchBox Pvt Ltd
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
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
