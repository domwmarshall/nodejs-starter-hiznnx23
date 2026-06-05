import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Search,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";
import { formatDate } from "../utils/dateUtils";

import { policies } from "../data/compliance";

import {
  enrichPolicies,
  filterPolicies,
  getComplianceMetrics,
  getPolicyAcknowledgements,
  getPolicyById,
  getPolicyQuestions,
} from "../services/complianceService";

export function CompliancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0].id);

  const enrichedPolicies = useMemo(() => enrichPolicies(policies), []);

  const filteredPolicies = useMemo(
    () => filterPolicies(enrichedPolicies, searchTerm, statusFilter),
    [enrichedPolicies, searchTerm, statusFilter]
  );

  const selectedPolicy = useMemo(
    () => getPolicyById(policies, selectedPolicyId),
    [selectedPolicyId]
  );

  const metrics = useMemo(() => getComplianceMetrics(policies), []);

  const selectedAcknowledgements = useMemo(
    () => getPolicyAcknowledgements(selectedPolicy.id),
    [selectedPolicy.id]
  );

  const selectedQuestions = useMemo(
    () => getPolicyQuestions(selectedPolicy.id),
    [selectedPolicy.id]
  );

  return (
    <>
      <SectionHeader eyebrow="Compliance" title="Policy & SOP hub">
        Policies, SOPs, acknowledgements, questionnaires, review dates and owner
        reminders. Compliance logic now runs through the service layer.
      </SectionHeader>

      <section className="metric-grid">
        <MetricCard
          title="Policies"
          value={enrichedPolicies.length}
          detail="Mock policy library"
          icon={FileText}
        />
        <MetricCard
          title="Due soon"
          value={metrics.dueSoonPolicies.length}
          detail="Need owner review"
          icon={Clock}
        />
        <MetricCard
          title="Overdue"
          value={metrics.overduePolicies.length}
          detail="Requires escalation"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Acknowledgement"
          value={`${metrics.averageAcknowledgement}%`}
          detail="Average staff completion"
          icon={CheckCircle2}
        />
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
          <SectionHeader eyebrow="Policy library" title="Controlled documents">
            Search, filter and select a policy to view its review details,
            questionnaire examples and staff acknowledgement status.
          </SectionHeader>

          <div className="compliance-toolbar">
            <label className="search-input">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search policies, owners, categories..."
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
                <option>Approved</option>
                <option>Due soon</option>
                <option>Overdue</option>
              </select>
            </label>
          </div>

          <DataTable
            columns={[
              { key: "name", label: "Policy" },
              { key: "category", label: "Category" },
              { key: "owner", label: "Owner" },
              { key: "reviewDue", label: "Review due" },
              { key: "acknowledgement", label: "Acknowledgement" },
              { key: "computedStatus", label: "Status" },
              { key: "risk", label: "Risk" },
            ]}
            rows={filteredPolicies}
            emptyTitle="No policies found"
            emptyMessage="Try clearing the search box or changing the status filter."
            renderCell={(row, key) => {
              if (key === "name") {
                return (
                  <button
                    className="text-button"
                    onClick={() => setSelectedPolicyId(row.id)}
                  >
                    {row.name}
                  </button>
                );
              }

              if (key === "reviewDue") {
                return (
                  <div className="stacked-cell">
                    <strong>{formatDate(row.reviewDue)}</strong>
                    <span>
                      {row.daysUntilReview < 0
                        ? `${Math.abs(row.daysUntilReview)} days overdue`
                        : `${row.daysUntilReview} days remaining`}
                    </span>
                  </div>
                );
              }

              if (key === "acknowledgement") {
                return `${row.acknowledgement}%`;
              }

              if (key === "computedStatus" || key === "risk") {
                return (
                  <Badge>{key === "risk" ? `${row.risk} risk` : row[key]}</Badge>
                );
              }

              return row[key];
            }}
          />
        </div>

        <aside className="panel policy-detail-panel">
          <SectionHeader eyebrow="Selected policy" title={selectedPolicy.name}>
            {selectedPolicy.summary}
          </SectionHeader>

          <div className="policy-detail-grid">
            <div>
              <span>Version</span>
              <strong>{selectedPolicy.version}</strong>
            </div>
            <div>
              <span>Owner</span>
              <strong>{selectedPolicy.owner}</strong>
            </div>
            <div>
              <span>Category</span>
              <strong>{selectedPolicy.category}</strong>
            </div>
            <div>
              <span>Risk</span>
              <Badge>{selectedPolicy.risk} risk</Badge>
            </div>
            <div>
              <span>Last reviewed</span>
              <strong>{formatDate(selectedPolicy.lastReviewed)}</strong>
            </div>
            <div>
              <span>Next review</span>
              <strong>{formatDate(selectedPolicy.reviewDue)}</strong>
            </div>
            <div>
              <span>Questionnaire</span>
              <Badge>{selectedPolicy.questionnaire}</Badge>
            </div>
            <div>
              <span>Reminder schedule</span>
              <strong>{selectedPolicy.reminderSchedule}</strong>
            </div>
          </div>

          <div className="policy-actions">
            <button type="button" className="primary-button">
              Mark reviewed
            </button>
            <button type="button" className="secondary-button">
              Send reminder
            </button>
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <div className="panel">
          <SectionHeader eyebrow="Questionnaire" title="Knowledge check examples">
            Later, GPOP can generate or store role-specific questions before staff
            can acknowledge a policy.
          </SectionHeader>

          {selectedQuestions.length === 0 ? (
            <div className="empty-state">
              <strong>No questions yet</strong>
              <span>Add questionnaire questions for this policy later.</span>
            </div>
          ) : (
            <div className="question-list">
              {selectedQuestions.map((question) => (
                <div className="question-item" key={question.question}>
                  <strong>{question.question}</strong>
                  <Badge>{question.answerType}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <SectionHeader eyebrow="Acknowledgements" title="Staff completion">
            Staff must complete the policy questionnaire before acknowledgement
            can be recorded.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "staffName", label: "Staff member" },
              { key: "role", label: "Role" },
              { key: "status", label: "Status" },
              { key: "questionnaireScore", label: "Score" },
              { key: "date", label: "Date" },
            ]}
            rows={selectedAcknowledgements}
            emptyTitle="No acknowledgements"
            emptyMessage="No staff acknowledgement records exist for this policy yet."
            renderCell={(row, key) => {
              if (key === "staffName") return <strong>{row.staffName}</strong>;
              if (key === "status") return <Badge>{row.status}</Badge>;
              return row[key];
            }}
          />
        </div>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Governance alerts" title="What needs attention">
          These are the types of compliance alerts that should later feed into
          the Inbox and management dashboard.
        </SectionHeader>

        <div className="governance-alert-grid">
          {metrics.governanceAlerts.map((policy) => (
            <div className="governance-alert" key={policy.id}>
              <div>
                <strong>{policy.name}</strong>
                <span>
                  {policy.computedStatus} · {policy.acknowledgement}%
                  acknowledged · {policy.risk} risk
                </span>
              </div>
              <Badge>{policy.computedStatus}</Badge>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}