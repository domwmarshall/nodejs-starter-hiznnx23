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
import { appUsers } from "./data/users";
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
  ACTIVE_USER_STORAGE_KEY,
  applyUserAccessToModules,
  getAppUserById,
  getDefaultAppUser,
} from "./services/userService";

import {
  WORKFORCE_PROFILES_STORAGE_KEY,
  addContractAmendment as addContractAmendmentToProfiles,
  getSafeWorkforceProfiles,
  getDefaultWorkforceProfiles,
} from "./services/workforceService";

import {
  AlertBanner,
  Button,
  Panel,
} from "./components/ui";

import "./style.css";

function DisabledModulePage({ module, activeUser, onOpenSettings }) {
  const isRoleLocked = module.roleLocked === true;

  return (
    <>
      <section className="disabled-module-panel">
        <div className="disabled-module-icon">
          <Lock size={28} />
        </div>

        <div>
          <p className="eyebrow">
            {isRoleLocked ? "Role access restricted" : "Module disabled"}
          </p>
          <h1>{module.name} is currently unavailable</h1>
          <p>
            {isRoleLocked
              ? `${activeUser.role} does not have access to this module in the current role-based prototype. Switch back to Practice Manager to manage all areas.`
              : "This module has been disabled in Settings. In a production version, this would be controlled by administrator permissions and practice configuration."}
          </p>
        </div>
      </section>

      <Panel className="panel">
        <SectionHeader
          eyebrow={isRoleLocked ? "Role-based access" : "How to re-enable"}
          title={isRoleLocked ? "This is now behaving like a role-gated app" : "Turn the module back on"}
        >
          {isRoleLocked
            ? "Use the View as selector in the top bar to test different staff experiences. Practice Manager can access the full admin system."
            : "Go to Settings, find the module in Module Toggles, then click Enable."}
        </SectionHeader>

        <div className="blue-box">
          <strong>Current access</strong>
          <p>
            {module.lockReason ||
              `${module.name} is not available to ${activeUser.role}.`}
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

function PrototypeBanner({ activeModule, activeModuleSetting, activeUser }) {
  return (
    <AlertBanner
      tone={activeModule.enabled === false ? "warning" : "info"}
      title="Prototype mode"
      icon={AlertTriangle}
    >
      Dummy data only · No patient-identifiable data · View as {activeUser.role} ·{" "}
      {activeModule.name}: {activeModule.enabled === false ? "unavailable" : "available"} ·{" "}
      {activeModule.risk} risk · Access: {activeModule.roleAccess || "View"}
    </AlertBanner>
  );
}

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [activeUserId, setActiveUserId] = useLocalStorageState(
    ACTIVE_USER_STORAGE_KEY,
    getDefaultAppUser().id
  );

  const activeUser = useMemo(
    () => getAppUserById(activeUserId),
    [activeUserId]
  );

  const [moduleToggleSettings, setModuleToggleSettings] = useLocalStorageState(
    MODULE_SETTINGS_STORAGE_KEY,
    moduleSettings
  );

  const [holidayRequests, setHolidayRequests] = useLocalStorageState(
    STAFF_LEAVE_STORAGE_KEY,
    getDefaultHolidayRequests()
  );

  const [workforceProfiles, setWorkforceProfiles] = useLocalStorageState(
    WORKFORCE_PROFILES_STORAGE_KEY,
    getDefaultWorkforceProfiles()
  );

  const safeWorkforceProfiles = useMemo(
    () => getSafeWorkforceProfiles(workforceProfiles),
    [workforceProfiles]
  );

  const safeModuleToggleSettings = useMemo(
    () => mergeModuleToggleSettings(moduleToggleSettings, moduleSettings),
    [moduleToggleSettings]
  );

  const modulesWithToggleState = useMemo(
    () => {
      const toggleAwareModules = applyToggleStateToModules(
        modules,
        safeModuleToggleSettings
      );

      return applyUserAccessToModules(toggleAwareModules, activeUser);
    },
    [safeModuleToggleSettings, activeUser]
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

  function addContractAmendment(staffName, amendment) {
    setWorkforceProfiles((currentProfiles) =>
      addContractAmendmentToProfiles(currentProfiles, staffName, amendment)
    );
  }

  function resetWorkforceProfiles() {
    setWorkforceProfiles(getDefaultWorkforceProfiles());
  }

  function renderEnabledPage() {
    if (activePage === "staff") {
      return (
        <StaffPage
          holidayRequests={holidayRequests}
          addHolidayRequest={addHolidayRequest}
          updateHolidayRequestStatus={updateHolidayRequestStatus}
          currentUser={activeUser}
          staffList={safeWorkforceProfiles}
          addContractAmendment={addContractAmendment}
          resetWorkforceProfiles={resetWorkforceProfiles}
        />
      );
    }

    if (activePage === "calendar") {
      return <CalendarPage holidayRequests={holidayRequests} currentUser={activeUser} staffList={safeWorkforceProfiles} />;
    }

    if (activePage === "inbox") {
      return <InboxPage holidayRequests={holidayRequests} currentUser={activeUser} staffList={safeWorkforceProfiles} />;
    }

    if (activePage === "compliance") {
      return <CompliancePage currentUser={activeUser} staffList={safeWorkforceProfiles} />;
    }
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

    return (
      <DashboardPage
        holidayRequests={holidayRequests}
        currentUser={activeUser}
        staffList={safeWorkforceProfiles}
      />
    );
  }

  function renderActivePage() {
    if (activeModule.enabled === false && activePage !== "dashboard") {
      return (
        <DisabledModulePage
          module={activeModule}
          activeUser={activeUser}
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
          users={appUsers}
          activeUser={activeUser}
          onUserChange={setActiveUserId}
        />

        <PrototypeBanner
          activeModule={activeModule}
          activeModuleSetting={activeModuleSetting}
          activeUser={activeUser}
        />

        <AppStatusStrip metrics={appShellMetrics} activeUser={activeUser} />

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
