import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Lock,
  ShieldCheck,
  ToggleRight,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

import {
  practiceSettings,
  moduleSettings,
  rolePermissions,
  productionReadinessItems,
  reminderSettings,
} from "../data/settings";

export function SettingsPage() {
  const [selectedModuleId, setSelectedModuleId] = useState(moduleSettings[0].id);

  const [localModuleSettings, setLocalModuleSettings] = useLocalStorageState(
    "gpop-module-settings",
    moduleSettings
  );

  const selectedModule =
    localModuleSettings.find((module) => module.id === selectedModuleId) ||
    localModuleSettings[0];

  const enabledModules = localModuleSettings.filter((module) => module.enabled);
  const disabledModules = localModuleSettings.filter((module) => !module.enabled);

  const highRiskItems = productionReadinessItems.filter(
    (item) => item.risk === "High"
  );

  function toggleModule(moduleId) {
    setLocalModuleSettings((currentModules) =>
      currentModules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              enabled: !module.enabled,
            }
          : module
      )
    );
  }

  return (
    <>
      <SectionHeader eyebrow="Settings" title="Admin settings">
        Practice configuration, module toggles, permissions, reminder rules and
        production readiness checks. Module toggles now survive refresh using
        localStorage.
      </SectionHeader>

      <section className="metric-grid">
        <MetricCard
          title="Enabled modules"
          value={enabledModules.length}
          detail={`${disabledModules.length} module(s) disabled`}
          icon={ToggleRight}
        />
        <MetricCard
          title="Data mode"
          value="Dummy"
          detail="No patient-identifiable data"
          icon={ShieldCheck}
        />
        <MetricCard
          title="High-risk gaps"
          value={highRiskItems.length}
          detail="Before production use"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Storage"
          value="Local"
          detail="Browser localStorage active"
          icon={Database}
        />
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
          <SectionHeader eyebrow="Practice profile" title="System configuration">
            These values will later be saved in the database and controlled by
            admin users.
          </SectionHeader>

          <div className="settings-profile-grid">
            <div>
              <span>Practice name</span>
              <strong>{practiceSettings.practiceName}</strong>
            </div>
            <div>
              <span>System name</span>
              <strong>{practiceSettings.systemName}</strong>
            </div>
            <div>
              <span>Full name</span>
              <strong>{practiceSettings.systemFullName}</strong>
            </div>
            <div>
              <span>Mode</span>
              <Badge>{practiceSettings.mode}</Badge>
            </div>
            <div>
              <span>Data mode</span>
              <strong>{practiceSettings.dataMode}</strong>
            </div>
            <div>
              <span>Holiday year</span>
              <strong>
                {practiceSettings.holidayYearStart} to{" "}
                {practiceSettings.holidayYearEnd}
              </strong>
            </div>
            <div>
              <span>SystmOne connection</span>
              <Badge>{practiceSettings.systmOneConnection}</Badge>
            </div>
            <div>
              <span>Database</span>
              <Badge>{practiceSettings.databaseStatus}</Badge>
            </div>
          </div>
        </div>

        <aside className="panel">
          <SectionHeader eyebrow="Safety" title="Prototype rules">
            These rules should stay visible until the app has proper security,
            governance and hosting.
          </SectionHeader>

          <div className="danger-banner settings-danger">
            <Lock size={22} />
            <div>
              <strong>No patient-identifiable data</strong>
              <p>
                This prototype must only use dummy data until authentication,
                database security, DPIA, audit logging and governance are ready.
              </p>
            </div>
          </div>

          <div className="settings-mini-list">
            <div>
              <CheckCircle2 size={18} />
              <span>Use mock staff names only</span>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <span>No live SystmOne connection</span>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <span>No patient data in uploads</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
          <SectionHeader eyebrow="Modules" title="Module toggles">
            Turn modules on/off in this mock settings area. Toggles now persist
            after refresh using localStorage.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "name", label: "Module" },
              { key: "description", label: "Description" },
              { key: "dataRisk", label: "Data risk" },
              { key: "governanceStatus", label: "Governance" },
              { key: "enabled", label: "Enabled" },
              { key: "actions", label: "Actions" },
            ]}
            rows={localModuleSettings}
            renderCell={(row, key) => {
              if (key === "name") {
                return (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setSelectedModuleId(row.id)}
                  >
                    {row.name}
                  </button>
                );
              }

              if (key === "dataRisk" || key === "governanceStatus") {
                return <Badge>{row[key]}</Badge>;
              }

              if (key === "enabled") {
                return <Badge>{row.enabled ? "On" : "Off"}</Badge>;
              }

              if (key === "actions") {
                return (
                  <button
                    type="button"
                    className="small-button settings-toggle-button"
                    onClick={() => toggleModule(row.id)}
                  >
                    {row.enabled ? "Disable" : "Enable"}
                  </button>
                );
              }

              return row[key];
            }}
          />
        </div>

        <aside className="panel policy-detail-panel">
          <SectionHeader eyebrow="Selected module" title={selectedModule.name}>
            {selectedModule.description}
          </SectionHeader>

          <div className="policy-detail-grid">
            <div>
              <span>Enabled</span>
              <Badge>{selectedModule.enabled ? "On" : "Off"}</Badge>
            </div>
            <div>
              <span>Data risk</span>
              <Badge>{selectedModule.dataRisk} risk</Badge>
            </div>
            <div>
              <span>Governance status</span>
              <Badge>{selectedModule.governanceStatus}</Badge>
            </div>
          </div>

          <div className="policy-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => toggleModule(selectedModule.id)}
            >
              {selectedModule.enabled ? "Disable module" : "Enable module"}
            </button>
          </div>
        </aside>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Permissions" title="Role permissions matrix">
          This is a mock role-based access model. Later this will control what
          each user can see and do after login.
        </SectionHeader>

        <DataTable
          columns={[
            { key: "role", label: "Role" },
            { key: "dashboard", label: "Dashboard" },
            { key: "staff", label: "Staff" },
            { key: "calendar", label: "Calendar" },
            { key: "compliance", label: "Compliance" },
            { key: "training", label: "Training" },
            { key: "audits", label: "Audits" },
            { key: "finance", label: "Finance" },
            { key: "careNavigation", label: "Care nav" },
            { key: "settings", label: "Settings" },
          ]}
          rows={rolePermissions}
          renderCell={(row, key) => {
            if (key === "role") return <strong>{row.role}</strong>;
            return <Badge>{row[key]}</Badge>;
          }}
        />
      </section>

      <section className="content-grid">
        <div className="panel">
          <SectionHeader eyebrow="Reminders" title="Reminder settings">
            These are planned rules for feeding alerts into the Inbox.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "setting", label: "Setting" },
              { key: "value", label: "Value" },
              { key: "status", label: "Status" },
            ]}
            rows={reminderSettings}
            renderCell={(row, key) => {
              if (key === "setting") return <strong>{row.setting}</strong>;
              if (key === "status") return <Badge>{row.status}</Badge>;
              return row[key];
            }}
          />
        </div>

        <div className="panel">
          <SectionHeader eyebrow="Production" title="Readiness checklist">
            These items must be addressed before the app can be used as a real
            multi-user system.
          </SectionHeader>

          <div className="governance-alert-grid">
            {productionReadinessItems.map((item) => (
              <div className="governance-alert" key={item.area}>
                <div>
                  <strong>{item.area}</strong>
                  <span>
                    {item.status} · {item.note}
                  </span>
                </div>
                <Badge>{item.risk} risk</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Next technical phase" title="Storage plan">
          This is the planned route from prototype to production-quality app.
        </SectionHeader>

        <div className="storage-roadmap">
          <div>
            <strong>1. In-memory state</strong>
            <span>Original prototype. Fast, but reset on refresh.</span>
          </div>
          <div>
            <strong>2. localStorage</strong>
            <span>Current step. Keeps prototype data after refresh.</span>
          </div>
          <div>
            <strong>3. Local database</strong>
            <span>SQLite or equivalent during serious development.</span>
          </div>
          <div>
            <strong>4. Hosted database</strong>
            <span>PostgreSQL/Supabase/Neon/Azure for multi-user app.</span>
          </div>
          <div>
            <strong>5. Production hardening</strong>
            <span>Authentication, permissions, backups, audit logs and testing.</span>
          </div>
        </div>
      </section>
    </>
  );
}