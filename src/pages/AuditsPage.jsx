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
import { formatDate, daysUntil, getDueText } from "../utils/dateUtils";

import { auditTemplates, auditSubmissions } from "../data/audits";

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
    "gpop-audit-submissions",
    auditSubmissions
  );

  const enrichedTemplates = useMemo(
    () =>
      auditTemplates.map((template) => ({
        ...template,
        daysUntilDue: daysUntil(template.nextDue),
        dueText: getDueText(template.nextDue),
      })),
    []
  );

  const selectedTemplate =
    enrichedTemplates.find((template) => template.id === selectedTemplateId) ||
    enrichedTemplates[0];

  const filteredTemplates = enrichedTemplates.filter((template) => {
    const searchText =
      `${template.name} ${template.category} ${template.assignedTo} ${template.owner} ${template.description}`.toLowerCase();

    const matchesSearch = searchText.includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || template.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const overdueCount = enrichedTemplates.filter(
    (template) => template.status === "Overdue"
  ).length;

  const dueSoonCount = enrichedTemplates.filter(
    (template) => template.status === "Due soon"
  ).length;

  const actionRequiredCount = submissions.filter(
    (submission) => submission.result === "Action required"
  ).length;

  function submitMockAudit(event) {
    event.preventDefault();

    const newSubmission = {
      id: Date.now(),
      templateId: selectedTemplate.id,
      auditName: selectedTemplate.name,
      completedBy,
      completedDate: new Date().toISOString().slice(0, 10),
      result: issuesFound === "Yes" ? "Action required" : "Completed",
      issuesFound,
      actionRequired:
        issuesFound === "Yes"
          ? actionRequired || "Action required"
          : "None",
    };

    setSubmissions((currentSubmissions) => [
      newSubmission,
      ...currentSubmissions,
    ]);

    setActionRequired("");
    setIssuesFound("No");
  }

  return (
    <>
      <SectionHeader eyebrow="Audits" title="Audit & safety checks">
        Operational audit templates for daily, weekly, monthly and annual safety
        checks. Mock submissions now survive refresh using localStorage.
      </SectionHeader>

      <section className="metric-grid">
        <MetricCard
          title="Audit templates"
          value={enrichedTemplates.length}
          detail="Active mock templates"
          icon={ClipboardCheck}
        />
        <MetricCard
          title="Due soon"
          value={dueSoonCount}
          detail="Upcoming audit checks"
          icon={Clock}
        />
        <MetricCard
          title="Overdue"
          value={overdueCount}
          detail="Requires escalation"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Actions"
          value={actionRequiredCount}
          detail="Submissions needing action"
          icon={Thermometer}
        />
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
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
            renderCell={(row, key) => {
              if (key === "name") {
                return (
                  <button
                    className="text-button"
                    onClick={() => setSelectedTemplateId(row.id)}
                  >
                    {row.name}
                  </button>
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
        </div>

        <aside className="panel policy-detail-panel">
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
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <div className="panel">
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
        </div>

        <div className="panel">
          <SectionHeader eyebrow="Submit" title="Mock audit completion">
            This creates a mock submission in the table below and now survives
            browser refresh.
          </SectionHeader>

          <form className="audit-submit-form" onSubmit={submitMockAudit}>
            <label>
              Completed by
              <select
                value={completedBy}
                onChange={(event) => setCompletedBy(event.target.value)}
              >
                <option>Dominic Marshall</option>
                <option>Nurse User</option>
                <option>Reception User</option>
                <option>Dispenser User</option>
                <option>Admin User</option>
              </select>
            </label>

            <label>
              Issues found?
              <select
                value={issuesFound}
                onChange={(event) => setIssuesFound(event.target.value)}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </label>

            <label>
              Action required
              <textarea
                value={actionRequired}
                onChange={(event) => setActionRequired(event.target.value)}
                placeholder="Enter action required if any issues were found"
              />
            </label>

            <button type="submit" className="primary-button">
              Submit mock audit
            </button>
          </form>
        </div>
      </section>

      <section className="panel">
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
          rows={submissions}
          renderCell={(row, key) => {
            if (key === "auditName") return <strong>{row.auditName}</strong>;
            if (key === "completedDate") return formatDate(row.completedDate);
            if (key === "result" || key === "issuesFound") {
              return <Badge>{row[key]}</Badge>;
            }
            return row[key];
          }}
        />
      </section>
    </>
  );
}