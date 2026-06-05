import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  GraduationCap,
  Search,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";
import { formatDate } from "../utils/dateUtils";

import { staff } from "../data/staff";
import { trainingCourses, trainingRecords } from "../data/training";

import {
  enrichTrainingRecords,
  filterTrainingRecords,
  getMissingTrainingAssignments,
  getRecordsForCourse,
  getTrainingCourseById,
  getTrainingMetrics,
} from "../services/trainingService";

import {
  AlertBanner,
  Button,
  PageHeader,
  Panel,
} from "../components/ui";

export function TrainingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCourseId, setSelectedCourseId] = useState(trainingCourses[0].id);

  const enrichedRecords = useMemo(
    () => enrichTrainingRecords(trainingRecords, trainingCourses),
    []
  );

  const filteredRecords = useMemo(
    () => filterTrainingRecords(enrichedRecords, searchTerm, statusFilter),
    [enrichedRecords, searchTerm, statusFilter]
  );

  const selectedCourse = useMemo(
    () => getTrainingCourseById(selectedCourseId, trainingCourses),
    [selectedCourseId]
  );

  const selectedCourseRecords = useMemo(
    () => getRecordsForCourse(trainingRecords, selectedCourse.id, trainingCourses),
    [selectedCourse.id]
  );

  const metrics = useMemo(
    () => getTrainingMetrics(trainingRecords, trainingCourses),
    []
  );

  const missingAssignments = useMemo(
    () => getMissingTrainingAssignments(selectedCourse, trainingRecords, staff),
    [selectedCourse]
  );

  return (
    <>
      <PageHeader eyebrow="Training" title="Mandatory training matrix">
        Role-based mandatory training, renewal cycles, completion tracking and
        evidence status. Training calculations now run through the service layer.
      </PageHeader>

      <section className="metric-grid">
        <MetricCard
          title="Courses"
          value={trainingCourses.length}
          detail="Mandatory course library"
          icon={GraduationCap}
        />
        <MetricCard
          title="Overdue"
          value={metrics.overdueRecords.length}
          detail="Training records expired"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Due soon"
          value={metrics.dueSoonRecords.length}
          detail="Renewals approaching"
          icon={Clock}
        />
        <MetricCard
          title="Completion"
          value={`${metrics.completionRate}%`}
          detail="Current mock completion rate"
          icon={CheckCircle2}
        />
      </section>

      {metrics.highRiskOverdueRecords.length > 0 ? (
        <AlertBanner
          tone="danger"
          title="High-risk overdue training"
          icon={AlertTriangle}
        >
          {metrics.highRiskOverdueRecords.length} high-risk training record
          {metrics.highRiskOverdueRecords.length === 1 ? " is" : "s are"}{" "}
          overdue and should be escalated.
        </AlertBanner>
      ) : null}

      <section className="content-grid">
        <Panel className="panel panel-large">
          <SectionHeader eyebrow="Training matrix" title="Staff training records">
            Search and filter staff training records. Click a course name to view
            its role assignment and completion status.
          </SectionHeader>

          <div className="compliance-toolbar">
            <label className="search-input">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search staff, courses, roles..."
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
                <option>Complete</option>
                <option>Due soon</option>
                <option>Overdue</option>
              </select>
            </label>
          </div>

          <DataTable
            columns={[
              { key: "staffName", label: "Staff member" },
              { key: "role", label: "Role" },
              { key: "courseName", label: "Course" },
              { key: "expiryDate", label: "Expiry" },
              { key: "status", label: "Status" },
              { key: "risk", label: "Risk" },
              { key: "evidence", label: "Evidence" },
            ]}
            rows={filteredRecords}
            emptyTitle="No training records found"
            emptyMessage="Try clearing the search box or changing the status filter."
            renderCell={(row, key) => {
              if (key === "staffName") return <strong>{row.staffName}</strong>;

              if (key === "courseName") {
                return (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-button"
                    style={{ padding: 0, justifyContent: "flex-start" }}
                    onClick={() => setSelectedCourseId(row.courseId)}
                  >
                    {row.courseName}
                  </Button>
                );
              }

              if (key === "expiryDate") {
                return (
                  <div className="stacked-cell">
                    <strong>{formatDate(row.expiryDate)}</strong>
                    <span>
                      {row.daysUntilExpiry < 0
                        ? `${Math.abs(row.daysUntilExpiry)} days overdue`
                        : `${row.daysUntilExpiry} days remaining`}
                    </span>
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
          <SectionHeader eyebrow="Selected course" title={selectedCourse.name}>
            {selectedCourse.description}
          </SectionHeader>

          <div className="policy-detail-grid">
            <div>
              <span>Category</span>
              <strong>{selectedCourse.category}</strong>
            </div>
            <div>
              <span>Owner</span>
              <strong>{selectedCourse.owner}</strong>
            </div>
            <div>
              <span>Renewal cycle</span>
              <strong>{selectedCourse.renewalMonths} months</strong>
            </div>
            <div>
              <span>Risk</span>
              <Badge>{selectedCourse.risk} risk</Badge>
            </div>
            <div>
              <span>Status</span>
              <Badge>{selectedCourse.status}</Badge>
            </div>
          </div>

          <div className="training-role-box">
            <strong>Required for roles</strong>
            <div className="role-chip-list">
              {selectedCourse.requiredFor.map((role) => (
                <span className="role-chip" key={role}>
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="policy-actions">
            <Button type="button" variant="primary">
              Assign course
            </Button>
            <Button type="button" variant="secondary">
              Send reminder
            </Button>
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Selected course" title="Completion by staff">
            Staff records linked to the selected training course.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "staffName", label: "Staff member" },
              { key: "role", label: "Role" },
              { key: "status", label: "Status" },
              { key: "expiryDate", label: "Expiry" },
              { key: "evidence", label: "Evidence" },
            ]}
            rows={selectedCourseRecords}
            emptyTitle="No records for this course"
            emptyMessage="No staff training records exist for this selected course yet."
            renderCell={(row, key) => {
              if (key === "staffName") return <strong>{row.staffName}</strong>;
              if (key === "status") return <Badge>{row.status}</Badge>;
              if (key === "expiryDate") return formatDate(row.expiryDate);
              return row[key];
            }}
          />
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Role coverage" title="Missing assignment warnings">
            This shows where the system should later auto-detect missing mandatory
            training based on staff role.
          </SectionHeader>

          <div className="governance-alert-grid">
            {missingAssignments.map((person) => (
              <div className="governance-alert" key={person.name}>
                <div>
                  <strong>{person.name}</strong>
                  <span>
                    {person.role} · {person.detail}
                  </span>
                </div>
                <Badge>{person.status}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel className="panel">
        <SectionHeader eyebrow="Training alerts" title="What needs attention">
          These alerts should later feed into the Inbox and management dashboard.
        </SectionHeader>

        <div className="governance-alert-grid">
          {[...metrics.overdueRecords, ...metrics.dueSoonRecords].map((record) => (
            <div className="governance-alert" key={record.id}>
              <div>
                <strong>{record.staffName}</strong>
                <span>
                  {record.courseName} · {record.status} · expires{" "}
                  {formatDate(record.expiryDate)}
                </span>
              </div>
              <Badge>{record.status}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}