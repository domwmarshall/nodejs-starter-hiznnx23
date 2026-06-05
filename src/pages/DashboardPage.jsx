import { useMemo } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Database,
  FileText,
  GraduationCap,
  PoundSterling,
  Building2,
  ShieldCheck,
  Stethoscope,
  ToggleRight,
  Users,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { daysUntil, formatDate, getDueText, getReviewStatus } from "../utils/dateUtils";

import { staff } from "../data/staff";
import { inboxItems } from "../data/inbox";
import { policies } from "../data/compliance";
import {
  COMPLIANCE_ACKNOWLEDGEMENTS_STORAGE_KEY,
  COMPLIANCE_POLICIES_STORAGE_KEY,
  COMPLIANCE_QUESTIONS_STORAGE_KEY,
  enrichPolicies as enrichCompliancePolicies,
  getDefaultPolicies,
  getDefaultPolicyAcknowledgements,
  getDefaultPolicyQuestions,
  buildPolicyAcknowledgementMatrix,
} from "../services/complianceService";
import { trainingCourses, trainingRecords } from "../data/training";
import { auditTemplates } from "../data/audits";
import { moduleSettings, productionReadinessItems } from "../data/settings";
import { financeTasks, expectedPayments } from "../data/finance";
import { supplierInvoiceLines } from "../data/dispensaryFinance";

import {
  INBOX_STORAGE_KEY,
  enrichInboxItems,
  getInboxMetrics,
} from "../services/inboxService";

import {
  DISPENSARY_INVOICE_LINES_STORAGE_KEY,
  FINANCE_TASKS_STORAGE_KEY,
  formatMoney,
  getDispensaryProfitability,
  getFinanceTaskMetrics,
  getPaymentTotals,
} from "../services/financeService";

import {
  AUDIT_SUBMISSIONS_STORAGE_KEY,
  getAuditMetrics,
  getDefaultAuditSubmissions,
} from "../services/auditService";

import { MODULE_SETTINGS_STORAGE_KEY } from "../services/appShellService";
import { getCoverMetrics } from "../services/coverService";
import { getWorkforceAlerts, getWorkforceFinancialSummary } from "../services/workforceService";
import {
  getAlertsForUser,
  getGeneratedOperationalAlerts,
  getOperationalAlertMetrics,
} from "../services/operationsAlertService";
import { getRoleHomeSummary, getUserAccessSummary } from "../services/userService";

import {
  AlertBanner,
  PageHeader,
  Panel,
} from "../components/ui";

function getCourseName(courseId) {
  const course = trainingCourses.find((item) => item.id === courseId);
  return course?.name || "Unknown course";
}

function getReadinessScore(highRiskGaps, disabledModules, careNavigationEnabled, coverRisks) {
  let score = 100;

  score -= highRiskGaps * 8;
  score -= disabledModules * 4;
  score -= coverRisks * 6;

  if (careNavigationEnabled) {
    score -= 12;
  }

  return Math.max(score, 0);
}

export function DashboardPage({ holidayRequests = [], currentUser, staffList = staff }) {
  const [storedInboxItems] = useLocalStorageState(INBOX_STORAGE_KEY, inboxItems);

  const [storedAuditSubmissions] = useLocalStorageState(
    AUDIT_SUBMISSIONS_STORAGE_KEY,
    getDefaultAuditSubmissions()
  );

  const [storedModuleSettings] = useLocalStorageState(
    MODULE_SETTINGS_STORAGE_KEY,
    moduleSettings
  );

  const [storedFinanceTasks] = useLocalStorageState(
    FINANCE_TASKS_STORAGE_KEY,
    financeTasks
  );

  const [storedInvoiceLines] = useLocalStorageState(
    DISPENSARY_INVOICE_LINES_STORAGE_KEY,
    supplierInvoiceLines
  );

  const [storedPolicies] = useLocalStorageState(
    COMPLIANCE_POLICIES_STORAGE_KEY,
    getDefaultPolicies()
  );

  const [storedPolicyAcknowledgements] = useLocalStorageState(
    COMPLIANCE_ACKNOWLEDGEMENTS_STORAGE_KEY,
    getDefaultPolicyAcknowledgements()
  );

  const [storedPolicyQuestions] = useLocalStorageState(
    COMPLIANCE_QUESTIONS_STORAGE_KEY,
    getDefaultPolicyQuestions()
  );

  const dashboardData = useMemo(() => {
    const safeModuleSettings = Array.isArray(storedModuleSettings)
      ? storedModuleSettings
      : moduleSettings;

    const safeAuditSubmissions = Array.isArray(storedAuditSubmissions)
      ? storedAuditSubmissions
      : getDefaultAuditSubmissions();

    const safeFinanceTasks = Array.isArray(storedFinanceTasks)
      ? storedFinanceTasks
      : financeTasks;

    const safeInvoiceLines = Array.isArray(storedInvoiceLines)
      ? storedInvoiceLines
      : supplierInvoiceLines;

    const safePolicies = Array.isArray(storedPolicies)
      ? storedPolicies
      : policies;

    const safePolicyAcknowledgements = Array.isArray(storedPolicyAcknowledgements)
      ? storedPolicyAcknowledgements
      : getDefaultPolicyAcknowledgements();

    const safePolicyQuestions = Array.isArray(storedPolicyQuestions)
      ? storedPolicyQuestions
      : getDefaultPolicyQuestions();

    const enrichedInbox = enrichInboxItems(storedInboxItems);
    const inboxMetrics = getInboxMetrics(storedInboxItems);

    const policyAcknowledgementMatrix = buildPolicyAcknowledgementMatrix(
      safePolicies,
      safePolicyAcknowledgements,
      staffList
    );

    const enrichedPolicies = enrichCompliancePolicies(
      safePolicies,
      policyAcknowledgementMatrix
    );

    const overduePolicies = enrichedPolicies.filter(
      (policy) => policy.computedStatus === "Overdue"
    );
    const dueSoonPolicies = enrichedPolicies.filter(
      (policy) => policy.computedStatus === "Due soon"
    );

    const overdueTraining = trainingRecords.filter(
      (record) => record.status === "Overdue"
    );
    const dueSoonTraining = trainingRecords.filter(
      (record) => record.status === "Due soon"
    );

    const auditMetrics = getAuditMetrics(auditTemplates, safeAuditSubmissions);

    const overdueAudits = auditMetrics.overdueAudits;
    const dueSoonAudits = auditMetrics.dueSoonAudits;
    const auditActions = auditMetrics.actionRequiredSubmissions;

    const pendingLeave = holidayRequests.filter(
      (request) => request.status === "Pending"
    );
    const approvedLeave = holidayRequests.filter(
      (request) => request.status === "Approved"
    );

    const coverMetrics = getCoverMetrics({
      requests: holidayRequests,
      staffList,
    });

    const workforceFinancialSummary = getWorkforceFinancialSummary(staffList);
    const workforceAlerts = getWorkforceAlerts({
      profiles: staffList,
      requests: holidayRequests,
      dates: coverMetrics.dateSnapshots.map((snapshot) => snapshot.date),
    });

    const enabledModules = safeModuleSettings.filter((module) => module.enabled);
    const disabledModules = safeModuleSettings.filter((module) => !module.enabled);

    const highRiskProductionGaps = productionReadinessItems.filter(
      (item) => item.risk === "High"
    );

    const financeTaskMetrics = getFinanceTaskMetrics(safeFinanceTasks);
    const paymentTotals = getPaymentTotals(expectedPayments);
    const dispensaryProfitability = getDispensaryProfitability({
      invoiceLines: safeInvoiceLines,
    });

    const generatedOperationalAlerts = getGeneratedOperationalAlerts({
      holidayRequests,
      staffList,
      auditSubmissions: safeAuditSubmissions,
      activeFinanceTasks: safeFinanceTasks,
      activeInvoiceLines: safeInvoiceLines,
      activeModuleSettings: safeModuleSettings,
      activePolicies: safePolicies,
      activePolicyAcknowledgements: safePolicyAcknowledgements,
      activePolicyQuestions: safePolicyQuestions,
    });

    const roleOperationalAlerts = getAlertsForUser(
      generatedOperationalAlerts,
      currentUser
    );

    const operationalAlertMetrics = getOperationalAlertMetrics(roleOperationalAlerts);
    const userAccessSummary = getUserAccessSummary(currentUser);

    const careNavigationSetting = safeModuleSettings.find(
      (module) => module.id === "care-navigation"
    );

    const careNavigationEnabled = careNavigationSetting?.enabled === true;

    const readinessScore = getReadinessScore(
      highRiskProductionGaps.length,
      disabledModules.length,
      careNavigationEnabled,
      coverMetrics.riskyPendingRequests.length + coverMetrics.riskyApprovedRequests.length
    );

    const priorityActions = [
      ...roleOperationalAlerts.slice(0, 12).map((alert) => ({
        id: alert.id,
        title: alert.title,
        module: alert.module,
        issue: alert.type,
        owner: alert.assignedTo,
        due: alert.dueDate,
        priority: alert.priority,
      })),
      ...coverMetrics.riskyApprovedRequests.map((request) => ({
        id: `cover-approved-${request.id}`,
        title: `${request.staffName} approved leave`,
        module: "Staff",
        issue: "Cover warning",
        owner: "Practice Manager",
        due: request.date,
        priority: request.coverRisk,
      })),
      ...coverMetrics.riskyPendingRequests.map((request) => ({
        id: `cover-pending-${request.id}`,
        title: `${request.staffName} pending leave`,
        module: "Staff",
        issue: "Check cover before approval",
        owner: "Practice Manager",
        due: request.date,
        priority: request.coverRisk,
      })),
      ...overduePolicies.map((policy) => ({
        id: `policy-${policy.id}`,
        title: policy.name,
        module: "Compliance",
        issue: "Policy overdue",
        owner: policy.owner,
        due: policy.reviewDue,
        priority: policy.risk,
      })),
      ...overdueTraining.map((record) => ({
        id: `training-${record.id}`,
        title: getCourseName(record.courseId),
        module: "Training",
        issue: "Training overdue",
        owner: record.staffName,
        due: record.expiryDate,
        priority: "High",
      })),
      ...overdueAudits.map((audit) => ({
        id: `audit-${audit.id}`,
        title: audit.name,
        module: "Audits",
        issue: "Audit overdue",
        owner: audit.assignedTo,
        due: audit.nextDue,
        priority: audit.risk,
      })),
      ...financeTaskMetrics.overdueTasks.map((task) => ({
        id: `finance-${task.id}`,
        title: task.title,
        module: "Finance",
        issue: "Finance task overdue",
        owner: task.owner,
        due: task.dueDate,
        priority: task.priority,
      })),
      ...pendingLeave.map((request) => ({
        id: `leave-${request.id}`,
        title: `${request.staffName} leave request`,
        module: "Staff",
        issue: "Awaiting approval",
        owner: "Practice Manager",
        due: request.date,
        priority: "Medium",
      })),
    ];

    return {
      enrichedInbox,
      openInboxItems: inboxMetrics.openItems,
      generatedOperationalAlerts,
      roleOperationalAlerts,
      operationalAlertMetrics,
      userAccessSummary,
      highPriorityInboxItems: inboxMetrics.highPriorityItems,
      overdueInboxItems: inboxMetrics.overdueItems,
      enrichedPolicies,
      overduePolicies,
      dueSoonPolicies,
      overdueTraining,
      dueSoonTraining,
      overdueAudits,
      dueSoonAudits,
      auditActions,
      pendingLeave,
      approvedLeave,
      coverMetrics,
      workforceFinancialSummary,
      workforceAlerts,
      enabledModules,
      disabledModules,
      highRiskProductionGaps,
      openFinanceTasks: financeTaskMetrics.openTasks,
      highPriorityFinanceTasks: financeTaskMetrics.highPriorityTasks,
      overdueFinanceTasks: financeTaskMetrics.overdueTasks,
      financeOutstanding: paymentTotals.outstanding,
      dispensaryProfitability,
      careNavigationEnabled,
      readinessScore,
      priorityActions,
      safeModuleSettings,
    };
  }, [
    storedInboxItems,
    storedAuditSubmissions,
    storedModuleSettings,
    storedFinanceTasks,
    storedInvoiceLines,
    storedPolicies,
    storedPolicyAcknowledgements,
    storedPolicyQuestions,
    holidayRequests,
    currentUser,
    staffList,
  ]);

  return (
    <>
      <PageHeader
        eyebrow="General Practice Operations Portal"
        title={`${currentUser.role} Dashboard`}
        action={
          <div className="dashboard-readiness-card">
            <span>System readiness</span>
            <strong>{dashboardData.readinessScore}%</strong>
            <p>Prototype readiness estimate</p>
          </div>
        }
      >
        {getRoleHomeSummary(currentUser)} This is now a role-based operational
        dashboard with generated alerts from workforce, compliance, training,
        audits, finance and governance.
      </PageHeader>

      <section className="metric-grid">
        <MetricCard
          title="Role alerts"
          value={dashboardData.operationalAlertMetrics.openAlerts.length}
          detail={`${dashboardData.operationalAlertMetrics.highPriorityAlerts.length} high priority`}
          icon={Bell}
        />
        <MetricCard
          title="Cover risks"
          value={
            dashboardData.coverMetrics.riskyPendingRequests.length +
            dashboardData.coverMetrics.riskyApprovedRequests.length
          }
          detail={`${dashboardData.coverMetrics.unsafeDates.length} unsafe date(s)`}
          icon={CalendarDays}
        />
        <MetricCard
          title="Wage run-rate"
          value={formatMoney(dashboardData.workforceFinancialSummary.totalMonthlyCost)}
          detail={`${formatMoney(dashboardData.workforceFinancialSummary.arrsClaimableMonthly)} ARRS claimable`}
          icon={Users}
        />
        <MetricCard
          title="Overdue policies"
          value={dashboardData.overduePolicies.length}
          detail={`${dashboardData.dueSoonPolicies.length} due soon`}
          icon={FileText}
        />
        <MetricCard
          title="Overdue training"
          value={dashboardData.overdueTraining.length}
          detail={`${dashboardData.dueSoonTraining.length} due soon`}
          icon={GraduationCap}
        />
        <MetricCard
          title="Audit actions"
          value={dashboardData.auditActions.length}
          detail={`${dashboardData.overdueAudits.length} overdue audits`}
          icon={ClipboardCheck}
        />
        <MetricCard
          title="Finance tasks"
          value={dashboardData.openFinanceTasks.length}
          detail={`${dashboardData.highPriorityFinanceTasks.length} high priority`}
          icon={PoundSterling}
        />
        <MetricCard
          title="Dispensary profit"
          value={formatMoney(dashboardData.dispensaryProfitability.grossProfit)}
          detail={`${dashboardData.dispensaryProfitability.lossRows.length} loss line(s)`}
          icon={Building2}
        />
        <MetricCard
          title="Outstanding"
          value={formatMoney(dashboardData.financeOutstanding)}
          detail="Expected finance not received"
          icon={Clock}
        />
        <MetricCard
          title="Disabled modules"
          value={dashboardData.disabledModules.length}
          detail={`${dashboardData.enabledModules.length} enabled`}
          icon={ToggleRight}
        />
      </section>

      {dashboardData.coverMetrics.riskyApprovedRequests.length > 0 ? (
        <AlertBanner
          tone="danger"
          title="Approved leave is causing cover warnings"
          icon={AlertTriangle}
        >
          {dashboardData.coverMetrics.riskyApprovedRequests.length} approved leave
          request
          {dashboardData.coverMetrics.riskyApprovedRequests.length === 1 ? " is" : "s are"}{" "}
          currently below minimum cover rules. Review Staff or Calendar.
        </AlertBanner>
      ) : null}

      {dashboardData.disabledModules.length > 0 ? (
        <AlertBanner
          tone="warning"
          title="Disabled modules detected"
          icon={AlertTriangle}
        >
          {dashboardData.disabledModules.map((module) => module.name).join(", ")}{" "}
          {dashboardData.disabledModules.length === 1 ? "is" : "are"} currently
          switched off in Settings.
        </AlertBanner>
      ) : null}

      {dashboardData.careNavigationEnabled ? (
        <AlertBanner
          tone="danger"
          title="Care Navigation is enabled but not production-ready"
          icon={Stethoscope}
        >
          The care navigation module is still a shell. It must not be used with
          real patients until clinical safety, pathway approval, information
          governance and audit logging are complete.
        </AlertBanner>
      ) : null}

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Role workspace" title={`${currentUser.name} · ${currentUser.role}`}>
            The app now changes available modules and dashboard context based on
            the selected user role.
          </SectionHeader>

          <div className="role-summary-grid">
            <div>
              <span>Dashboard mode</span>
              <strong>{currentUser.dashboardMode}</strong>
            </div>
            <div>
              <span>Access level</span>
              <strong>{currentUser.accessLevel}</strong>
            </div>
            <div>
              <span>Accessible modules</span>
              <strong>{dashboardData.userAccessSummary.accessibleCount}</strong>
            </div>
            <div>
              <span>Blocked modules</span>
              <strong>{dashboardData.userAccessSummary.noAccessCount}</strong>
            </div>
          </div>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Generated inbox" title="Automated operational alerts">
            These are generated from real module state rather than static demo
            cards.
          </SectionHeader>

          <div className="dashboard-alert-list">
            {dashboardData.roleOperationalAlerts.slice(0, 5).map((alert) => (
              <div className="dashboard-alert-item" key={alert.id}>
                <div>
                  <strong>{alert.title}</strong>
                  <span>
                    {alert.module} · {alert.assignedTo} · {alert.dueText}
                  </span>
                </div>
                <Badge>{alert.priority}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel panel-large">
          <SectionHeader eyebrow="Priority" title="Management action list">
            A combined list of overdue, pending and unsafe-cover items across the
            practice operations portal.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "title", label: "Item" },
              { key: "module", label: "Module" },
              { key: "issue", label: "Issue" },
              { key: "owner", label: "Owner" },
              { key: "due", label: "Due" },
              { key: "priority", label: "Priority" },
            ]}
            rows={dashboardData.priorityActions}
            emptyTitle="No priority actions"
            emptyMessage="There are no overdue, unsafe-cover or pending management actions showing right now."
            renderCell={(row, key) => {
              if (key === "title") return <strong>{row.title}</strong>;

              if (key === "module" || key === "issue" || key === "priority") {
                return <Badge>{row[key]}</Badge>;
              }

              if (key === "due") {
                return (
                  <div className="stacked-cell">
                    <strong>{formatDate(row.due)}</strong>
                    <span>{getDueText(row.due)}</span>
                  </div>
                );
              }

              return row[key];
            }}
          />
        </Panel>

        <Panel as="aside" className="panel">
          <SectionHeader eyebrow="System health" title="Prototype status">
            Current build readiness, data safety and cover-checking position.
          </SectionHeader>

          <div className="dashboard-health-list">
            <div>
              <ShieldCheck size={18} />
              <span>Dummy data mode active</span>
              <Badge>Safe</Badge>
            </div>
            <div>
              <Database size={18} />
              <span>Browser localStorage enabled</span>
              <Badge>Prototype</Badge>
            </div>
            <div>
              <Users size={18} />
              <span>{staffList.length} workforce profiles</span>
              <Badge>Live prototype</Badge>
            </div>
            <div>
              <CalendarDays size={18} />
              <span>{dashboardData.coverMetrics.unsafeDates.length} unsafe cover date(s)</span>
              <Badge>
                {dashboardData.coverMetrics.unsafeDates.length > 0 ? "Review" : "Clear"}
              </Badge>
            </div>
            <div>
              <ToggleRight size={18} />
              <span>{dashboardData.disabledModules.length} disabled module(s)</span>
              <Badge>
                {dashboardData.disabledModules.length > 0 ? "Review" : "Clear"}
              </Badge>
            </div>
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Staff cover" title="Leave cover exceptions">
            Medium/high-risk leave requests from the new cover-checker service.
          </SectionHeader>

          <div className="governance-alert-grid">
            {[
              ...dashboardData.coverMetrics.riskyApprovedRequests,
              ...dashboardData.coverMetrics.riskyPendingRequests,
            ].slice(0, 6).map((request) => (
              <div className="governance-alert" key={`dashboard-cover-${request.id}`}>
                <div>
                  <strong>{request.staffName}</strong>
                  <span>
                    {formatDate(request.date)} · {request.status} · {" "}
                    {request.coverWarnings.map((warning) => warning.team).join(", ")}
                  </span>
                </div>
                <Badge>{request.coverRisk}</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Workforce" title="Payroll, leave balance and room exceptions">
            Workforce alerts now include low balances, leave over balance and room conflicts.
          </SectionHeader>

          <div className="dashboard-finance-grid">
            <div>
              <span>Monthly wage run-rate</span>
              <strong>{formatMoney(dashboardData.workforceFinancialSummary.totalMonthlyCost)}</strong>
            </div>
            <div>
              <span>Annualised wage cost</span>
              <strong>{formatMoney(dashboardData.workforceFinancialSummary.annualisedCost)}</strong>
            </div>
            <div>
              <span>ARRS claimable</span>
              <strong>{formatMoney(dashboardData.workforceFinancialSummary.arrsClaimableMonthly)}</strong>
            </div>
            <div>
              <span>Room conflicts</span>
              <strong>{dashboardData.workforceAlerts.roomConflicts.length}</strong>
            </div>
          </div>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Finance" title="Finance and dispensary snapshot">
            Finance v2.3 includes payment tracking, finance tasks and dispensary
            GPP vs supplier cost profitability.
          </SectionHeader>

          <div className="dashboard-finance-grid">
            <div>
              <span>Outstanding expected income</span>
              <strong>{formatMoney(dashboardData.financeOutstanding)}</strong>
            </div>
            <div>
              <span>Dispensary gross profit</span>
              <strong>{formatMoney(dashboardData.dispensaryProfitability.grossProfit)}</strong>
            </div>
            <div>
              <span>Loss-making drug lines</span>
              <strong>{dashboardData.dispensaryProfitability.lossRows.length}</strong>
            </div>
            <div>
              <span>Missing invoice matches</span>
              <strong>{dashboardData.dispensaryProfitability.missingInvoiceRows.length}</strong>
            </div>
            <div>
              <span>Open finance tasks</span>
              <strong>{dashboardData.openFinanceTasks.length}</strong>
            </div>
            <div>
              <span>Overdue finance tasks</span>
              <strong>{dashboardData.overdueFinanceTasks.length}</strong>
            </div>
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Inbox" title="Live alert summary">
            This reflects any Inbox items you have marked done, snoozed or reopened.
          </SectionHeader>

          <div className="dashboard-alert-list">
            {dashboardData.enrichedInbox
              .filter((item) => item.status !== "Done")
              .slice(0, 6)
              .map((item) => (
                <div className="dashboard-alert-item" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>
                      {item.module} · {item.assignedTo} · {item.dueText}
                    </span>
                  </div>
                  <Badge>{item.priority}</Badge>
                </div>
              ))}
          </div>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Modules" title="Module configuration">
            Shows enabled and disabled modules from Settings.
          </SectionHeader>

          <div className="module-status-grid">
            {dashboardData.safeModuleSettings.map((module) => (
              <div className="module-status-card" key={module.id}>
                <div>
                  <strong>{module.name}</strong>
                  <span>{module.governanceStatus}</span>
                </div>
                <Badge>{module.enabled ? "On" : "Off"}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Compliance" title="Policy review position">
            Overdue and upcoming policy review items.
          </SectionHeader>

          <div className="dashboard-alert-list">
            {dashboardData.enrichedPolicies
              .filter(
                (policy) =>
                  policy.computedStatus === "Overdue" ||
                  policy.computedStatus === "Due soon"
              )
              .map((policy) => (
                <div className="dashboard-alert-item" key={policy.id}>
                  <div>
                    <strong>{policy.name}</strong>
                    <span>
                      {policy.owner} · {formatDate(policy.reviewDue)} · {" "}
                      {policy.acknowledgement}% acknowledged
                    </span>
                  </div>
                  <Badge>{policy.computedStatus}</Badge>
                </div>
              ))}
          </div>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Training" title="Training exceptions">
            Overdue and due-soon training records.
          </SectionHeader>

          <div className="dashboard-alert-list">
            {[...dashboardData.overdueTraining, ...dashboardData.dueSoonTraining].map(
              (record) => (
                <div className="dashboard-alert-item" key={record.id}>
                  <div>
                    <strong>{record.staffName}</strong>
                    <span>
                      {getCourseName(record.courseId)} · expires {" "}
                      {formatDate(record.expiryDate)}
                    </span>
                  </div>
                  <Badge>{record.status}</Badge>
                </div>
              )
            )}
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Audits" title="Audit exceptions">
            Overdue audits and audit submissions with actions required.
          </SectionHeader>

          <div className="dashboard-alert-list">
            {dashboardData.overdueAudits.map((audit) => (
              <div className="dashboard-alert-item" key={`audit-${audit.id}`}>
                <div>
                  <strong>{audit.name}</strong>
                  <span>
                    {audit.assignedTo} · {formatDate(audit.nextDue)} · {" "}
                    {audit.category}
                  </span>
                </div>
                <Badge>{audit.status}</Badge>
              </div>
            ))}

            {dashboardData.auditActions.map((submission) => (
              <div className="dashboard-alert-item" key={`submission-${submission.id}`}>
                <div>
                  <strong>{submission.auditName}</strong>
                  <span>
                    {submission.completedBy} · {formatDate(submission.completedDate)}
                  </span>
                </div>
                <Badge>Action required</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Production readiness" title="Before this becomes real software">
            High-risk items that must be solved before any real-world deployment
            or patient-identifiable data use.
          </SectionHeader>

          <div className="governance-alert-grid">
            {dashboardData.highRiskProductionGaps.map((item) => (
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
        </Panel>
      </section>
    </>
  );
}
