import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  UserPlus,
  Users,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";
import { formatDate } from "../utils/dateUtils";

import { staff } from "../data/staff";

import {
  createHolidayRequest,
  getHolidayRequestMetrics,
  getRequestsForStaff,
  getSelectedStaffProfile,
  getStaffDisplayName,
  getStaffEntitlement,
  getStaffHours,
  getStaffRole,
  getStaffSummaryRows,
} from "../services/staffService";

import {
  AlertBanner,
  Button,
  FormField,
  PageHeader,
  Panel,
  fieldClassName,
} from "../components/ui";

export function StaffPage({
  holidayRequests = [],
  addHolidayRequest,
  updateHolidayRequestStatus,
}) {
  const [selectedStaffName, setSelectedStaffName] = useState(
    getStaffDisplayName(staff[0])
  );

  const [newRequestStaffName, setNewRequestStaffName] = useState(
    getStaffDisplayName(staff[0])
  );
  const [newRequestDate, setNewRequestDate] = useState("2026-07-15");
  const [newRequestHours, setNewRequestHours] = useState(7.5);
  const [newRequestReason, setNewRequestReason] = useState("Annual leave");

  const selectedStaff = useMemo(
    () => getSelectedStaffProfile(staff, selectedStaffName),
    [selectedStaffName]
  );

  const selectedStaffRequests = useMemo(
    () => getRequestsForStaff(holidayRequests, selectedStaffName),
    [holidayRequests, selectedStaffName]
  );

  const staffSummaryRows = useMemo(
    () => getStaffSummaryRows(staff, holidayRequests),
    [holidayRequests]
  );

  const metrics = useMemo(
    () => getHolidayRequestMetrics(holidayRequests),
    [holidayRequests]
  );

  const selectedStaffEntitlement = getStaffEntitlement(selectedStaff);

  const selectedApprovedHours = selectedStaffRequests
    .filter((request) => request.status === "Approved")
    .reduce((total, request) => total + Number(request.hours || 0), 0);

  const selectedPendingHours = selectedStaffRequests
    .filter((request) => request.status === "Pending")
    .reduce((total, request) => total + Number(request.hours || 0), 0);

  const selectedRemainingHours = Math.max(
    selectedStaffEntitlement - selectedApprovedHours,
    0
  );

  const selectedProgress =
    selectedStaffEntitlement > 0
      ? Math.min((selectedApprovedHours / selectedStaffEntitlement) * 100, 100)
      : 0;

  function submitHolidayRequest(event) {
    event.preventDefault();

    if (!newRequestStaffName || !newRequestDate || !newRequestHours) {
      alert("Please complete staff member, date and hours.");
      return;
    }

    const newRequest = createHolidayRequest({
      staffName: newRequestStaffName,
      date: newRequestDate,
      hours: newRequestHours,
      reason: newRequestReason,
    });

    addHolidayRequest(newRequest);
    setSelectedStaffName(newRequestStaffName);
    setNewRequestReason("Annual leave");
  }

  return (
    <>
      <PageHeader eyebrow="Staff" title="Staff, leave and availability">
        Staff profiles, holiday requests and leave approval workflow. Leave logic
        now runs through the staff service layer.
      </PageHeader>

      <section className="metric-grid">
        <MetricCard
          title="Staff profiles"
          value={staff.length}
          detail="Mock staff records"
          icon={Users}
        />
        <MetricCard
          title="Pending leave"
          value={metrics.pendingRequests.length}
          detail={`${metrics.totalPendingHours} pending hours`}
          icon={Clock}
        />
        <MetricCard
          title="Approved leave"
          value={metrics.approvedRequests.length}
          detail={`${metrics.totalApprovedHours} approved hours`}
          icon={CheckCircle2}
        />
        <MetricCard
          title="Rejected"
          value={metrics.rejectedRequests.length}
          detail="Rejected requests"
          icon={AlertTriangle}
        />
      </section>

      {metrics.pendingRequests.length > 0 ? (
        <AlertBanner
          tone="warning"
          title="Pending leave requests"
          icon={CalendarDays}
        >
          {metrics.pendingRequests.length} leave request
          {metrics.pendingRequests.length === 1 ? " is" : "s are"} awaiting a
          management decision.
        </AlertBanner>
      ) : null}

      <section className="content-grid">
        <Panel className="panel panel-large">
          <SectionHeader eyebrow="Staff list" title="Team overview">
            Select a staff member to view their leave position and requests.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "name", label: "Staff member" },
              { key: "role", label: "Role" },
              { key: "team", label: "Team" },
              { key: "contractedHours", label: "Hours" },
              { key: "entitlementHours", label: "Entitlement" },
              { key: "approvedHours", label: "Approved" },
              { key: "pendingHours", label: "Pending" },
              { key: "remainingHours", label: "Remaining" },
            ]}
            rows={staffSummaryRows}
            renderCell={(row, key) => {
              if (key === "name") {
                return (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-button"
                    style={{ padding: 0, justifyContent: "flex-start" }}
                    onClick={() => setSelectedStaffName(row.name)}
                  >
                    {row.name}
                  </Button>
                );
              }

              if (key === "role" || key === "team") {
                return <Badge>{row[key]}</Badge>;
              }

              if (
                key === "contractedHours" ||
                key === "entitlementHours" ||
                key === "approvedHours" ||
                key === "pendingHours" ||
                key === "remainingHours"
              ) {
                return `${row[key]} hrs`;
              }

              return row[key];
            }}
          />
        </Panel>

        <Panel as="aside" className="panel staff-detail-panel">
          <SectionHeader
            eyebrow="Selected staff"
            title={getStaffDisplayName(selectedStaff)}
          >
            Current mock staff profile and annual leave position.
          </SectionHeader>

          <div className="profile-card">
            <div>
              <span>Role</span>
              <strong>{getStaffRole(selectedStaff)}</strong>
            </div>
            <div>
              <span>Contracted hours</span>
              <strong>{getStaffHours(selectedStaff)} hrs/week</strong>
            </div>
            <div>
              <span>Holiday entitlement</span>
              <strong>{selectedStaffEntitlement} hrs</strong>
            </div>
            <div>
              <span>Approved leave</span>
              <strong>{selectedApprovedHours} hrs</strong>
            </div>
            <div>
              <span>Pending leave</span>
              <strong>{selectedPendingHours} hrs</strong>
            </div>
            <div>
              <span>Remaining</span>
              <strong>{selectedRemainingHours} hrs</strong>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-label">
              <span>Leave used</span>
              <strong>{Math.round(selectedProgress)}%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill progress-fill-green"
                style={{ width: `${selectedProgress}%` }}
              />
            </div>
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Leave requests" title="Request queue">
            Approve, reject or reopen leave requests. These requests persist in
            browser localStorage.
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
            emptyTitle="No leave requests"
            emptyMessage="Create a leave request using the form on this page."
            renderCell={(row, key) => {
              if (key === "staffName") return <strong>{row.staffName}</strong>;
              if (key === "date") return formatDate(row.date);
              if (key === "hours") return `${row.hours} hrs`;
              if (key === "status") return <Badge>{row.status}</Badge>;

              if (key === "actions") {
                return (
                  <div className="action-buttons">
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        updateHolidayRequestStatus(row.id, "Approved")
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        updateHolidayRequestStatus(row.id, "Rejected")
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateHolidayRequestStatus(row.id, "Pending")
                      }
                    >
                      Reopen
                    </Button>
                  </div>
                );
              }

              return row[key];
            }}
          />
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="New request" title="Add leave request">
            Create a mock leave request. This does not check rota safety yet.
          </SectionHeader>

          <form className="holiday-request-form" onSubmit={submitHolidayRequest}>
            <h3>
              <UserPlus size={20} /> New leave request
            </h3>

            <div className="form-grid">
              <FormField label="Staff member">
                <select
                  className={fieldClassName}
                  value={newRequestStaffName}
                  onChange={(event) => setNewRequestStaffName(event.target.value)}
                >
                  {staff.map((person) => (
                    <option key={getStaffDisplayName(person)}>
                      {getStaffDisplayName(person)}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Date">
                <input
                  className={fieldClassName}
                  type="date"
                  value={newRequestDate}
                  onChange={(event) => setNewRequestDate(event.target.value)}
                />
              </FormField>

              <FormField label="Hours">
                <input
                  className={fieldClassName}
                  type="number"
                  min="0"
                  step="0.5"
                  value={newRequestHours}
                  onChange={(event) => setNewRequestHours(event.target.value)}
                />
              </FormField>

              <FormField label="Reason">
                <select
                  className={fieldClassName}
                  value={newRequestReason}
                  onChange={(event) => setNewRequestReason(event.target.value)}
                >
                  <option>Annual leave</option>
                  <option>Medical appointment</option>
                  <option>Unpaid leave</option>
                  <option>Training</option>
                  <option>Other</option>
                </select>
              </FormField>
            </div>

            <p className="request-preview">
              Preview: {newRequestStaffName} · {formatDate(newRequestDate)} ·{" "}
              {newRequestHours} hrs · {newRequestReason}
            </p>

            <Button type="submit" variant="primary">
              Add leave request
            </Button>
          </form>
        </Panel>
      </section>

      <Panel className="panel">
        <SectionHeader eyebrow="Selected staff" title="Leave history">
          Leave records linked to the currently selected staff member.
        </SectionHeader>

        <DataTable
          columns={[
            { key: "date", label: "Date" },
            { key: "hours", label: "Hours" },
            { key: "reason", label: "Reason" },
            { key: "status", label: "Status" },
          ]}
          rows={selectedStaffRequests}
          emptyTitle="No leave history"
          emptyMessage="This staff member has no leave requests recorded yet."
          renderCell={(row, key) => {
            if (key === "date") return formatDate(row.date);
            if (key === "hours") return `${row.hours} hrs`;
            if (key === "status") return <Badge>{row.status}</Badge>;
            return row[key];
          }}
        />
      </Panel>
    </>
  );
}