import { staff } from "../data/staff";
import { trainingCourses, trainingRecords } from "../data/training";
import { daysUntil } from "../utils/dateUtils";

export function getDefaultTrainingCourses() {
  return trainingCourses;
}

export function getDefaultTrainingRecords() {
  return trainingRecords;
}

export function getRecordCourse(record, courses = trainingCourses) {
  return courses.find((course) => course.id === record.courseId);
}

export function enrichTrainingRecords(
  records = trainingRecords,
  courses = trainingCourses
) {
  const safeRecords = Array.isArray(records) ? records : trainingRecords;
  const safeCourses = Array.isArray(courses) ? courses : trainingCourses;

  return safeRecords.map((record) => {
    const course = getRecordCourse(record, safeCourses);

    return {
      ...record,
      courseName: course?.name || "Unknown course",
      category: course?.category || "Unknown",
      risk: course?.risk || "Medium",
      renewalMonths: course?.renewalMonths || "Unknown",
      daysUntilExpiry: daysUntil(record.expiryDate),
    };
  });
}

export function filterTrainingRecords(records, searchTerm, statusFilter) {
  const safeRecords = Array.isArray(records) ? records : [];
  const safeSearchTerm = String(searchTerm || "").toLowerCase();

  return safeRecords.filter((record) => {
    const searchText = `${record.staffName || ""} ${record.role || ""} ${
      record.courseName || ""
    } ${record.category || ""}`.toLowerCase();

    const matchesSearch = searchText.includes(safeSearchTerm);
    const matchesStatus = statusFilter === "All" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}

export function getTrainingCourseById(courseId, courses = trainingCourses) {
  const safeCourses = Array.isArray(courses) ? courses : trainingCourses;

  return safeCourses.find((course) => course.id === courseId) || safeCourses[0];
}

export function getTrainingMetrics(
  records = trainingRecords,
  courses = trainingCourses
) {
  const enrichedRecords = enrichTrainingRecords(records, courses);

  const overdueRecords = enrichedRecords.filter(
    (record) => record.status === "Overdue"
  );

  const dueSoonRecords = enrichedRecords.filter(
    (record) => record.status === "Due soon"
  );

  const completeRecords = enrichedRecords.filter(
    (record) => record.status === "Complete"
  );

  const highRiskOverdueRecords = enrichedRecords.filter(
    (record) => record.status === "Overdue" && record.risk === "High"
  );

  const completionRate =
    enrichedRecords.length > 0
      ? Math.round((completeRecords.length / enrichedRecords.length) * 100)
      : 0;

  return {
    enrichedRecords,
    overdueRecords,
    dueSoonRecords,
    completeRecords,
    highRiskOverdueRecords,
    completionRate,
  };
}

export function getRecordsForCourse(records, courseId, courses = trainingCourses) {
  const enrichedRecords = enrichTrainingRecords(records, courses);

  return enrichedRecords.filter((record) => record.courseId === courseId);
}

export function getMissingTrainingAssignments(
  selectedCourse,
  records,
  staffList = staff
) {
  const selectedCourseRecords = getRecordsForCourse(records, selectedCourse.id);

  return staffList
    .filter((person) => selectedCourse.requiredFor.includes(person.role))
    .map((person) => {
      const hasRecord = selectedCourseRecords.some(
        (record) => record.staffName === person.name
      );

      return {
        ...person,
        hasRecord,
        status: hasRecord ? "Complete" : "Overdue",
        detail: hasRecord ? "Training record exists" : "No training record found",
      };
    });
}