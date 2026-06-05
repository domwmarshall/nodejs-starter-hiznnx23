import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ToggleRight,
  Bell,
  Users,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";

import { modules } from "../data/modules";
import { staff } from "../data/staff";
import { notifications } from "../data/notifications";
import { calendarRows } from "../data/calendar";

export function DashboardPage() {
  const overdueTraining = staff.filter((person) => person.training === "Overdue").length;
  const highPriorityAlerts = notifications.filter((item) => item.priority === "High").length;
  const missingShifts = calendarRows.filter((row) => row.issue !== "None").length;

  return (
    <>
      <section className="hero-card">
        <div>
          <p className="eyebrow">General Practice Operations Portal</p>
          <h1>GPOP Dashboard</h1>
          <p>
            A slick, role-based operations portal for GP practices. This prototype uses
            mock data only and is designed as a companion layer to SystmOne.
          </p>
        </div>

        <div className="hero-warning">
          <AlertTriangle size={22} />
          <div>
            <strong>Prototype only</strong>
            <p>No patient-identifiable data. Not connected to SystmOne.</p>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard title="Active modules" value={modules.length} detail="Core modules in prototype" icon={ToggleRight} />
        <MetricCard title="Staff records" value={staff.length} detail="Mock staff profiles configured" icon={Users} />
        <MetricCard title="Training overdue" value={overdueTraining} detail="Role-based training needs attention" icon={GraduationCap} />
        <MetricCard title="High priority alerts" value={highPriorityAlerts} detail="Inbox items requiring urgent review" icon={Bell} />
        <MetricCard title="Missing rota cover" value={missingShifts} detail="Calendar issues found this week" icon={CalendarDays} />
        <MetricCard title="Policy acknowledgements" value="86%" detail="Average mock staff completion" icon={ShieldCheck} />
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
          <SectionHeader eyebrow="Foundation" title="Core modules">
            The first version focuses on the platform foundation before higher-risk clinical tools.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "name", label: "Module" },
              { key: "summary", label: "Description" },
              { key: "status", label: "Status" },
              { key: "risk", label: "Risk" },
            ]}
            rows={modules}
            renderCell={(row, key) => {
              if (key === "name") return <strong>{row.name}</strong>;
              if (key === "status") return <Badge>{row.status}</Badge>;
              if (key === "risk") return <Badge>{row.risk} risk</Badge>;
              return row[key];
            }}
          />
        </div>

        <aside className="panel">
          <SectionHeader eyebrow="Build phase" title="Phase 1">
            Platform foundation.
          </SectionHeader>

          <div className="blue-box">
            <strong>Current target</strong>
            <p>
              Build dashboard, staff profiles, calendar, inbox, compliance and settings before database work.
            </p>
          </div>

          <div className="todo-list">
            <div><CheckCircle2 size={18} /> App shell working</div>
            <div><Clock size={18} /> Staff detail pages next</div>
            <div><Clock size={18} /> Holiday calculator next</div>
            <div><Clock size={18} /> Calendar drag-and-drop later</div>
          </div>
        </aside>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Inbox" title="Priority notifications">
          Important reminders and operational alerts.
        </SectionHeader>

        <div className="notification-list">
          {notifications.map((item) => (
            <div className="notification-item" key={item.title}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.type} · {item.due}</p>
              </div>
              <Badge>{item.priority}</Badge>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}