import { auditTemplates, auditSubmissions } from "../data/audits";
import { daysUntil, getDueText } from "../utils/dateUtils";
import { SETTINGS_STORAGE_KEYS } from "./settingsService";

export const AUDIT_SUBMISSIONS_STORAGE_KEY = SETTINGS_STORAGE_KEYS.auditSubmissions;

export function getDefaultAuditSubmissions() {
  return auditSubmissions;
}

export function getDefaultAuditTemplates() {
  return auditTemplates;
}

export function enrichAuditTemplates(templates = auditTemplates) {
  const safeTemplates = Array.isArray(templates) ? templates : auditTemplates;

  return safeTemplates.map((template) => ({
    ...template,
    daysUntilDue: daysUntil(template.nextDue),
    dueText: getDueText(template.nextDue),
  }));
}

export function filterAuditTemplates(templates, searchTerm, statusFilter) {
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const safeSearchTerm = String(searchTerm || "").toLowerCase();

  return safeTemplates.filter((template) => {
    const searchText = `${template.name || ""} ${template.category || ""} ${
      template.assignedTo || ""
    } ${template.owner || ""} ${template.description || ""}`.toLowerCase();

    const matchesSearch = searchText.includes(safeSearchTerm);

    const matchesStatus =
      statusFilter === "All" || template.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}

export function getAuditTemplateById(templates, templateId) {
  const enrichedTemplates = enrichAuditTemplates(templates);

  return (
    enrichedTemplates.find((template) => template.id === templateId) ||
    enrichedTemplates[0]
  );
}

export function getAuditMetrics(templates = auditTemplates, submissions = auditSubmissions) {
  const safeTemplates = Array.isArray(templates) ? templates : auditTemplates;
  const safeSubmissions = Array.isArray(submissions)
    ? submissions
    : auditSubmissions;

  const overdueAudits = safeTemplates.filter(
    (template) => template.status === "Overdue"
  );

  const dueSoonAudits = safeTemplates.filter(
    (template) => template.status === "Due soon"
  );

  const upToDateAudits = safeTemplates.filter(
    (template) => template.status === "Up to date"
  );

  const actionRequiredSubmissions = safeSubmissions.filter(
    (submission) => submission.result === "Action required"
  );

  const completedSubmissions = safeSubmissions.filter(
    (submission) => submission.result === "Completed"
  );

  return {
    overdueAudits,
    dueSoonAudits,
    upToDateAudits,
    actionRequiredSubmissions,
    completedSubmissions,
  };
}

export function createAuditSubmission({
  template,
  completedBy,
  issuesFound,
  actionRequired,
}) {
  const issuesWereFound = issuesFound === "Yes";

  return {
    id: Date.now(),
    templateId: template.id,
    auditName: template.name,
    completedBy,
    completedDate: new Date().toISOString().slice(0, 10),
    result: issuesWereFound ? "Action required" : "Completed",
    issuesFound,
    actionRequired: issuesWereFound
      ? actionRequired || "Action required"
      : "None",
  };
}

export function addAuditSubmission(submissions, newSubmission) {
  const safeSubmissions = Array.isArray(submissions)
    ? submissions
    : auditSubmissions;

  return [newSubmission, ...safeSubmissions];
}

export function getSubmissionsForTemplate(submissions, templateId) {
  const safeSubmissions = Array.isArray(submissions)
    ? submissions
    : auditSubmissions;

  return safeSubmissions.filter(
    (submission) => submission.templateId === templateId
  );
}

export function getRecentAuditSubmissions(submissions, limit = 10) {
  const safeSubmissions = Array.isArray(submissions)
    ? submissions
    : auditSubmissions;

  return [...safeSubmissions]
    .sort((a, b) => String(b.completedDate).localeCompare(String(a.completedDate)))
    .slice(0, limit);
}