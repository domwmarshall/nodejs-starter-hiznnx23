import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Landmark,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";
import { formatDate } from "../utils/dateUtils";

import { staff as baseStaff } from "../data/staff";
import { PRACTICE_ROOMS } from "../data/workforce";

import {
  createHolidayRequest,
  getHolidayRequestMetrics,
  getRequestsForStaff,
  getSelectedStaffProfile,
  getStaffDisplayName,
  getStaffRole,
} from "../services/staffService";

import {
  assessLeaveRequestCover,
  getCoverMetrics,
  getLeaveRequestsWithCoverRisk,
} from "../services/coverService";

import {
  createContractAmendment,
  enrichWorkforceProfiles,
  getRoomScheduleForDate,
  getWorkforceAlerts,
  getWorkforceFinancialSummary,
} from "../services/workforceService";

import {
  AlertBanner,
  Button,
  FormField,
  PageHeader,
  Panel,
  fieldClassName,
} from "../components/ui";

function CoverWarningList({ warnings }) {
  if (!warnings || warnings.length === 0) {
    return <span className="muted-text">No minimum-cover warnings.</span>;
  }

  return (
    <div className="cover-warning-list">
      {warnings.map((warning) => (
        <div key={`${warning.teamId}-${warning.message}`}>
          <strong>{warning.team}</strong>
          <span>{warning.message}</span>
        </div>
      ))}
    </div>
  );
}

export function StaffPage({
  holidayRequests = [],
  addHolidayRequest,
  updateHolidayRequestStatus,
  staffList = baseStaff,
  addContractAmendment,
  resetWorkforceProfiles,
}) {
  const [selectedStaffName, setSelectedStaffName] = useState(
    getStaffDisplayName(staffList[0] || baseStaff[0])
  );

  const [newRequestStaffName, setNewRequestStaffName] = useState(
    getStaffDisplayName(staffList[0] || baseStaff[0])
  );
  const [newRequestDate, setNewRequestDate] = useState("2026-07-15");
  const [newRequestHours, setNewRequestHours] = useState(7.5);
  const [newRequestReason, setNewRequestReason] = useState("Annual leave");

  const [amendmentDate, setAmendmentDate] = useState("2026-08-01");
  const [amendmentSummary, setAmendmentSummary] = useState("Change working pattern / budget allocation");
  const [amendmentWeeklyHours, setAmendmentWeeklyHours] = useState("");
  const [amendmentBudget, setAmendmentBudget] = useState("Practice");
  const [amendmentPayType, setAmendmentPayType] = useState("Hourly");
  const [amendmentHourlyRate, setAmendmentHourlyRate] = useState("");
  const [amendmentAnnualSalary, setAmendmentAnnualSalary] = useState("");
  const [amendmentPrimaryRoom, setAmendmentPrimaryRoom] = useState("Nurse room 1");
  const [amendmentSecondaryRoom, setAmendmentSecondaryRoom] = useState("Clinical room 3");

  const workforceRows = useMemo(
    () => enrichWorkforceProfiles(staffList, holidayRequests),
    [staffList, holidayRequests]
  );

  const selectedStaff = useMemo(
    () => getSelectedStaffProfile(workforceRows, selectedStaffName),
    [workforceRows, selectedStaffName]
  );

  const selectedStaffRequests = useMemo(
    () => getRequestsForStaff(holidayRequests, selectedStaffName),
    [holidayRequests, selectedStaffName]
  );

  const metrics = useMemo(
    () => getHolidayRequestMetrics(holidayRequests),
    [holidayRequests]
  );

  const coverMetrics = useMemo(
    () => getCoverMetrics({ requests: holidayRequests, staffList }),
    [holidayRequests, staffList]
  );

  const leaveRequestsWithCoverRisk = useMemo(
    () =>
      getLeaveRequestsWithCoverRisk({
        requests: holidayRequests,
        staffList,
      }),
    [holidayRequests, staffList]
  );

  const financialSummary = useMemo(
    () => getWorkforceFinancialSummary(staffList),
    [staffList]
  );

  const workforceAlerts = useMemo(
    () =>
      getWorkforceAlerts({
        profiles: staffList,
        requests: holidayRequests,
        dates: [newRequestDate, "2026-07-08", "2026-07-09"],
      }),
    [staffList, holidayRequests, newRequestDate]
  );

  const newRequestCoverPreview = useMemo(
    () =>
      assessLeaveRequestCover({
        request: {
          id: "new-request-preview",
          staffName: newRequestStaffName,
          date: newRequestDate,
          hours: Number(newRequestHours || 0),
          reason: newRequestReason,
          status: "Pending",
        },
        staffList,
        requests: holidayRequests,
      }),
    [newRequestStaffName, newRequestDate, newRequestHours, newRequestReason, holidayRequests, staffList]
  );

  const roomSchedulePreview = useMemo(
    () =>
      getRoomScheduleForDate({
        profiles: staffList,
        requests: holidayRequests,
        date: newRequestDate,
      }),
    [staffList, holidayRequests, newRequestDate]
  );

  const selectedProgress = selectedStaff.entitlement?.bookableHours > 0
    ? Math.min((selectedStaff.approvedHours / selectedStaff.entitlement.bookableHours) * 100, 100)
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

  function submitContractAmendment(event) {
    event.preventDefault();

    if (typeof addContractAmendment !== "function") {
      alert("Contract amendments are not connected yet.");
      return;
    }

    addContractAmendment(
      selectedStaff.name,
      createContractAmendment({
        effectiveDate: amendmentDate,
        summary: amendmentSummary,
        weeklyHours: amendmentWeeklyHours,
        budget: amendmentBudget,
        payType: amendmentPayType,
        hourlyRate: amendmentHourlyRate,
        annualSalary: amendmentAnnualSalary,
        primaryRoom: amendmentPrimaryRoom,
        secondaryRoom: amendmentSecondaryRoom,
      })
    );
  }

  return (
    <>
      <PageHeader eyebrow="Workforce" title="Staff, leave, contracts and rooms">
        Workforce v2.2 now calculates holiday entitlement from working patterns,
        bank-holiday impact, contract amendments, budget allocation, pay model,
        room preferences and leave cover risk.
      </PageHeader>

      <section className="metric-grid">
        <MetricCard
          title="Staff profiles"
          value={workforceRows.length}
          detail="Workforce profiles active"
          icon={Users}
        />
        <MetricCard
          title="Pending leave"
          value={metrics.pendingRequests.length}
          detail={`${metrics.totalPendingHours} pending hours`}
          icon={Clock}
        />
        <MetricCard
          title="Monthly wage cost"
          value={`£${financialSummary.totalMonthlyCost.toLocaleString("en-GB")}`}
          detail={`£${financialSummary.arrsClaimableMonthly.toLocaleString("en-GB")} ARRS claimable`}
          icon={Landmark}
        />
        <MetricCard
          title="Cover risks"
          value={coverMetrics.riskyPendingRequests.length + coverMetrics.riskyApprovedRequests.length}
          detail={`${workforceAlerts.roomConflicts.length} room conflict(s)`}
          icon={AlertTriangle}
        />
      </section>

      {workforceAlerts.unpaidPendingLeave.length > 0 ? (
        <AlertBanner tone="danger" title="Leave request exceeds calculated balance" icon={AlertTriangle}>
          {workforceAlerts.unpaidPendingLeave.length} staff member(s) have pending leave
          that would exceed their calculated remaining bookable holiday balance.
        </AlertBanner>
      ) : null}

      {coverMetrics.riskyPendingRequests.length > 0 ? (
        <AlertBanner tone="warning" title="Pending leave may affect minimum cover" icon={CalendarDays}>
          {coverMetrics.riskyPendingRequests.length} pending leave request
          {coverMetrics.riskyPendingRequests.length === 1 ? " has" : "s have"}{" "}
          medium/high cover warnings. Check the cover impact before approving.
        </AlertBanner>
      ) : null}

      <section className="content-grid">
        <Panel className="panel panel-large">
          <SectionHeader eyebrow="Workforce list" title="Staff contracts and leave balances">
            This table is now driven by workforce profiles rather than simple static
            staff cards.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "name", label: "Staff member" },
              { key: "role", label: "Role" },
              { key: "patternLabel", label: "Working pattern" },
              { key: "contractedHours", label: "Weekly hours" },
              { key: "bookable", label: "Bookable leave" },
              { key: "approvedHours", label: "Approved" },
              { key: "remainingHours", label: "Remaining" },
              { key: "monthlyCost", label: "Monthly cost" },
              { key: "budget", label: "Budget" },
            ]}
            rows={workforceRows}
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

              if (key === "role" || key === "budget") return <Badge>{row[key]}</Badge>;
              if (key === "contractedHours") return `${row.contractedHours} hrs`;
              if (key === "bookable") return `${row.entitlement.bookableHours} hrs`;
              if (key === "approvedHours" || key === "remainingHours") return `${row[key]} hrs`;
              if (key === "monthlyCost") return `£${row.monthlyCost.toLocaleString("en-GB")}`;
              return row[key];
            }}
          />
        </Panel>

        <Panel as="aside" className="panel staff-detail-panel">
          <SectionHeader eyebrow="Selected staff" title={getStaffDisplayName(selectedStaff)}>
            Current working pattern, holiday calculation and payroll/budget details.
          </SectionHeader>

          <div className="profile-card">
            <div>
              <span>Role</span>
              <strong>{getStaffRole(selectedStaff)}</strong>
            </div>
            <div>
              <span>Weekly hours</span>
              <strong>{selectedStaff.contractedHours} hrs/week</strong>
            </div>
            <div>
              <span>Total entitlement</span>
              <strong>{selectedStaff.entitlement.totalEntitlementHours} hrs</strong>
            </div>
            <div>
              <span>Bank holiday reserve</span>
              <strong>{selectedStaff.entitlement.bankHolidayHours} hrs</strong>
            </div>
            <div>
              <span>Bookable leave</span>
              <strong>{selectedStaff.entitlement.bookableHours} hrs</strong>
            </div>
            <div>
              <span>Remaining</span>
              <strong>{selectedStaff.remainingHours} hrs</strong>
            </div>
            <div>
              <span>Pay model</span>
              <strong>{selectedStaff.payType}</strong>
            </div>
            <div>
              <span>Monthly cost</span>
              <strong>£{selectedStaff.monthlyCost.toLocaleString("en-GB")}</strong>
            </div>
            <div>
              <span>Rooms</span>
              <strong>{selectedStaff.primaryRoom} / {selectedStaff.secondaryRoom}</strong>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-label">
              <span>Bookable leave used</span>
              <strong>{Math.round(selectedProgress)}%</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill progress-fill-green" style={{ width: `${selectedProgress}%` }} />
            </div>
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel panel-large">
          <SectionHeader eyebrow="Leave requests" title="Request queue with cover and balance impact">
            Approve, reject or reopen leave requests. Each request is checked
            against remaining balance and minimum cover.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "staffName", label: "Staff member" },
              { key: "date", label: "Date" },
              { key: "hours", label: "Hours" },
              { key: "reason", label: "Reason" },
              { key: "coverRisk", label: "Cover impact" },
              { key: "status", label: "Status" },
              { key: "actions", label: "Actions" },
            ]}
            rows={leaveRequestsWithCoverRisk}
            emptyTitle="No leave requests"
            emptyMessage="Create a leave request using the form on this page."
            renderCell={(row, key) => {
              if (key === "staffName") return <strong>{row.staffName}</strong>;
              if (key === "date") return formatDate(row.date);
              if (key === "hours") return `${row.hours} hrs`;
              if (key === "status") return <Badge>{row.status}</Badge>;
              if (key === "coverRisk") {
                return (
                  <div className="stacked-cell">
                    <Badge>{row.coverRisk}</Badge>
                    <span>
                      {row.coverWarnings.length > 0
                        ? row.coverWarnings.map((warning) => warning.team).join(", ")
                        : "Minimum cover maintained"}
                    </span>
                  </div>
                );
              }

              if (key === "actions") {
                return (
                  <div className="action-buttons">
                    <Button
                      type="button"
                      size="sm"
                      variant={row.coverAssessment.riskScore >= 3 ? "danger" : "primary"}
                      onClick={() => updateHolidayRequestStatus(row.id, "Approved")}
                    >
                      Approve
                    </Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => updateHolidayRequestStatus(row.id, "Rejected")}>
                      Reject
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => updateHolidayRequestStatus(row.id, "Pending")}>
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
            Create a leave request with live cover, room and balance preview.
          </SectionHeader>

          <form className="holiday-request-form" onSubmit={submitHolidayRequest}>
            <h3><UserPlus size={20} /> New leave request</h3>

            <div className="form-grid">
              <FormField label="Staff member">
                <select className={fieldClassName} value={newRequestStaffName} onChange={(event) => setNewRequestStaffName(event.target.value)}>
                  {workforceRows.map((person) => <option key={person.name}>{person.name}</option>)}
                </select>
              </FormField>

              <FormField label="Date">
                <input className={fieldClassName} type="date" value={newRequestDate} onChange={(event) => setNewRequestDate(event.target.value)} />
              </FormField>

              <FormField label="Hours">
                <input className={fieldClassName} type="number" min="0" step="0.5" value={newRequestHours} onChange={(event) => setNewRequestHours(event.target.value)} />
              </FormField>

              <FormField label="Reason">
                <select className={fieldClassName} value={newRequestReason} onChange={(event) => setNewRequestReason(event.target.value)}>
                  <option>Annual leave</option>
                  <option>Medical appointment</option>
                  <option>Unpaid leave</option>
                  <option>Training</option>
                  <option>Other</option>
                </select>
              </FormField>
            </div>

            <div className="cover-preview-card">
              <div><ShieldCheck size={20} /><strong>Operational preview</strong></div>
              <Badge>{newRequestCoverPreview.riskLabel}</Badge>
              <p>{formatDate(newRequestDate)} · {newRequestCoverPreview.day} · {newRequestCoverPreview.availableStaff.length} staff available after this request.</p>
              <CoverWarningList warnings={newRequestCoverPreview.warnings} />
              {roomSchedulePreview.conflicts.length > 0 ? (
                <div className="cover-warning-list">
                  {roomSchedulePreview.conflicts.map((conflict) => (
                    <div key={conflict.staffName}>
                      <strong>Room conflict</strong>
                      <span>{conflict.message}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <Button type="submit" variant="primary">Add leave request</Button>
          </form>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Contract amendments" title="Selected staff HR timeline">
            Add a contract amendment and the workforce profile recalculates hours,
            payroll, holiday and room preferences in localStorage.
          </SectionHeader>

          <form className="audit-submit-form" onSubmit={submitContractAmendment}>
            <FormField label="Effective date">
              <input className={fieldClassName} type="date" value={amendmentDate} onChange={(event) => setAmendmentDate(event.target.value)} />
            </FormField>

            <FormField label="Summary">
              <input className={fieldClassName} value={amendmentSummary} onChange={(event) => setAmendmentSummary(event.target.value)} />
            </FormField>

            <div className="form-grid">
              <FormField label="Weekly hours">
                <input className={fieldClassName} type="number" step="0.5" placeholder={`${selectedStaff.contractedHours}`} value={amendmentWeeklyHours} onChange={(event) => setAmendmentWeeklyHours(event.target.value)} />
              </FormField>

              <FormField label="Budget">
                <select className={fieldClassName} value={amendmentBudget} onChange={(event) => setAmendmentBudget(event.target.value)}>
                  <option>Practice</option>
                  <option>Dispensary</option>
                  <option>ARRS</option>
                  <option>PCN</option>
                </select>
              </FormField>

              <FormField label="Pay type">
                <select className={fieldClassName} value={amendmentPayType} onChange={(event) => setAmendmentPayType(event.target.value)}>
                  <option>Hourly</option>
                  <option>Salary</option>
                  <option>Daily</option>
                </select>
              </FormField>

              <FormField label="Hourly rate">
                <input className={fieldClassName} type="number" step="0.1" value={amendmentHourlyRate} onChange={(event) => setAmendmentHourlyRate(event.target.value)} />
              </FormField>

              <FormField label="Annual salary">
                <input className={fieldClassName} type="number" step="100" value={amendmentAnnualSalary} onChange={(event) => setAmendmentAnnualSalary(event.target.value)} />
              </FormField>

              <FormField label="Primary room">
                <select className={fieldClassName} value={amendmentPrimaryRoom} onChange={(event) => setAmendmentPrimaryRoom(event.target.value)}>
                  {PRACTICE_ROOMS.map((room) => <option key={room.id}>{room.name}</option>)}
                </select>
              </FormField>

              <FormField label="Secondary room">
                <select className={fieldClassName} value={amendmentSecondaryRoom} onChange={(event) => setAmendmentSecondaryRoom(event.target.value)}>
                  {PRACTICE_ROOMS.map((room) => <option key={room.id}>{room.name}</option>)}
                </select>
              </FormField>
            </div>

            <div className="policy-actions">
              <Button type="submit" variant="primary">Apply amendment</Button>
              <Button type="button" variant="secondary" onClick={resetWorkforceProfiles}>Reset workforce demo</Button>
            </div>
          </form>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Amendment history" title="Contract timeline">
            Contract history for the selected staff member.
          </SectionHeader>

          <div className="governance-alert-grid">
            {(selectedStaff.contractAmendments || []).map((amendment) => (
              <div className="governance-alert" key={amendment.id}>
                <div>
                  <strong>{formatDate(amendment.effectiveDate)}</strong>
                  <span>{amendment.summary} · {amendment.weeklyHours} hrs · {amendment.budget}</span>
                </div>
                <Badge>Contract</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Rooms" title={`Room allocation preview · ${formatDate(newRequestDate)}`}>
            Primary and secondary rooms are allocated by clinical priority, with
            blocked rooms and approved leave removed.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "staffName", label: "Staff" },
              { key: "role", label: "Role" },
              { key: "room", label: "Room" },
              { key: "status", label: "Status" },
            ]}
            rows={roomSchedulePreview.assignments}
            emptyTitle="No room assignments"
            emptyMessage="No staff are scheduled for this date or all are on approved leave."
            renderCell={(row, key) => {
              if (key === "staffName") return <strong>{row.staffName}</strong>;
              if (key === "role" || key === "status") return <Badge>{row[key]}</Badge>;
              return row[key];
            }}
          />
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Workforce exceptions" title="Items needing management review">
            Low leave balances, leave over balance and room conflicts.
          </SectionHeader>

          <div className="governance-alert-grid">
            {[...workforceAlerts.lowLeaveBalances, ...workforceAlerts.unpaidPendingLeave].slice(0, 8).map((profile) => (
              <div className="governance-alert" key={`leave-balance-${profile.name}`}>
                <div>
                  <strong>{profile.name}</strong>
                  <span>{profile.remainingHours} hrs remaining · {profile.pendingHours} hrs pending</span>
                </div>
                <Badge>Leave balance</Badge>
              </div>
            ))}

            {workforceAlerts.roomConflicts.slice(0, 6).map((conflict) => (
              <div className="governance-alert" key={`room-${conflict.date}-${conflict.staffName}`}>
                <div>
                  <strong>{conflict.staffName}</strong>
                  <span>{conflict.formattedDate} · {conflict.message}</span>
                </div>
                <Badge>Room conflict</Badge>
              </div>
            ))}
          </div>
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
