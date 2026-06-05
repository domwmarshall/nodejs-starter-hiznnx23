import { staff } from "../data/staff";
import {
  BANK_HOLIDAYS_2026_27,
  DEFAULT_WORKFORCE_PROFILES,
  FISCAL_YEAR,
  PRACTICE_ROOMS,
  ROOM_BLOCKS,
  ROOM_PRIORITY,
} from "../data/workforce";
import { formatDate } from "../utils/dateUtils";

export const WORKFORCE_PROFILES_STORAGE_KEY = "gpop-workforce-profiles";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function dateDayName(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return DAY_ORDER[(date.getDay() + 6) % 7] || "Unknown";
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normaliseProfile(profile) {
  const fallback = staff.find((person) => person.name === profile.name) || {};
  return {
    ...fallback,
    ...profile,
    workingPattern: Array.isArray(profile.workingPattern) ? profile.workingPattern : [],
    contractAmendments: Array.isArray(profile.contractAmendments) ? profile.contractAmendments : [],
  };
}

export function getDefaultWorkforceProfiles() {
  return clone(DEFAULT_WORKFORCE_PROFILES).map(normaliseProfile);
}

export function getSafeWorkforceProfiles(profiles) {
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return getDefaultWorkforceProfiles();
  }

  return profiles.map(normaliseProfile);
}

export function getWeeklyHours(profile) {
  return (profile?.workingPattern || []).reduce(
    (total, day) => total + Number(day.hours || 0),
    0
  );
}

export function getPatternLabel(profile) {
  const workingDays = (profile?.workingPattern || [])
    .filter((day) => Number(day.hours || 0) > 0)
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  if (workingDays.length === 0) return "No pattern set";

  return workingDays.map((day) => `${day.day.slice(0, 3)} ${day.hours}h`).join(" · ");
}

export function isProfileWorkingOnDate(profile, dateString) {
  const dayName = dateDayName(dateString);
  return (profile?.workingPattern || []).some(
    (day) => day.day === dayName && Number(day.hours || 0) > 0
  );
}

export function getHoursForDate(profile, dateString) {
  const dayName = dateDayName(dateString);
  const match = (profile?.workingPattern || []).find((day) => day.day === dayName);
  return Number(match?.hours || 0);
}

export function getBankHolidayImpact(profile, bankHolidays = BANK_HOLIDAYS_2026_27) {
  const affectedBankHolidays = bankHolidays
    .map((holiday) => ({
      ...holiday,
      day: dateDayName(holiday.date),
      hours: getHoursForDate(profile, holiday.date),
      formattedDate: formatDate(holiday.date),
    }))
    .filter((holiday) => holiday.hours > 0);

  const reservedHours = profile.worksBankHolidays
    ? 0
    : affectedBankHolidays.reduce((total, holiday) => total + holiday.hours, 0);

  return {
    affectedBankHolidays,
    reservedHours,
  };
}

export function calculateHolidayEntitlement(profile) {
  const weeklyHours = getWeeklyHours(profile);
  const totalEntitlementHours = Math.round(weeklyHours * Number(profile.holidayWeeks || 0) * 10) / 10;
  const bankHolidayImpact = getBankHolidayImpact(profile);
  const bookableHours = Math.max(totalEntitlementHours - bankHolidayImpact.reservedHours, 0);

  return {
    weeklyHours,
    holidayWeeks: Number(profile.holidayWeeks || 0),
    totalEntitlementHours,
    bankHolidayHours: bankHolidayImpact.reservedHours,
    bookableHours: Math.round(bookableHours * 10) / 10,
    affectedBankHolidays: bankHolidayImpact.affectedBankHolidays,
  };
}

export function getUsedLeaveHours(profile, requests = [], status = "Approved") {
  return (Array.isArray(requests) ? requests : [])
    .filter((request) => request.staffName === profile.name && request.status === status)
    .reduce((total, request) => total + Number(request.hours || 0), 0);
}

export function enrichWorkforceProfiles(profiles, requests = []) {
  return getSafeWorkforceProfiles(profiles).map((profile) => {
    const entitlement = calculateHolidayEntitlement(profile);
    const approvedHours = getUsedLeaveHours(profile, requests, "Approved");
    const pendingHours = getUsedLeaveHours(profile, requests, "Pending");
    const remainingHours = Math.max(entitlement.bookableHours - approvedHours, 0);
    const monthlyCost = getMonthlyCost(profile);

    return {
      ...profile,
      contractedHours: entitlement.weeklyHours,
      patternLabel: getPatternLabel(profile),
      entitlement,
      approvedHours,
      pendingHours,
      remainingHours: Math.round(remainingHours * 10) / 10,
      monthlyCost,
      annualCost: monthlyCost * 12,
      arrsClaimableMonthly: Math.round(monthlyCost * (Number(profile.arrsClaimablePercent || 0) / 100)),
    };
  });
}

export function getMonthlyCost(profile) {
  const weeklyHours = getWeeklyHours(profile);

  if (profile.payType === "Salary") {
    return Math.round(Number(profile.annualSalary || 0) / 12);
  }

  if (profile.payType === "Daily") {
    const workingDays = (profile.workingPattern || []).filter((day) => Number(day.hours || 0) > 0).length;
    return Math.round(Number(profile.dayRate || 0) * workingDays * 52 / 12);
  }

  return Math.round(Number(profile.hourlyRate || 0) * weeklyHours * 52 / 12);
}

export function getWorkforceFinancialSummary(profiles) {
  const enrichedProfiles = enrichWorkforceProfiles(profiles);

  const totalMonthlyCost = enrichedProfiles.reduce((total, profile) => total + profile.monthlyCost, 0);
  const arrsClaimableMonthly = enrichedProfiles.reduce((total, profile) => total + profile.arrsClaimableMonthly, 0);

  const byBudget = enrichedProfiles.reduce((result, profile) => {
    const key = profile.budget || "Practice";
    result[key] = (result[key] || 0) + profile.monthlyCost;
    return result;
  }, {});

  return {
    totalMonthlyCost,
    annualisedCost: totalMonthlyCost * 12,
    arrsClaimableMonthly,
    practiceMonthlyCost: totalMonthlyCost - arrsClaimableMonthly,
    byBudget,
  };
}

export function getRoomScheduleForDate({ profiles = [], requests = [], date }) {
  const safeProfiles = getSafeWorkforceProfiles(profiles);
  const approvedLeaveNames = new Set(
    (Array.isArray(requests) ? requests : [])
      .filter((request) => request.date === date && request.status === "Approved")
      .map((request) => request.staffName)
  );

  const blockedRooms = ROOM_BLOCKS.filter((block) => block.date === date);
  const blockedRoomNames = new Set(blockedRooms.map((block) => block.room));

  const workingProfiles = safeProfiles
    .filter((profile) => isProfileWorkingOnDate(profile, date))
    .filter((profile) => !approvedLeaveNames.has(profile.name))
    .sort((a, b) => (ROOM_PRIORITY[a.role] || 99) - (ROOM_PRIORITY[b.role] || 99));

  const assignments = [];
  const usedRooms = new Set();
  const conflicts = [];

  workingProfiles.forEach((profile) => {
    const roomChoices = [profile.primaryRoom, profile.secondaryRoom].filter(Boolean);
    const assignedRoom = roomChoices.find(
      (roomName) => !usedRooms.has(roomName) && !blockedRoomNames.has(roomName)
    );

    if (assignedRoom) {
      usedRooms.add(assignedRoom);
      assignments.push({
        staffName: profile.name,
        role: profile.role,
        team: profile.team,
        room: assignedRoom,
        status: "Assigned",
      });
      return;
    }

    conflicts.push({
      staffName: profile.name,
      role: profile.role,
      requestedRooms: roomChoices.join(" / ") || "No room preference set",
      message: `${profile.name} has no available preferred room on ${formatDate(date)}`,
    });
  });

  return {
    date,
    formattedDate: formatDate(date),
    assignments,
    conflicts,
    blockedRooms,
    availableRooms: PRACTICE_ROOMS.filter((room) => !usedRooms.has(room.name) && !blockedRoomNames.has(room.name)),
  };
}

export function getWorkforceAlerts({ profiles = [], requests = [], dates = [] } = {}) {
  const enrichedProfiles = enrichWorkforceProfiles(profiles, requests);
  const lowLeaveBalances = enrichedProfiles.filter((profile) => profile.remainingHours < 15);
  const unpaidPendingLeave = enrichedProfiles.filter((profile) => profile.pendingHours > profile.remainingHours);
  const roomSnapshots = dates.map((date) => getRoomScheduleForDate({ profiles, requests, date }));
  const roomConflicts = roomSnapshots.flatMap((snapshot) =>
    snapshot.conflicts.map((conflict) => ({ ...conflict, date: snapshot.date, formattedDate: snapshot.formattedDate }))
  );

  return {
    lowLeaveBalances,
    unpaidPendingLeave,
    roomSnapshots,
    roomConflicts,
  };
}

export function addContractAmendment(profiles, staffName, amendment) {
  const safeProfiles = getSafeWorkforceProfiles(profiles);

  return safeProfiles.map((profile) => {
    if (profile.name !== staffName) return profile;

    const nextWorkingPattern = amendment.weeklyHours
      ? scaleWorkingPatternToWeeklyHours(profile.workingPattern, Number(amendment.weeklyHours))
      : profile.workingPattern;

    return {
      ...profile,
      budget: amendment.budget || profile.budget,
      payType: amendment.payType || profile.payType,
      hourlyRate: amendment.hourlyRate === "" ? profile.hourlyRate : Number(amendment.hourlyRate || profile.hourlyRate || 0),
      annualSalary: amendment.annualSalary === "" ? profile.annualSalary : Number(amendment.annualSalary || profile.annualSalary || 0),
      primaryRoom: amendment.primaryRoom || profile.primaryRoom,
      secondaryRoom: amendment.secondaryRoom || profile.secondaryRoom,
      workingPattern: nextWorkingPattern,
      contractAmendments: [
        {
          id: `amend-${Date.now()}`,
          effectiveDate: amendment.effectiveDate,
          summary: amendment.summary,
          weeklyHours: amendment.weeklyHours ? Number(amendment.weeklyHours) : getWeeklyHours(profile),
          budget: amendment.budget || profile.budget,
        },
        ...(profile.contractAmendments || []),
      ],
    };
  });
}

function scaleWorkingPatternToWeeklyHours(pattern = [], weeklyHours) {
  const workingDays = pattern.filter((day) => Number(day.hours || 0) > 0);
  if (workingDays.length === 0 || !weeklyHours) return pattern;

  const hoursPerDay = Math.round((weeklyHours / workingDays.length) * 10) / 10;

  return pattern.map((day) => ({
    ...day,
    hours: Number(day.hours || 0) > 0 ? hoursPerDay : 0,
  }));
}

export function createContractAmendment({ effectiveDate, summary, weeklyHours, budget, payType, hourlyRate, annualSalary, primaryRoom, secondaryRoom }) {
  return {
    effectiveDate,
    summary: summary || "Contract details updated",
    weeklyHours,
    budget,
    payType,
    hourlyRate,
    annualSalary,
    primaryRoom,
    secondaryRoom,
  };
}
