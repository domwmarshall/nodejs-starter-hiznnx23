import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle } from "lucide-react";

import { Badge } from "./components/Badge";
import { modules } from "./data/modules";
import { useLocalStorageState } from "./hooks/useLocalStorageState";

import { DashboardPage } from "./pages/DashboardPage";
import { StaffPage } from "./pages/StaffPage";
import { CalendarPage } from "./pages/CalendarPage";
import { InboxPage } from "./pages/InboxPage";
import { CompliancePage } from "./pages/CompliancePage";
import { TrainingPage } from "./pages/TrainingPage";
import { AuditsPage } from "./pages/AuditsPage";
import { FinancePage } from "./pages/FinancePage";
import { CareNavigationPage } from "./pages/CareNavigationPage";
import { SettingsPage } from "./pages/SettingsPage";

import "./style.css";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [holidayRequests, setHolidayRequests] = useLocalStorageState(
    "gpop-holiday-requests",
    [
      {
        id: 1,
        staffName: "Reception User",
        date: "2026-07-01",
        hours: 7.5,
        reason: "Annual leave",
        status: "Pending",
      },
      {
        id: 2,
        staffName: "Nurse User",
        date: "2026-07-08",
        hours: 4,
        reason: "Medical appointment",
        status: "Approved",
      },
      {
        id: 3,
        staffName: "GP User",
        date: "2026-07-22",
        hours: 7.5,
        reason: "Annual leave",
        status: "Rejected",
      },
    ]
  );

  const activeModule = useMemo(
    () => modules.find((module) => module.id === activePage) || modules[0],
    [activePage]
  );

  function addHolidayRequest(newRequest) {
    setHolidayRequests((currentRequests) => [newRequest, ...currentRequests]);
  }

  function updateHolidayRequestStatus(requestId, newStatus) {
    setHolidayRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: newStatus,
            }
          : request
      )
    );
  }

  function renderActivePage() {
    if (activePage === "staff") {
      return (
        <StaffPage
          holidayRequests={holidayRequests}
          addHolidayRequest={addHolidayRequest}
          updateHolidayRequestStatus={updateHolidayRequestStatus}
        />
      );
    }

    if (activePage === "calendar") {
      return <CalendarPage holidayRequests={holidayRequests} />;
    }

    if (activePage === "inbox") return <InboxPage />;
    if (activePage === "compliance") return <CompliancePage />;
    if (activePage === "training") return <TrainingPage />;
    if (activePage === "audits") return <AuditsPage />;
    if (activePage === "finance") return <FinancePage />;
    if (activePage === "care-navigation") return <CareNavigationPage />;
    if (activePage === "settings") return <SettingsPage />;

    return <DashboardPage />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p>GPOP</p>
          <h1>General Practice Operations Portal</h1>
        </div>

        <nav className="nav-list">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activePage === module.id;

            return (
              <button
                key={module.id}
                className={`nav-item ${isActive ? "nav-item-active" : ""}`}
                onClick={() => setActivePage(module.id)}
              >
                <Icon size={18} />
                <span>{module.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-warning">
          <AlertTriangle size={18} />
          <p>
            <strong>Prototype only.</strong>
            <br />
            Do not upload patient-identifiable data.
          </p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="topbar-label">Current module</p>
            <h2>{activeModule.name}</h2>
          </div>

          <div className="topbar-badges">
            <Badge>{activeModule.status}</Badge>
            <Badge>{activeModule.risk} risk</Badge>
          </div>
        </header>

        {renderActivePage()}
      </main>

      <nav className="mobile-nav">
        {modules.slice(0, 5).map((module) => {
          const Icon = module.icon;

          return (
            <button
              key={module.id}
              className={activePage === module.id ? "mobile-active" : ""}
              onClick={() => setActivePage(module.id)}
            >
              <Icon size={18} />
              <span>{module.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);