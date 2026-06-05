import { useMemo, useState } from "react";
import {
  AlertTriangle,
  FileText,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";
import { formatDate } from "../utils/dateUtils";

import {
  buildSystmOneNote,
  filterCareNavigationPathways,
  getCareNavigationMetrics,
  getCareNavigationPathwayById,
  getDefaultCareNavigationGovernanceChecklist,
  getDefaultCareNavigationPathways,
  getDefaultSampleCareNavigationCalls,
  getGovernanceChecklistMetrics,
  getInitialClinicType,
  getPathwaySafetyStatus,
} from "../services/careNavigationService";

import {
  AlertBanner,
  Button,
  FormField,
  PageHeader,
  Panel,
  fieldClassName,
} from "../components/ui";

const careNavigationPathways = getDefaultCareNavigationPathways();
const careNavigationGovernanceChecklist =
  getDefaultCareNavigationGovernanceChecklist();
const sampleCareNavigationCalls = getDefaultSampleCareNavigationCalls();

export function CareNavigationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPathwayId, setSelectedPathwayId] = useState(
    careNavigationPathways[0].id
  );

  const [presentingRequest, setPresentingRequest] = useState("");
  const [duration, setDuration] = useState("");
  const [knownIssue, setKnownIssue] = useState("No");
  const [selectedClinicType, setSelectedClinicType] = useState(
    getInitialClinicType(careNavigationPathways[0])
  );
  const [redFlagSummary, setRedFlagSummary] = useState("");
  const [supportingAction, setSupportingAction] = useState("None");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const selectedPathway = useMemo(
    () => getCareNavigationPathwayById(careNavigationPathways, selectedPathwayId),
    [selectedPathwayId]
  );

  const filteredPathways = useMemo(
    () =>
      filterCareNavigationPathways(
        careNavigationPathways,
        searchTerm,
        statusFilter
      ),
    [searchTerm, statusFilter]
  );

  const pathwayMetrics = useMemo(
    () => getCareNavigationMetrics(careNavigationPathways),
    []
  );

  const governanceMetrics = useMemo(
    () => getGovernanceChecklistMetrics(careNavigationGovernanceChecklist),
    []
  );

  const selectedSafetyStatus = useMemo(
    () => getPathwaySafetyStatus(selectedPathway),
    [selectedPathway]
  );

  function changeSelectedPathway(pathwayId) {
    const nextPathway = getCareNavigationPathwayById(
      careNavigationPathways,
      pathwayId
    );

    setSelectedPathwayId(nextPathway.id);
    setSelectedClinicType(getInitialClinicType(nextPathway));
    setRedFlagSummary("");
    setAdditionalNotes("");
  }

  const systmOneNotePreview = buildSystmOneNote({
    selectedPathway,
    presentingRequest,
    duration,
    knownIssue,
    selectedClinicType,
    supportingAction,
    redFlagSummary,
    additionalNotes,
  });

  return (
    <>
      <PageHeader eyebrow="Care Navigation" title="Reception care navigation shell">
        This is a safe structural shell for future telephone care navigation. It
        does not contain approved clinical decision logic and must not be used
        with real patients.
      </PageHeader>

      <AlertBanner
        tone="danger"
        title="Not for real patient use"
        icon={AlertTriangle}
      >
        This module is a prototype only. Red-flag prompts, pathway routing and
        escalation wording require clinical safety review, information governance
        review, version control and formal approval before use.
      </AlertBanner>

      <section className="metric-grid">
        <MetricCard
          title="Pathways"
          value={pathwayMetrics.totalPathways}
          detail="Draft pathway library"
          icon={Stethoscope}
        />
        <MetricCard
          title="Draft"
          value={pathwayMetrics.draftPathways.length}
          detail="Require clinical review"
          icon={FileText}
        />
        <MetricCard
          title="Locked"
          value={pathwayMetrics.lockedPathways.length}
          detail="Blocked from prototype use"
          icon={ShieldCheck}
        />
        <MetricCard
          title="High risk"
          value={pathwayMetrics.highRiskPathways.length}
          detail="Needs clinical owner approval"
          icon={AlertTriangle}
        />
      </section>

      <section className="content-grid">
        <Panel className="panel panel-large">
          <SectionHeader eyebrow="Pathway library" title="Care navigation pathways">
            Search and select a draft pathway. These records are structural
            placeholders, not approved clinical guidance.
          </SectionHeader>

          <div className="compliance-toolbar">
            <label className="search-input">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search pathways, sources, owners..."
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
                <option>Draft</option>
                <option>Locked</option>
                <option>Approved</option>
                <option>Retired</option>
              </select>
            </label>
          </div>

          <DataTable
            columns={[
              { key: "name", label: "Pathway" },
              { key: "version", label: "Version" },
              { key: "source", label: "Source" },
              { key: "owner", label: "Owner" },
              { key: "status", label: "Status" },
              { key: "risk", label: "Risk" },
              { key: "reviewStatus", label: "Review" },
            ]}
            rows={filteredPathways}
            emptyTitle="No pathways found"
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
                    onClick={() => changeSelectedPathway(row.id)}
                  >
                    {row.name}
                  </Button>
                );
              }

              if (key === "status" || key === "risk" || key === "reviewStatus") {
                return (
                  <Badge>{key === "risk" ? `${row.risk} risk` : row[key]}</Badge>
                );
              }

              return row[key];
            }}
          />
        </Panel>

        <Panel as="aside" className="panel policy-detail-panel">
          <SectionHeader eyebrow="Selected pathway" title={selectedPathway.name}>
            {selectedPathway.description}
          </SectionHeader>

          <div className="policy-detail-grid">
            <div>
              <span>Version</span>
              <strong>{selectedPathway.version}</strong>
            </div>
            <div>
              <span>Status</span>
              <Badge>{selectedPathway.status}</Badge>
            </div>
            <div>
              <span>Risk</span>
              <Badge>{selectedPathway.risk} risk</Badge>
            </div>
            <div>
              <span>Owner</span>
              <strong>{selectedPathway.owner}</strong>
            </div>
            <div>
              <span>Source</span>
              <strong>{selectedPathway.source}</strong>
            </div>
            <div>
              <span>Review status</span>
              <Badge>{selectedPathway.reviewStatus}</Badge>
            </div>
            <div>
              <span>Safety label</span>
              <Badge>{selectedSafetyStatus.label}</Badge>
            </div>
            <div>
              <span>Safety detail</span>
              <strong>{selectedSafetyStatus.detail}</strong>
            </div>
            <div>
              <span>Last reviewed</span>
              <strong>{selectedPathway.lastReviewed}</strong>
            </div>
            <div>
              <span>Next review</span>
              <strong>{selectedPathway.nextReview}</strong>
            </div>
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Call builder" title="Mock care navigation note">
            Build a non-clinical mock note. This only demonstrates the structure
            of a future SystmOne-ready note.
          </SectionHeader>

          <form className="care-nav-form">
            <FormField label="Selected pathway">
              <select
                className={fieldClassName}
                value={selectedPathwayId}
                onChange={(event) =>
                  changeSelectedPathway(Number(event.target.value))
                }
              >
                {careNavigationPathways.map((pathway) => (
                  <option key={pathway.id} value={pathway.id}>
                    {pathway.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Presenting request">
              <input
                className={fieldClassName}
                type="text"
                placeholder="Example: back pain, rash, sore throat"
                value={presentingRequest}
                onChange={(event) => setPresentingRequest(event.target.value)}
              />
            </FormField>

            <FormField label="Duration">
              <input
                className={fieldClassName}
                type="text"
                placeholder="Example: 3 days"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </FormField>

            <FormField label="Recurring / known issue?">
              <select
                className={fieldClassName}
                value={knownIssue}
                onChange={(event) => setKnownIssue(event.target.value)}
              >
                <option>No</option>
                <option>Yes</option>
                <option>Not known</option>
              </select>
            </FormField>

            <FormField label="Suggested clinic/action type">
              <select
                className={fieldClassName}
                value={selectedClinicType}
                onChange={(event) => setSelectedClinicType(event.target.value)}
              >
                {selectedPathway.suggestedClinicTypes.map((clinicType) => (
                  <option key={clinicType}>{clinicType}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Supporting action">
              <select
                className={fieldClassName}
                value={supportingAction}
                onChange={(event) => setSupportingAction(event.target.value)}
              >
                <option>None</option>
                <option>Text patient image upload link</option>
                <option>Ask patient to provide urine sample</option>
                <option>Ask patient to collect stool sample pot</option>
                <option>Ask patient to collect throat swab</option>
                <option>Book with clinician first</option>
              </select>
            </FormField>

            <FormField label="Red-flag response summary">
              <textarea
                className={fieldClassName}
                placeholder="Prototype only. Do not use for real patient safety decisions."
                value={redFlagSummary}
                onChange={(event) => setRedFlagSummary(event.target.value)}
              />
            </FormField>

            <FormField label="Additional notes">
              <textarea
                className={fieldClassName}
                placeholder="Optional non-clinical note details"
                value={additionalNotes}
                onChange={(event) => setAdditionalNotes(event.target.value)}
              />
            </FormField>
          </form>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="SystmOne preview" title="Generated note preview">
            This is a text preview only. Later this could become a copy-to-clipboard
            SystmOne note format.
          </SectionHeader>

          <pre className="note-preview">{systmOneNotePreview}</pre>

          <AlertBanner
            tone="danger"
            title="Safety warning"
            icon={AlertTriangle}
            className="mt-4"
          >
            Do not copy this into a real patient record. This is a prototype note
            preview only.
          </AlertBanner>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Red flags" title="Placeholder safety prompts">
            These prompts are examples only. They must be clinically reviewed and
            approved before use.
          </SectionHeader>

          <div className="question-list">
            {selectedPathway.redFlagPlaceholders.map((redFlag) => (
              <div className="question-item" key={redFlag}>
                <strong>{redFlag}</strong>
                <Badge>Placeholder</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Governance" title="Approval checklist">
            Required before this module can be used in a live practice setting.
          </SectionHeader>

          <div className="governance-alert-grid">
            {careNavigationGovernanceChecklist.map((item) => (
              <div className="governance-alert" key={item.id}>
                <div>
                  <strong>{item.item}</strong>
                  <span>{item.note}</span>
                </div>
                <Badge>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Governance summary" title="Clinical safety position">
            Summary of pathway and checklist readiness.
          </SectionHeader>

          <div className="governance-alert-grid">
            <div className="governance-alert">
              <div>
                <strong>Clinically unsafe pathways</strong>
                <span>
                  {pathwayMetrics.clinicallyUnsafePathways.length} pathway(s)
                  require clinical/governance review.
                </span>
              </div>
              <Badge>High risk</Badge>
            </div>

            <div className="governance-alert">
              <div>
                <strong>Required checklist items</strong>
                <span>
                  {governanceMetrics.requiredItems.length} required governance
                  item(s) still need completion.
                </span>
              </div>
              <Badge>Required</Badge>
            </div>

            <div className="governance-alert">
              <div>
                <strong>Production status</strong>
                <span>
                  Care navigation must remain prototype-only until approved.
                </span>
              </div>
              <Badge>Locked</Badge>
            </div>
          </div>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Approved use" title="What is allowed now">
            This module can be used only for safe build/testing work.
          </SectionHeader>

          <div className="settings-mini-list">
            <div>
              <ShieldCheck size={18} />
              <span>Safe to test with dummy scenarios</span>
            </div>
            <div>
              <FileText size={18} />
              <span>Safe to design pathway structure</span>
            </div>
            <div>
              <AlertTriangle size={18} />
              <span>Not safe for real patient triage</span>
            </div>
          </div>
        </Panel>
      </section>

      <Panel className="panel">
        <SectionHeader eyebrow="Mock history" title="Recent care navigation notes">
          Example records only. Real use would require authentication, audit logs,
          pathway versioning and secure storage.
        </SectionHeader>

        <DataTable
          columns={[
            { key: "date", label: "Date" },
            { key: "pathway", label: "Pathway" },
            { key: "contactType", label: "Contact type" },
            { key: "presentingRequest", label: "Request" },
            { key: "selectedClinicType", label: "Clinic/action" },
            { key: "status", label: "Status" },
          ]}
          rows={sampleCareNavigationCalls}
          renderCell={(row, key) => {
            if (key === "date") return formatDate(row.date);
            if (key === "pathway") return <strong>{row.pathway}</strong>;
            if (key === "status" || key === "selectedClinicType") {
              return <Badge>{row[key]}</Badge>;
            }
            return row[key];
          }}
        />
      </Panel>
    </>
  );
}