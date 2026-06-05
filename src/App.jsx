import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, Lock } from "lucide-react";

import { Badge } from "./components/Badge";
import { SectionHeader } from "./components/SectionHeader";
import { modules } from "./data/modules";
import { moduleSettings } from "./data/settings";
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
import {
  STAFF_LEAVE_STORAGE_KEY,
  getDefaultHolidayRequests,
  addHolidayRequest as addHolidayRequestToList,
  updateHolidayRequestStatus as updateHolidayRequestStatusInList,
} from "./services/staffService";
import "./style.css";

function DisabledModulePage({ module }) {
  return (
    <>
      <section className="disabled-module-panel">
        <div className="disabled-module-icon">
          <Lock size={28} />
        </div>

        <div>
          <p className="eyebrow">Module disabled</p>
          <h1>{module.name} is currently switched off</h1>
          <p>
            This module has been disabled in Settings. In a production version,
            this would be controlled by administrator permissions and practice
            configuration.
          </p>
        </div>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="How to re-enable" title="Turn the module back on">
          Go to Settings, find the module in Module Toggles, then click Enable.
        </SectionHeader>

        <div className="blue-box">
          <strong>Prototype behaviour</strong>
          <p>
            The sidebar still shows disabled modules so you can see the full app
            structure, but access is blocked until the module is enabled again.
          </p>
        </div>
      </section>
    </>
  );
}

function PrototypeBanner({ activeModule, activeModuleSetting }) {
  return (
    <div className="prototype-banner">
      <div>
        <AlertTriangle size={18} />
        <span>
          Prototype mode · Dummy data only · No patient-identifiable data ·{" "}
          {activeModule.name}:{" "}
          {activeModuleSetting?.enabled === false ? "disabled" : "enabled"}
        </span>
      </div>

      <Badge>{activeModule.risk} risk</Badge>
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [moduleToggleSettings, setModuleToggleSettings] = useLocalStorageState(
    "gpop-module-settings",
    moduleSettings
  );

  const normalisedModuleToggleSettings = useMemo(() => {
    const savedSettings = Array.isArray(moduleToggleSettings)
      ? moduleToggleSettings
      : [];
  
    return moduleSettings.map((defaultModule) => {
      const savedModule = savedSettings.find(
        (item) => item.id === defaultModule.id
      );
  
      return {
        ...defaultModule,
        ...savedModule,
        enabled:
          typeof savedModule?.enabled === "boolean"
            ? savedModule.enabled
            : defaultModule.enabled,
      };
    });
  }, [moduleToggleSettings]);

  const [holidayRequests, setHolidayRequests] = useLocalStorageState(
    STAFF_LEAVE_STORAGE_KEY,
    getDefaultHolidayRequests()
  );

  const safeModuleToggleSettings = normalisedModuleToggleSettings;

  const modulesWithToggleState = useMemo(
    () =>
      modules.map((module) => {
        const setting = safeModuleToggleSettings.find(
          (item) => item.id === module.id
        );

        return {
          ...module,
          enabled: setting ? setting.enabled : true,
          governanceStatus: setting?.governanceStatus || module.status,
          dataRisk: setting?.dataRisk || module.risk,
        };
      }),
    [safeModuleToggleSettings]
  );

  const activeModule = useMemo(
    () =>
      modulesWithToggleState.find((module) => module.id === activePage) ||
      modulesWithToggleState[0],
    [activePage, modulesWithToggleState]
  );

  const activeModuleSetting = safeModuleToggleSettings.find(
    (item) => item.id === activePage
  );

  function addHolidayRequest(newRequest) {
    setHolidayRequests((currentRequests) =>
      addHolidayRequestToList(currentRequests, newRequest)
    );
  }
  
  function updateHolidayRequestStatus(requestId, newStatus) {
    setHolidayRequests((currentRequests) =>
      updateHolidayRequestStatusInList(currentRequests, requestId, newStatus)
    );
  }

  function renderEnabledPage() {
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

    if (activePage === "settings") {
      return (
        <SettingsPage
          moduleToggleSettings={safeModuleToggleSettings}
          setModuleToggleSettings={setModuleToggleSettings}
        />
      );
    }

    return <DashboardPage holidayRequests={holidayRequests} />;
  }

  function renderActivePage() {
    if (activeModule.enabled === false && activePage !== "settings") {
      return <DisabledModulePage module={activeModule} />;
    }

    return renderEnabledPage();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div
          className="brand-block brand-card-force"
          style={{
            background: "linear-gradient(135deg, #005eb8, #003087)",
            color: "white",
            borderRadius: "24px",
            padding: "18px",
            marginBottom: "22px",
            boxShadow: "0 18px 35px rgba(0, 94, 184, 0.22)",
          }}
        >
          <div
            className="brand-topline"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "white",
                fontWeight: 900,
                letterSpacing: "0.1em",
                fontSize: "13px",
              }}
            >
              GPOP
            </p>

            <span
              style={{
                background: "rgba(255, 255, 255, 0.16)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                color: "white",
                borderRadius: "999px",
                padding: "4px 9px",
                fontSize: "11px",
                fontWeight: 950,
              }}
            >
              v0.1
            </span>
          </div>

          <h1
            style={{
              margin: "8px 0 0",
              color: "white",
              fontSize: "19px",
              lineHeight: 1.12,
            }}
          >
            General Practice Operations Portal
          </h1>

          <small
            style={{
              display: "block",
              marginTop: "10px",
              color: "white",
              opacity: 0.86,
              fontSize: "13px",
              fontWeight: 800,
            }}
          >
            Prototype operations hub
          </small>
        </div>

        <nav className="nav-list">
          {modulesWithToggleState.map((module) => {
            const Icon = module.icon;
            const isActive = activePage === module.id;
            const isDisabled = module.enabled === false && module.id !== "settings";

            return (
              <button
                key={module.id}
                className={[
                  "nav-item",
                  isActive ? "nav-item-active" : "",
                  isDisabled ? "nav-item-disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActivePage(module.id)}
                title={isDisabled ? `${module.name} is disabled` : module.name}
              >
                <Icon size={18} />
                <span>{module.name}</span>
                {isDisabled ? <Lock size={14} className="nav-lock" /> : null}
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
            <Badge>
              {activeModule.enabled === false ? "Disabled" : activeModule.status}
            </Badge>
            <Badge>{activeModule.risk} risk</Badge>
          </div>
        </header>

        <PrototypeBanner
          activeModule={activeModule}
          activeModuleSetting={activeModuleSetting}
        />

        {renderActivePage()}
      </main>

      <nav className="mobile-nav">
        {modulesWithToggleState.slice(0, 5).map((module) => {
          const Icon = module.icon;
          const isDisabled = module.enabled === false && module.id !== "settings";

          return (
            <button
              key={module.id}
              className={activePage === module.id ? "mobile-active" : ""}
              onClick={() => setActivePage(module.id)}
              title={isDisabled ? `${module.name} is disabled` : module.name}
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