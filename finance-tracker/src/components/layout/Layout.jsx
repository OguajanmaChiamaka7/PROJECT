
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../../styles/Layout.css'; // Ensure you have some basic styles

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <Sidebar sidebarOpen={isSidebarOpen} toggleSidebar={handleToggleSidebar} />

      {/* Main Content Area */}
      <div className="layout-main">
        {/* Fixed Navbar */}
        <Navbar toggleSidebar={handleToggleSidebar} />
        
        {/* Dashboard Content that gets pushed */}
        <main className={`layout-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="overlay" onClick={handleToggleSidebar}></div>
      )}
    </div>
  );
};

export default Layout;