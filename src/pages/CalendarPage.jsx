import {
  AlertTriangle,
  CalendarDays,
  Clock,
  DoorOpen,
  UserCog,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";

import { calendarRows } from "../data/calendar";
import { staff } from "../data/staff";

function getDayNameFromDate(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-GB", { weekday: "long" });
}

export function CalendarPage({ holidayRequests }) {
  const approvedHolidayRequests = holidayRequests.filter(
    (request) => request.status === "Approved"
  );

  const pendingHolidayRequests = holidayRequests.filter(
    (request) => request.status === "Pending"
  );

  const weeklyAbsences = approvedHolidayRequests.map((request) => {
    const staffMember = staff.find((person) => person.name === request.staffName);

    return {
      ...request,
      day: getDayNameFromDate(request.date),
      role: staffMember?.role || "Unknown role",
      team: staffMember?.team || "Unknown team",
    };
  });

  const calendarWithAbsence = calendarRows.map((row) => {
    const absencesForDay = weeklyAbsences.filter(
      (absence) => absence.day === row.day
    );

    const absentNames = absencesForDay.map((absence) => absence.staffName);

    const issueList = [];

    if (row.issue !== "None") {
      issueList.push(row.issue);
    }

    if (absentNames.includes(row.dutyDoctor)) {
      issueList.push("Duty doctor absent");
    }

    if (absentNames.includes(row.nurse)) {
      issueList.push("Nurse absent");
    }

    if (absentNames.includes(row.reception)) {
      issueList.push("Reception cover absent");
    }

    if (absentNames.includes(row.dispenser)) {
      issueList.push("Dispensary cover absent");
    }

    return {
      ...row,
      absences:
        absencesForDay.length > 0
          ? absencesForDay.map((absence) => absence.staffName).join(", ")
          : "None",
      issue: issueList.length > 0 ? issueList.join(", ") : "None",
    };
  });

  const rowsWithIssues = calendarWithAbsence.filter(
    (row) => row.issue !== "None"
  ).length;

  const clinicalCoverWarnings = calendarWithAbsence.filter((row) =>
    row.issue.toLowerCase().includes("doctor")
  ).length;

  return (
    <>
      <SectionHeader eyebrow="Calendar / Workforce" title="Workforce calendar">
        Approved holiday requests from the Staff module now appear here as
        absences and can create rota warnings.
      </SectionHeader>

      <section className="metric-grid">
        <MetricCard
          title="Missing shifts"
          value={rowsWithIssues}
          detail="Calendar rows with warnings"
          icon={CalendarDays}
        />
        <MetricCard
          title="Approved absences"
          value={approvedHolidayRequests.length}
          detail="Visible in this calendar"
          icon={Clock}
        />
        <MetricCard
          title="Pending leave"
          value={pendingHolidayRequests.length}
          detail="Awaiting management approval"
          icon={UserCog}
        />
        <MetricCard
          title="Clinical warnings"
          value={clinicalCoverWarnings}
          detail="Doctor cover affected"
          icon={AlertTriangle}
        />
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
          <SectionHeader eyebrow="This week" title="Rota with absences">
            Approved leave is checked against duty doctor, nurse, reception and
            dispensary cover.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "day", label: "Day" },
              { key: "dutyDoctor", label: "Duty doctor" },
              { key: "nurse", label: "Nurse" },
              { key: "reception", label: "Reception" },
              { key: "dispenser", label: "Dispensary" },
              { key: "absences", label: "Approved absences" },
              { key: "rooms", label: "Rooms" },
              { key: "issue", label: "Issue" },
            ]}
            rows={calendarWithAbsence}
            renderCell={(row, key) => {
              if (key === "day") return <strong>{row.day}</strong>;

              if (key === "issue") {
                return <Badge>{row.issue}</Badge>;
              }

              if (key === "absences") {
                return <Badge>{row.absences}</Badge>;
              }

              if (
                row[key] === "Unfilled" ||
                row[key] === "Locum needed" ||
                row.issue.includes(`${row[key]} absent`)
              ) {
                return <Badge>{row[key]}</Badge>;
              }

              return row[key];
            }}
          />
        </div>

        <aside className="panel">
          <SectionHeader eyebrow="Absence summary" title="Approved leave">
            These are pulled directly from the Staff holiday approval queue.
          </SectionHeader>

          <div className="absence-list">
            {weeklyAbsences.length === 0 ? (
              <div className="absence-item">
                <strong>No approved absences</strong>
                <span>Approve a holiday request in Staff to see it here.</span>
              </div>
            ) : (
              weeklyAbsences.map((absence) => (
                <div className="absence-item" key={absence.id}>
                  <strong>{absence.staffName}</strong>
                  <span>
                    {absence.day} · {absence.date} · {absence.hours} hrs
                  </span>
                  <span>
                    {absence.role} · {absence.team}
                  </span>
                  <Badge>{absence.reason}</Badge>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Pending leave" title="Requests awaiting approval">
          These do not affect the rota until approved by management.
        </SectionHeader>

        <DataTable
          columns={[
            { key: "staffName", label: "Staff member" },
            { key: "date", label: "Date" },
            { key: "hours", label: "Hours" },
            { key: "reason", label: "Reason" },
            { key: "status", label: "Status" },
          ]}
          rows={pendingHolidayRequests}
          renderCell={(row, key) => {
            if (key === "staffName") return <strong>{row.staffName}</strong>;
            if (key === "status") return <Badge>{row.status}</Badge>;
            return row[key];
          }}
        />
      </section>
    </>
  );
}