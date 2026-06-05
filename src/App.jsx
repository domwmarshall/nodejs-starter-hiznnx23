import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, Lock } from "lucide-react";

import { AppStatusStrip } from "./components/AppStatusStrip";
import { SectionHeader } from "./components/SectionHeader";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { MobileNav } from "./components/MobileNav";
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

import {
  MODULE_SETTINGS_STORAGE_KEY,
  applyToggleStateToModules,
  getActiveModule,
  getAppShellMetrics,
  getModuleSetting,
  mergeModuleToggleSettings,
} from "./services/appShellService";

import {
  AlertBanner,
  Button,
  Panel,
} from "./components/ui";

import "./style.css";

function DisabledModulePage({ module, onOpenSettings }) {
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

      <Panel className="panel">
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

        <div className="policy-actions">
          <Button type="button" variant="primary" onClick={onOpenSettings}>
            Open Settings
          </Button>
        </div>
      </Panel>
    </>
  );
}

function PrototypeBanner({ activeModule, activeModuleSetting }) {
  return (
    <AlertBanner
      tone={activeModuleSetting?.enabled === false ? "warning" : "info"}
      title="Prototype mode"
      icon={AlertTriangle}
    >
      Dummy data only · No patient-identifiable data · {activeModule.name}: {" "}
      {activeModuleSetting?.enabled === false ? "disabled" : "enabled"} · {" "}
      {activeModule.risk} risk
    </AlertBanner>
  );
}

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [moduleToggleSettings, setModuleToggleSettings] = useLocalStorageState(
    MODULE_SETTINGS_STORAGE_KEY,
    moduleSettings
  );

  const [holidayRequests, setHolidayRequests] = useLocalStorageState(
    STAFF_LEAVE_STORAGE_KEY,
    getDefaultHolidayRequests()
  );

  const safeModuleToggleSettings = useMemo(
    () => mergeModuleToggleSettings(moduleToggleSettings, moduleSettings),
    [moduleToggleSettings]
  );

  const modulesWithToggleState = useMemo(
    () => applyToggleStateToModules(modules, safeModuleToggleSettings),
    [safeModuleToggleSettings]
  );

  const activeModule = useMemo(
    () => getActiveModule(modulesWithToggleState, activePage),
    [activePage, modulesWithToggleState]
  );

  const activeModuleSetting = useMemo(
    () => getModuleSetting(safeModuleToggleSettings, activePage),
    [safeModuleToggleSettings, activePage]
  );

  const appShellMetrics = useMemo(
    () => getAppShellMetrics(modulesWithToggleState),
    [modulesWithToggleState]
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
      return (
        <DisabledModulePage
          module={activeModule}
          onOpenSettings={() => setActivePage("settings")}
        />
      );
    }

    return renderEnabledPage();
  }

  return (
    <div className="app-shell">
      <Sidebar
        modules={modulesWithToggleState}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-area">
        <Topbar
          activeModule={activeModule}
          modules={modulesWithToggleState}
          activePage={activePage}
          onNavigate={setActivePage}
        />

        <PrototypeBanner
          activeModule={activeModule}
          activeModuleSetting={activeModuleSetting}
        />

        <AppStatusStrip metrics={appShellMetrics} />

        {renderActivePage()}
      </main>

      <MobileNav
        modules={modulesWithToggleState}
        activePage={activePage}
        onNavigate={setActivePage}
      />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
