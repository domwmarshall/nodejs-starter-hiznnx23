import { useMemo } from "react";
import {
  AlertTriangle,
  Bell,
  ClipboardCheck,
  Clock,
  Database,
  FileText,
  GraduationCap,
  PoundSterling,
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
import { trainingCourses, trainingRecords } from "../data/training";
import { auditTemplates } from "../data/audits";
import { moduleSettings, productionReadinessItems } from "../data/settings";
import { financeTasks, expectedPayments } from "../data/finance";

import {
  INBOX_STORAGE_KEY,
  enrichInboxItems,
  getInboxMetrics,
} from "../services/inboxService";

import {
  FINANCE_TASKS_STORAGE_KEY,
  formatMoney,
  getFinanceTaskMetrics,
  getPaymentTotals,
} from "../services/financeService";

import {
  AUDIT_SUBMISSIONS_STORAGE_KEY,
  getAuditMetrics,
  getDefaultAuditSubmissions,
} from "../services/auditService";

function getCourseName(courseId) {
  const course = trainingCourses.find((item) => item.id === courseId);
  return course?.name || "Unknown course";
}

function getReadinessScore(highRiskGaps, disabledModules, careNavigationEnabled) {
  let score = 100;

  score -= highRiskGaps * 8;
  score -= disabledModules * 4;

  if (careNavigationEnabled) {
    score -= 12;
  }

  return Math.max(score, 0);
}

export function DashboardPage({ holidayRequests = [] }) {
  const [storedInboxItems] = useLocalStorageState(INBOX_STORAGE_KEY, inboxItems);

  const [storedAuditSubmissions] = useLocalStorageState(
    AUDIT_SUBMISSIONS_STORAGE_KEY,
    getDefaultAuditSubmissions()
  );

  const [storedModuleSettings] = useLocalStorageState(
    "gpop-module-settings",
    moduleSettings
  );

  const [storedFinanceTasks] = useLocalStorageState(
    FINANCE_TASKS_STORAGE_KEY,
    financeTasks
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

    const enrichedInbox = enrichInboxItems(storedInboxItems);
    const inboxMetrics = getInboxMetrics(storedInboxItems);

    const enrichedPolicies = policies.map((policy) => ({
      ...policy,
      computedStatus: getReviewStatus(policy.reviewDue, policy.status),
      daysUntilReview: daysUntil(policy.reviewDue),
    }));

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

    const enabledModules = safeModuleSettings.filter((module) => module.enabled);
    const disabledModules = safeModuleSettings.filter((module) => !module.enabled);

    const highRiskProductionGaps = productionReadinessItems.filter(
      (item) => item.risk === "High"
    );

    const financeTaskMetrics = getFinanceTaskMetrics(safeFinanceTasks);
    const paymentTotals = getPaymentTotals(expectedPayments);

    const careNavigationSetting = safeModuleSettings.find(
      (module) => module.id === "care-navigation"
    );

    const careNavigationEnabled = careNavigationSetting?.enabled === true;

    const readinessScore = getReadinessScore(
      highRiskProductionGaps.length,
      disabledModules.length,
      careNavigationEnabled
    );

    const priorityActions = [
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
      enabledModules,
      disabledModules,
      highRiskProductionGaps,
      openFinanceTasks: financeTaskMetrics.openTasks,
      highPriorityFinanceTasks: financeTaskMetrics.highPriorityTasks,
      overdueFinanceTasks: financeTaskMetrics.overdueTasks,
      financeOutstanding: paymentTotals.outstanding,
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
    holidayRequests,
  ]);

  return (
    <>
      <section className="hero-card">
        <div>
          <p className="eyebrow">General Practice Operations Portal</p>
          <h1>Practice Manager Control Centre</h1>
          <p>
            Dashboard v3 now includes finance, disabled module warnings, care
            navigation governance and a prototype readiness score.
          </p>
        </div>

        <div className="dashboard-readiness-card">
          <span>System readiness</span>
          <strong>{dashboardData.readinessScore}%</strong>
          <p>Prototype readiness estimate</p>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard
          title="Open inbox"
          value={dashboardData.openInboxItems.length}
          detail="Active alerts and tasks"
          icon={Bell}
        />
        <MetricCard
          title="High priority"
          value={dashboardData.highPriorityInboxItems.length}
          detail="Needs management attention"
          icon={AlertTriangle}
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

      {dashboardData.disabledModules.length > 0 ? (
        <section className="dashboard-warning-strip">
          <AlertTriangle size={22} />
          <div>
            <strong>Disabled modules detected</strong>
            <p>
              {dashboardData.disabledModules.map((module) => module.name).join(", ")}{" "}
              {dashboardData.disabledModules.length === 1 ? "is" : "are"} currently
              switched off in Settings.
            </p>
          </div>
        </section>
      ) : null}

      {dashboardData.careNavigationEnabled ? (
        <section className="danger-banner">
          <Stethoscope size={24} />
          <div>
            <strong>Care Navigation is enabled but not production-ready</strong>
            <p>
              The care navigation module is still a shell. It must not be used
              with real patients until clinical safety, pathway approval,
              information governance and audit logging are complete.
            </p>
          </div>
        </section>
      ) : null}

      <section className="content-grid">
        <div className="panel panel-large">
          <SectionHeader eyebrow="Priority" title="Management action list">
            A combined list of overdue and pending items across compliance,
            training, audits, finance and staff leave.
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
            emptyMessage="There are no overdue or pending management actions showing right now."
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
        </div>

        <aside className="panel">
          <SectionHeader eyebrow="System health" title="Prototype status">
            Current build readiness and risk position.
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
              <span>{staff.length} mock staff profiles</span>
              <Badge>Live prototype</Badge>
            </div>
            <div>
              <Stethoscope size={18} />
              <span>Care navigation governance required</span>
              <Badge>High risk</Badge>
            </div>
            <div>
              <ToggleRight size={18} />
              <span>{dashboardData.disabledModules.length} disabled module(s)</span>
              <Badge>{dashboardData.disabledModules.length > 0 ? "Review" : "Clear"}</Badge>
            </div>
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <div className="panel">
          <SectionHeader eyebrow="Finance" title="Finance snapshot">
            Finance v1 summary from expected payments and finance tasks.
          </SectionHeader>

          <div className="dashboard-finance-grid">
            <div>
              <span>Outstanding expected income</span>
              <strong>{formatMoney(dashboardData.financeOutstanding)}</strong>
            </div>
            <div>
              <span>Open finance tasks</span>
              <strong>{dashboardData.openFinanceTasks.length}</strong>
            </div>
            <div>
              <span>High priority finance tasks</span>
              <strong>{dashboardData.highPriorityFinanceTasks.length}</strong>
            </div>
            <div>
              <span>Overdue finance tasks</span>
              <strong>{dashboardData.overdueFinanceTasks.length}</strong>
            </div>
          </div>

          <div className="dashboard-alert-list dashboard-section-spacing">
            {dashboardData.openFinanceTasks.slice(0, 4).map((task) => (
              <div className="dashboard-alert-item" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>
                    {task.area} · {task.owner} · {getDueText(task.dueDate)}
                  </span>
                </div>
                <Badge>{task.priority}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
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
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
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
        </div>

        <div className="panel">
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
                      {policy.owner} · {formatDate(policy.reviewDue)} ·{" "}
                      {policy.acknowledgement}% acknowledged
                    </span>
                  </div>
                  <Badge>{policy.computedStatus}</Badge>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
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
                      {getCourseName(record.courseId)} · expires{" "}
                      {formatDate(record.expiryDate)}
                    </span>
                  </div>
                  <Badge>{record.status}</Badge>
                </div>
              )
            )}
          </div>
        </div>

        <div className="panel">
          <SectionHeader eyebrow="Audits" title="Audit exceptions">
            Overdue audits and audit submissions with actions required.
          </SectionHeader>

          <div className="dashboard-alert-list">
            {dashboardData.overdueAudits.map((audit) => (
              <div className="dashboard-alert-item" key={`audit-${audit.id}`}>
                <div>
                  <strong>{audit.name}</strong>
                  <span>
                    {audit.assignedTo} · {formatDate(audit.nextDue)} · {audit.category}
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
        </div>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Production readiness" title="Before this becomes real software">
          These high-risk items must be solved before any real-world deployment or
          patient-identifiable data use.
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
      </section>
    </>
  );
}