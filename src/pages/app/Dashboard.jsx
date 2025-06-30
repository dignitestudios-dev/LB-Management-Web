import React, { useState } from 'react';
import Users from '../../components/app/Users';
import Departments from '../../components/app/Departments';
import Summary from '../../components/app/Summary';
import Roles from '../../components/app/Roles';
import { FaUsers, FaBuilding, FaChartBar, FaUserShield } from 'react-icons/fa';
import Projects from '../../components/app/Projects';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <Users />;
      case 'departments':
        return <Departments />;
      case 'summary':
        return <Summary />;
      case 'roles':
        return <Roles />;
      case 'projects':
        return <Projects />;
      default:
        return <Users />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f8ff]">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-2xl border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-blue-600 uppercase mb-1">LB Management</h1>
          <h2 className="text-md text-gray-600 mb-6">Admin Panel</h2>

          <ul className="space-y-2">
            <SidebarItem
              icon={<FaUsers />}
              label="All Users"
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            />
            <SidebarItem
              icon={<FaBuilding />}
              label="All Departments"
              active={activeTab === 'departments'}
              onClick={() => setActiveTab('departments')}
            />
            <SidebarItem
              icon={<FaChartBar />}
              label="Get Summary"
              active={activeTab === 'summary'}
              onClick={() => setActiveTab('summary')}
            />
            <SidebarItem
              icon={<FaUserShield />}
              label="All Roles"
              active={activeTab === 'roles'}
              onClick={() => setActiveTab('roles')}
            />
             <SidebarItem
              icon={<FaUserShield />}
              label="All Projects"
              active={activeTab === 'projects'}
              onClick={() => setActiveTab('projects')}
            />
          </ul>
        </div>

        <div className="text-xs text-gray-400 mt-8 text-center">
          © {new Date().getFullYear()} LaunchBox Pvt Ltd
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        <div className="text-2xl font-semibold text-gray-800 mb-4 capitalize">{activeTab.replace('-', ' ')}</div>
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
        ${active ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  </li>
);
