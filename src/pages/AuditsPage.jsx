import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  Clock,
  Search,
  Thermometer,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { formatDate } from "../utils/dateUtils";

import { auditTemplates } from "../data/audits";

import {
  AUDIT_SUBMISSIONS_STORAGE_KEY,
  addAuditSubmission,
  createAuditSubmission,
  enrichAuditTemplates,
  filterAuditTemplates,
  getAuditMetrics,
  getAuditTemplateById,
  getDefaultAuditSubmissions,
  getRecentAuditSubmissions,
  getSubmissionsForTemplate,
} from "../services/auditService";

import {
  AlertBanner,
  Button,
  FormField,
  PageHeader,
  Panel,
  fieldClassName,
} from "../components/ui";

export function AuditsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    auditTemplates[0].id
  );
  const [completedBy, setCompletedBy] = useState("Dominic Marshall");
  const [issuesFound, setIssuesFound] = useState("No");
  const [actionRequired, setActionRequired] = useState("");

  const [submissions, setSubmissions] = useLocalStorageState(
    AUDIT_SUBMISSIONS_STORAGE_KEY,
    getDefaultAuditSubmissions()
  );

  const enrichedTemplates = useMemo(
    () => enrichAuditTemplates(auditTemplates),
    []
  );

  const selectedTemplate = useMemo(
    () => getAuditTemplateById(auditTemplates, selectedTemplateId),
    [selectedTemplateId]
  );

  const filteredTemplates = useMemo(
    () => filterAuditTemplates(enrichedTemplates, searchTerm, statusFilter),
    [enrichedTemplates, searchTerm, statusFilter]
  );

  const metrics = useMemo(
    () => getAuditMetrics(auditTemplates, submissions),
    [submissions]
  );

  const selectedTemplateSubmissions = useMemo(
    () => getSubmissionsForTemplate(submissions, selectedTemplate.id),
    [submissions, selectedTemplate.id]
  );

  const recentSubmissions = useMemo(
    () => getRecentAuditSubmissions(submissions),
    [submissions]
  );

  function submitMockAudit(event) {
    event.preventDefault();

    const newSubmission = createAuditSubmission({
      template: selectedTemplate,
      completedBy,
      issuesFound,
      actionRequired,
    });

    setSubmissions((currentSubmissions) =>
      addAuditSubmission(currentSubmissions, newSubmission)
    );

    setActionRequired("");
    setIssuesFound("No");
  }

  return (
    <>
      <PageHeader eyebrow="Audits" title="Audit & safety checks">
        Operational audit templates for daily, weekly, monthly and annual safety
        checks. Audit submissions run through the audit service layer and persist
        in browser localStorage.
      </PageHeader>

      <section className="metric-grid">
        <MetricCard
          title="Audit templates"
          value={enrichedTemplates.length}
          detail="Active mock templates"
          icon={ClipboardCheck}
        />
        <MetricCard
          title="Due soon"
          value={metrics.dueSoonAudits.length}
          detail="Upcoming audit checks"
          icon={Clock}
        />
        <MetricCard
          title="Overdue"
          value={metrics.overdueAudits.length}
          detail="Requires escalation"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Actions"
          value={metrics.actionRequiredSubmissions.length}
          detail="Submissions needing action"
          icon={Thermometer}
        />
      </section>

      {metrics.overdueAudits.length > 0 ? (
        <AlertBanner
          tone="danger"
          title="Overdue audits"
          icon={AlertTriangle}
        >
          {metrics.overdueAudits.length} audit
          {metrics.overdueAudits.length === 1 ? " is" : "s are"} overdue and
          should be escalated.
        </AlertBanner>
      ) : null}

      {metrics.actionRequiredSubmissions.length > 0 ? (
        <AlertBanner
          tone="warning"
          title="Audit actions required"
          icon={Thermometer}
        >
          {metrics.actionRequiredSubmissions.length} submitted audit
          {metrics.actionRequiredSubmissions.length === 1 ? " needs" : "s need"}{" "}
          follow-up action.
        </AlertBanner>
      ) : null}

      <section className="content-grid">
        <Panel className="panel panel-large">
          <SectionHeader eyebrow="Template library" title="Audit templates">
            Search and filter audit templates. Click an audit name to view the
            questions and submit a mock completion.
          </SectionHeader>

          <div className="compliance-toolbar">
            <label className="search-input">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search audits, owners, categories..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <label className="filter-select">
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All</option>
                <option>Overdue</option>
                <option>Due soon</option>
                <option>Up to date</option>
              </select>
            </label>
          </div>

          <DataTable
            columns={[
              { key: "name", label: "Audit" },
              { key: "category", label: "Category" },
              { key: "frequency", label: "Frequency" },
              { key: "assignedTo", label: "Assigned to" },
              { key: "nextDue", label: "Next due" },
              { key: "status", label: "Status" },
              { key: "risk", label: "Risk" },
            ]}
            rows={filteredTemplates}
            emptyTitle="No audit templates found"
            emptyMessage="Try clearing the search box or changing the status filter."
            renderCell={(row, key) => {
              if (key === "name") {
                return (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-button"
                    style={{ padding: 0, justifyContent: "flex-start" }}
                    onClick={() => setSelectedTemplateId(row.id)}
                  >
                    {row.name}
                  </Button>
                );
              }

              if (key === "nextDue") {
                return (
                  <div className="stacked-cell">
                    <strong>{formatDate(row.nextDue)}</strong>
                    <span>{row.dueText}</span>
                  </div>
                );
              }

              if (key === "status") return <Badge>{row.status}</Badge>;
              if (key === "risk") return <Badge>{row.risk} risk</Badge>;

              return row[key];
            }}
          />
        </Panel>

        <Panel as="aside" className="panel policy-detail-panel">
          <SectionHeader eyebrow="Selected audit" title={selectedTemplate.name}>
            {selectedTemplate.description}
          </SectionHeader>

          <div className="policy-detail-grid">
            <div>
              <span>Category</span>
              <strong>{selectedTemplate.category}</strong>
            </div>
            <div>
              <span>Frequency</span>
              <strong>{selectedTemplate.frequency}</strong>
            </div>
            <div>
              <span>Assigned to</span>
              <strong>{selectedTemplate.assignedTo}</strong>
            </div>
            <div>
              <span>Owner</span>
              <strong>{selectedTemplate.owner}</strong>
            </div>
            <div>
              <span>Risk</span>
              <Badge>{selectedTemplate.risk} risk</Badge>
            </div>
            <div>
              <span>Status</span>
              <Badge>{selectedTemplate.status}</Badge>
            </div>
            <div>
              <span>Required evidence</span>
              <strong>{selectedTemplate.requiredEvidence}</strong>
            </div>
            <div>
              <span>Submissions</span>
              <strong>{selectedTemplateSubmissions.length}</strong>
            </div>
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Audit questions" title="Checklist">
            These questions define what the staff member must confirm before
            completing the audit.
          </SectionHeader>

          <div className="question-list">
            {selectedTemplate.questions.map((question, index) => (
              <div className="question-item" key={question}>
                <strong>
                  {index + 1}. {question}
                </strong>
                <Badge>Required</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Submit" title="Mock audit completion">
            This creates a mock submission and persists it in browser
            localStorage.
          </SectionHeader>

          <form className="audit-submit-form" onSubmit={submitMockAudit}>
            <FormField label="Completed by">
              <select
                className={fieldClassName}
                value={completedBy}
                onChange={(event) => setCompletedBy(event.target.value)}
              >
                <option>Dominic Marshall</option>
                <option>Nurse User</option>
                <option>Reception User</option>
                <option>Dispenser User</option>
                <option>Admin User</option>
              </select>
            </FormField>

            <FormField label="Issues found?">
              <select
                className={fieldClassName}
                value={issuesFound}
                onChange={(event) => setIssuesFound(event.target.value)}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </FormField>

            <FormField label="Action required">
              <textarea
                className={fieldClassName}
                value={actionRequired}
                onChange={(event) => setActionRequired(event.target.value)}
                placeholder="Enter action required if any issues were found"
              />
            </FormField>

            <Button type="submit" variant="primary">
              Submit mock audit
            </Button>
          </form>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Selected audit" title="Submission history">
            Recent submissions for the selected audit template.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "completedBy", label: "Completed by" },
              { key: "completedDate", label: "Date" },
              { key: "result", label: "Result" },
              { key: "issuesFound", label: "Issues" },
              { key: "actionRequired", label: "Action required" },
            ]}
            rows={selectedTemplateSubmissions}
            emptyTitle="No submissions for this audit"
            emptyMessage="Submit a mock audit completion to create a record."
            renderCell={(row, key) => {
              if (key === "completedBy") return <strong>{row.completedBy}</strong>;
              if (key === "completedDate") return formatDate(row.completedDate);
              if (key === "result" || key === "issuesFound") {
                return <Badge>{row[key]}</Badge>;
              }
              return row[key];
            }}
          />
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Exceptions" title="Action required">
            Audit submissions that need follow-up.
          </SectionHeader>

          <div className="governance-alert-grid">
            {metrics.actionRequiredSubmissions.length === 0 ? (
              <div className="empty-state">
                <strong>No audit actions</strong>
                <span>No submitted audits currently require action.</span>
              </div>
            ) : (
              metrics.actionRequiredSubmissions.map((submission) => (
                <div className="governance-alert" key={submission.id}>
                  <div>
                    <strong>{submission.auditName}</strong>
                    <span>
                      {submission.completedBy} ·{" "}
                      {formatDate(submission.completedDate)} ·{" "}
                      {submission.actionRequired}
                    </span>
                  </div>
                  <Badge>Action required</Badge>
                </div>
              ))
            )}
          </div>
        </Panel>
      </section>

      <Panel className="panel">
        <SectionHeader eyebrow="Submissions" title="Recent audit submissions">
          These are mock audit records stored in browser localStorage.
        </SectionHeader>

        <DataTable
          columns={[
            { key: "auditName", label: "Audit" },
            { key: "completedBy", label: "Completed by" },
            { key: "completedDate", label: "Date" },
            { key: "result", label: "Result" },
            { key: "issuesFound", label: "Issues" },
            { key: "actionRequired", label: "Action required" },
          ]}
          rows={recentSubmissions}
          emptyTitle="No audit submissions"
          emptyMessage="Submit a mock audit completion to create your first audit record."
          renderCell={(row, key) => {
            if (key === "auditName") return <strong>{row.auditName}</strong>;
            if (key === "completedDate") return formatDate(row.completedDate);
            if (key === "result" || key === "issuesFound") {
              return <Badge>{row[key]}</Badge>;
            }
            return row[key];
          }}
        />
      </Panel>
    </>
  );
}