import { useMemo } from "react";
import { CalendarDays, CheckCircle2, Clock, Users } from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";

import {
  getApprovedLeaveForDate,
  getHolidayRequestMetrics,
  getLeaveCalendarRows,
} from "../services/staffService";

const mockWeekDays = [
  {
    label: "Monday",
    date: "2026-07-01",
    requiredCover: "GP, nurse, reception, dispensary",
  },
  {
    label: "Tuesday",
    date: "2026-07-02",
    requiredCover: "GP AM, reception, dispensary",
  },
  {
    label: "Wednesday",
    date: "2026-07-03",
    requiredCover: "GP, HCA, reception, dispensary",
  },
  {
    label: "Thursday",
    date: "2026-07-04",
    requiredCover: "GP, nurse, reception, dispensary",
  },
  {
    label: "Friday",
    date: "2026-07-05",
    requiredCover: "ANP/GP, reception, dispensary",
  },
];

export function CalendarPage({ holidayRequests = [] }) {
  const metrics = useMemo(
    () => getHolidayRequestMetrics(holidayRequests),
    [holidayRequests]
  );

  const leaveCalendarRows = useMemo(
    () => getLeaveCalendarRows(holidayRequests),
    [holidayRequests]
  );

  const weekRows = useMemo(
    () =>
      mockWeekDays.map((day) => {
        const approvedLeave = getApprovedLeaveForDate(holidayRequests, day.date);

        return {
          ...day,
          approvedLeave,
          leaveCount: approvedLeave.length,
          coverStatus:
            approvedLeave.length > 0 ? "Check cover" : "No approved leave",
        };
      }),
    [holidayRequests]
  );

  return (
    <>
      <SectionHeader eyebrow="Calendar" title="Calendar and leave overlay">
        Prototype calendar view showing approved leave against a mock practice
        week. This is not a full rota engine yet.
      </SectionHeader>

      <section className="metric-grid">
        <MetricCard
          title="Approved leave"
          value={metrics.approvedRequests.length}
          detail={`${metrics.totalApprovedHours} approved hours`}
          icon={CheckCircle2}
        />
        <MetricCard
          title="Pending leave"
          value={metrics.pendingRequests.length}
          detail={`${metrics.totalPendingHours} pending hours`}
          icon={Clock}
        />
        <MetricCard
          title="Rejected"
          value={metrics.rejectedRequests.length}
          detail="Rejected requests"
          icon={Users}
        />
        <MetricCard
          title="Calendar mode"
          value="Mock"
          detail="No database-backed rota yet"
          icon={CalendarDays}
        />
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
          <SectionHeader eyebrow="Week view" title="Mock rota week">
            Approved leave is shown against each mock day. Later this needs a
            proper rota model, appointment capacity rules and cover logic.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "label", label: "Day" },
              { key: "date", label: "Date" },
              { key: "requiredCover", label: "Required cover" },
              { key: "approvedLeave", label: "Approved leave" },
              { key: "coverStatus", label: "Cover status" },
            ]}
            rows={weekRows}
            renderCell={(row, key) => {
              if (key === "label") return <strong>{row.label}</strong>;

              if (key === "approvedLeave") {
                if (row.approvedLeave.length === 0) {
                  return <span className="muted-text">None</span>;
                }

                return (
                  <div className="stacked-cell">
                    {row.approvedLeave.map((leave) => (
                      <span key={leave.id}>
                        {leave.staffName} · {leave.hours} hrs
                      </span>
                    ))}
                  </div>
                );
              }

              if (key === "coverStatus") {
                return <Badge>{row.coverStatus}</Badge>;
              }

              return row[key];
            }}
          />
        </div>

        <aside className="panel">
          <SectionHeader eyebrow="Calendar warning" title="Not a rota engine yet">
            This page should stay simple until we build a proper rota and absence
            data model.
          </SectionHeader>

          <div className="danger-banner settings-danger">
            <CalendarDays size={22} />
            <div>
              <strong>Calendar logic is placeholder only</strong>
              <p>
                This does not yet check GP/nurse capacity, duplicate leave,
                appointment slot safety, blood collection times or required
                dispensary cover.
              </p>
            </div>
          </div>

          <div className="settings-mini-list">
            <div>
              <CheckCircle2 size={18} />
              <span>Approved leave overlay works</span>
            </div>
            <div>
              <Clock size={18} />
              <span>Rota rules planned for later</span>
            </div>
            <div>
              <Users size={18} />
              <span>Cover checking not active yet</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Leave list" title="All leave requests">
          This list is shared with the Staff page through the staff service layer.
        </SectionHeader>

        <DataTable
          columns={[
            { key: "formattedDate", label: "Date" },
            { key: "staffName", label: "Staff member" },
            { key: "hours", label: "Hours" },
            { key: "reason", label: "Reason" },
            { key: "status", label: "Status" },
          ]}
          rows={leaveCalendarRows}
          emptyTitle="No leave requests"
          emptyMessage="Add leave requests from the Staff page."
          renderCell={(row, key) => {
            if (key === "staffName") return <strong>{row.staffName}</strong>;
            if (key === "hours") return `${row.hours} hrs`;
            if (key === "status") return <Badge>{row.status}</Badge>;
            return row[key];
          }}
        />
      </section>
    </>
  );
}