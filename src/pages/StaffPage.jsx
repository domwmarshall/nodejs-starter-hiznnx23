import { useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";

import { staff } from "../data/staff";

export function StaffPage({
  holidayRequests,
  addHolidayRequest,
  updateHolidayRequestStatus,
}) {
  const [selectedStaffName, setSelectedStaffName] = useState(staff[0].name);
  const [requestedHours, setRequestedHours] = useState(7.5);
  const [requestDate, setRequestDate] = useState("2026-07-15");
  const [requestReason, setRequestReason] = useState("Annual leave");

  const selectedStaff =
    staff.find((person) => person.name === selectedStaffName) || staff[0];

  const approvedHoursForSelectedStaff = holidayRequests
    .filter(
      (request) =>
        request.staffName === selectedStaff.name && request.status === "Approved"
    )
    .reduce((total, request) => total + Number(request.hours), 0);

  const adjustedHolidayRemaining = Math.max(
    selectedStaff.holidayRemaining - approvedHoursForSelectedStaff,
    0
  );

  const remainingAfterRequest = Math.max(
    adjustedHolidayRemaining - Number(requestedHours || 0),
    0
  );

  const holidayUsed =
    selectedStaff.holidayEntitlement - adjustedHolidayRemaining;

  const holidayUsedPercent = Math.round(
    (holidayUsed / selectedStaff.holidayEntitlement) * 100
  );

  const holidayRemainingPercent = Math.round(
    (adjustedHolidayRemaining / selectedStaff.holidayEntitlement) * 100
  );

  const pendingRequests = holidayRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedRequests = holidayRequests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedRequests = holidayRequests.filter(
    (request) => request.status === "Rejected"
  ).length;

  function submitHolidayRequest(event) {
    event.preventDefault();

    if (!requestDate || Number(requestedHours) <= 0) {
      alert("Please enter a date and a number of hours above zero.");
      return;
    }

    const newRequest = {
      id: Date.now(),
      staffName: selectedStaff.name,
      date: requestDate,
      hours: Number(requestedHours),
      reason: requestReason || "Annual leave",
      status: "Pending",
    };

    addHolidayRequest(newRequest);
  }

  return (
    <>
      <SectionHeader eyebrow="Staff" title="Staff profiles">
        Staff profiles hold roles, teams, working patterns, holiday balances, pay
        type, budget allocation, room preferences and management-only HR settings.
      </SectionHeader>

      <section className="metric-grid">
        <MetricCard
          title="Staff configured"
          value={staff.length}
          detail="Mock users in current prototype"
          icon={CalendarDays}
        />
        <MetricCard
          title="Pending leave"
          value={pendingRequests}
          detail="Awaiting management decision"
          icon={Clock}
        />
        <MetricCard
          title="Approved leave"
          value={approvedRequests}
          detail="Approved mock requests"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Rejected leave"
          value={rejectedRequests}
          detail="Rejected mock requests"
          icon={AlertTriangle}
        />
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
          <SectionHeader eyebrow="Staff list" title="People">
            Click a staff member to view their role, holiday, room and management
            settings.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "name", label: "Name" },
              { key: "role", label: "Role" },
              { key: "team", label: "Team" },
              { key: "pattern", label: "Pattern" },
              { key: "holiday", label: "Holiday remaining" },
              { key: "payType", label: "Pay type" },
              { key: "budget", label: "Budget" },
              { key: "training", label: "Training" },
            ]}
            rows={staff}
            renderCell={(row, key) => {
              if (key === "name") {
                return (
                  <button
                    className="text-button"
                    onClick={() => setSelectedStaffName(row.name)}
                  >
                    {row.name}
                  </button>
                );
              }

              if (key === "holiday") {
                const approvedHours = holidayRequests
                  .filter(
                    (request) =>
                      request.staffName === row.name &&
                      request.status === "Approved"
                  )
                  .reduce((total, request) => total + Number(request.hours), 0);

                return `${Math.max(row.holidayRemaining - approvedHours, 0)} / ${
                  row.holidayEntitlement
                } hrs`;
              }

              if (key === "training") {
                return <Badge>{row.training}</Badge>;
              }

              return row[key];
            }}
          />
        </div>

        <aside className="panel staff-detail-panel">
          <SectionHeader eyebrow="Selected profile" title={selectedStaff.name}>
            {selectedStaff.role}
          </SectionHeader>

          <div className="profile-card">
            <div>
              <span>Team</span>
              <strong>{selectedStaff.team}</strong>
            </div>
            <div>
              <span>Working pattern</span>
              <strong>{selectedStaff.pattern}</strong>
            </div>
            <div>
              <span>Primary room</span>
              <strong>{selectedStaff.room}</strong>
            </div>
            <div>
              <span>Pay type</span>
              <strong>{selectedStaff.payType}</strong>
            </div>
            <div>
              <span>Budget allocation</span>
              <strong>{selectedStaff.budget}</strong>
            </div>
            <div>
              <span>Training</span>
              <Badge>{selectedStaff.training}</Badge>
            </div>
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
          <SectionHeader eyebrow="Holiday" title="Holiday entitlement calculator">
            Approved requests now reduce the holiday balance and also appear on
            the Calendar page.
          </SectionHeader>

          <div className="holiday-summary-grid">
            <div className="holiday-box">
              <span>Entitlement</span>
              <strong>{selectedStaff.holidayEntitlement} hrs</strong>
            </div>
            <div className="holiday-box">
              <span>Used</span>
              <strong>{holidayUsed} hrs</strong>
            </div>
            <div className="holiday-box">
              <span>Remaining</span>
              <strong>{adjustedHolidayRemaining} hrs</strong>
            </div>
            <div className="holiday-box">
              <span>Remaining after request</span>
              <strong>{remainingAfterRequest} hrs</strong>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-label">
              <span>Holiday used</span>
              <strong>{holidayUsedPercent}%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${holidayUsedPercent}%` }}
              />
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-label">
              <span>Holiday remaining</span>
              <strong>{holidayRemainingPercent}%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill progress-fill-green"
                style={{ width: `${holidayRemainingPercent}%` }}
              />
            </div>
          </div>

          <form className="holiday-request-form" onSubmit={submitHolidayRequest}>
            <h3>Submit mock holiday request</h3>

            <div className="form-grid">
              <label>
                Staff member
                <select
                  value={selectedStaffName}
                  onChange={(event) => setSelectedStaffName(event.target.value)}
                >
                  {staff.map((person) => (
                    <option key={person.name} value={person.name}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Date
                <input
                  type="date"
                  value={requestDate}
                  onChange={(event) => setRequestDate(event.target.value)}
                />
              </label>

              <label>
                Hours requested
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={requestedHours}
                  onChange={(event) => setRequestedHours(event.target.value)}
                />
              </label>

              <label>
                Reason
                <select
                  value={requestReason}
                  onChange={(event) => setRequestReason(event.target.value)}
                >
                  <option>Annual leave</option>
                  <option>Medical appointment</option>
                  <option>Family emergency</option>
                  <option>Unpaid leave</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            <div className="request-preview">
              If approved, <strong>{selectedStaff.name}</strong> would have{" "}
              <strong>{remainingAfterRequest} hours</strong> remaining.
            </div>

            <button className="primary-button" type="submit">
              Submit mock request
            </button>
          </form>
        </div>

        <aside className="panel">
          <SectionHeader eyebrow="Management" title="Contract amendments">
            Future contract changes will recalculate entitlement automatically.
          </SectionHeader>

          <div className="amendment-list">
            <div>
              <strong>Current working pattern</strong>
              <span>{selectedStaff.pattern}</span>
            </div>
            <div>
              <strong>Holiday year</strong>
              <span>1 April to 31 March</span>
            </div>
            <div>
              <strong>Bank holiday handling</strong>
              <span>Planned setting</span>
            </div>
            <div>
              <strong>Mid-year amendments</strong>
              <span>Planned</span>
            </div>
          </div>

          <div className="blue-box">
            <strong>Example future logic</strong>
            <p>
              If a staff member drops a working day mid-year, GPOP will store a
              contract amendment and recalculate entitlement from the effective date.
            </p>
          </div>
        </aside>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Leave requests" title="Management approval queue">
          Approving a request now makes it visible on the Calendar page as staff
          absence.
        </SectionHeader>

        <DataTable
          columns={[
            { key: "staffName", label: "Staff member" },
            { key: "date", label: "Date" },
            { key: "hours", label: "Hours" },
            { key: "reason", label: "Reason" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={holidayRequests}
          renderCell={(row, key) => {
            if (key === "staffName") return <strong>{row.staffName}</strong>;
            if (key === "status") return <Badge>{row.status}</Badge>;

            if (key === "actions") {
              if (row.status !== "Pending") {
                return <span className="muted-text">No action needed</span>;
              }

              return (
                <div className="action-buttons">
                  <button
                    type="button"
                    className="small-button approve-button"
                    onClick={() => updateHolidayRequestStatus(row.id, "Approved")}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    className="small-button reject-button"
                    onClick={() => updateHolidayRequestStatus(row.id, "Rejected")}
                  >
                    Reject
                  </button>
                </div>
              );
            }

            return row[key];
          }}
        />
      </section>
    </>
  );
}