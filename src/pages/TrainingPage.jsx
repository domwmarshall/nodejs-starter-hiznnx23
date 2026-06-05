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
import { formatDate, daysUntil } from "../utils/dateUtils";

import { staff } from "../data/staff";
import { trainingCourses, trainingRecords } from "../data/training";

function getRecordCourse(record) {
  return trainingCourses.find((course) => course.id === record.courseId);
}

export function TrainingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCourseId, setSelectedCourseId] = useState(trainingCourses[0].id);

  const enrichedRecords = useMemo(
    () =>
      trainingRecords.map((record) => {
        const course = getRecordCourse(record);

        return {
          ...record,
          courseName: course?.name || "Unknown course",
          category: course?.category || "Unknown",
          risk: course?.risk || "Medium",
          renewalMonths: course?.renewalMonths || "Unknown",
          daysUntilExpiry: daysUntil(record.expiryDate),
        };
      }),
    []
  );

  const filteredRecords = enrichedRecords.filter((record) => {
    const searchText =
      `${record.staffName} ${record.role} ${record.courseName} ${record.category}`.toLowerCase();

    const matchesSearch = searchText.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedCourse =
    trainingCourses.find((course) => course.id === selectedCourseId) ||
    trainingCourses[0];

  const selectedCourseRecords = enrichedRecords.filter(
    (record) => record.courseId === selectedCourse.id
  );

  const overdueCount = enrichedRecords.filter(
    (record) => record.status === "Overdue"
  ).length;

  const dueSoonCount = enrichedRecords.filter(
    (record) => record.status === "Due soon"
  ).length;

  const completeCount = enrichedRecords.filter(
    (record) => record.status === "Complete"
  ).length;

  const completionRate = Math.round(
    (completeCount / enrichedRecords.length) * 100
  );

  const highRiskOverdueCount = enrichedRecords.filter(
    (record) => record.status === "Overdue" && record.risk === "High"
  ).length;

  return (
    <>
      <SectionHeader eyebrow="Training" title="Mandatory training matrix">
        Role-based mandatory training, renewal cycles, completion tracking and
        evidence status. This module will later feed overdue items into the Inbox.
      </SectionHeader>

      <section className="metric-grid">
        <MetricCard
          title="Courses"
          value={trainingCourses.length}
          detail="Mandatory course library"
          icon={GraduationCap}
        />
        <MetricCard
          title="Overdue"
          value={overdueCount}
          detail="Training records expired"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Due soon"
          value={dueSoonCount}
          detail="Renewals approaching"
          icon={Clock}
        />
        <MetricCard
          title="Completion"
          value={`${completionRate}%`}
          detail="Current mock completion rate"
          icon={CheckCircle2}
        />
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
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
            renderCell={(row, key) => {
              if (key === "staffName") return <strong>{row.staffName}</strong>;

              if (key === "courseName") {
                return (
                  <button
                    className="text-button"
                    onClick={() => setSelectedCourseId(row.courseId)}
                  >
                    {row.courseName}
                  </button>
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
        </div>

        <aside className="panel policy-detail-panel">
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
            <button type="button" className="primary-button">
              Assign course
            </button>
            <button type="button" className="secondary-button">
              Send reminder
            </button>
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <div className="panel">
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
            renderCell={(row, key) => {
              if (key === "staffName") return <strong>{row.staffName}</strong>;
              if (key === "status") return <Badge>{row.status}</Badge>;
              if (key === "expiryDate") return formatDate(row.expiryDate);
              return row[key];
            }}
          />
        </div>

        <div className="panel">
          <SectionHeader eyebrow="Role coverage" title="Missing assignment warnings">
            This shows where the system should later auto-detect missing mandatory
            training based on staff role.
          </SectionHeader>

          <div className="governance-alert-grid">
            {staff
              .filter((person) => selectedCourse.requiredFor.includes(person.role))
              .map((person) => {
                const hasRecord = selectedCourseRecords.some(
                  (record) => record.staffName === person.name
                );

                return (
                  <div className="governance-alert" key={person.name}>
                    <div>
                      <strong>{person.name}</strong>
                      <span>
                        {person.role} ·{" "}
                        {hasRecord
                          ? "Training record exists"
                          : "No training record found"}
                      </span>
                    </div>
                    <Badge>{hasRecord ? "Complete" : "Overdue"}</Badge>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Training alerts" title="What needs attention">
          These alerts should later feed into the Inbox and management dashboard.
        </SectionHeader>

        <div className="governance-alert-grid">
          {enrichedRecords
            .filter(
              (record) =>
                record.status === "Overdue" || record.status === "Due soon"
            )
            .map((record) => (
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

        {highRiskOverdueCount > 0 ? (
          <div className="danger-banner compact-danger">
            <AlertTriangle size={22} />
            <div>
              <strong>High-risk overdue training</strong>
              <p>
                {highRiskOverdueCount} high-risk training record
                {highRiskOverdueCount === 1 ? " is" : "s are"} overdue and
                should be escalated.
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}