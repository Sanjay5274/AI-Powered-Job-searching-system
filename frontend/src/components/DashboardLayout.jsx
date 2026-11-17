import React from "react";
import Sidebar from "./Sidebar";

function DashboardLayout({ children, title = "Dashboard" }) {
  return (
    <div className="dashboard-page">

      <Sidebar />

      <main className="dashboard-main">

        <header className="dashboard-topbar">
          <div>
            <span className="breadcrumb">▦</span>
            {title}
          </div>

          <div className="topbar-right">
            <span className="online-dot"></span>
            AI Resume Analyzer
            <span className="user-avatar">U</span>
          </div>
        </header>

        <div className="dashboard-content">
          {children}
        </div>

      </main>

    </div>
  );
}

export default DashboardLayout;