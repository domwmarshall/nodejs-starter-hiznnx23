import {
    expectedPayments,
    financeTasks,
    dispensaryProfitLines,
    budgetAllocations,
    invoicePlaceholders,
    financeOverview,
  } from "../data/finance";
  
  import { daysUntil, getDueText } from "../utils/dateUtils";
  import { SETTINGS_STORAGE_KEYS } from "./settingsService";
  
  export const FINANCE_TASKS_STORAGE_KEY = SETTINGS_STORAGE_KEYS.financeTasks;
  
  export function formatMoney(value) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
  
  export function getDefaultFinanceTasks() {
    return financeTasks;
  }
  
  export function enrichExpectedPayments(payments = expectedPayments) {
    const safePayments = Array.isArray(payments) ? payments : expectedPayments;
  
    return safePayments.map((payment) => ({
      ...payment,
      variance: payment.receivedAmount - payment.expectedAmount,
      daysUntilDue: daysUntil(payment.expectedDate),
      dueText: getDueText(payment.expectedDate),
    }));
  }
  
  export function filterExpectedPayments(payments, searchTerm) {
    const safePayments = Array.isArray(payments) ? payments : [];
  
    return safePayments.filter((payment) => {
      const searchText =
        `${payment.source} ${payment.category} ${payment.status} ${payment.note}`.toLowerCase();
  
      return searchText.includes(searchTerm.toLowerCase());
    });
  }
  
  export function getFinanceTaskMetrics(tasks = financeTasks) {
    const safeTasks = Array.isArray(tasks) ? tasks : financeTasks;
  
    const openTasks = safeTasks.filter((task) => task.status === "Open");
  
    const highPriorityTasks = safeTasks.filter(
      (task) => task.priority === "High" && task.status !== "Done"
    );
  
    const overdueTasks = safeTasks.filter(
      (task) => daysUntil(task.dueDate) < 0 && task.status !== "Done"
    );
  
    return {
      openTasks,
      highPriorityTasks,
      overdueTasks,
    };
  }
  
  export function getPaymentTotals(payments = expectedPayments) {
    const enrichedPayments = enrichExpectedPayments(payments);
  
    const totalExpected = enrichedPayments.reduce(
      (total, payment) => total + payment.expectedAmount,
      0
    );
  
    const totalReceived = enrichedPayments.reduce(
      (total, payment) => total + payment.receivedAmount,
      0
    );
  
    const outstanding = totalExpected - totalReceived;
  
    return {
      totalExpected,
      totalReceived,
      outstanding,
    };
  }
  
  export function getDispensaryMargin() {
    return dispensaryProfitLines.reduce((total, line) => total + line.margin, 0);
  }
  
  export function getBudgetTotals() {
    const totalMonthlyCosts = budgetAllocations.reduce(
      (total, item) => total + item.monthlyCost,
      0
    );
  
    const totalReclaimable = budgetAllocations.reduce(
      (total, item) => total + item.reclaimable,
      0
    );
  
    return {
      totalMonthlyCosts,
      totalReclaimable,
    };
  }
  
  export function updateFinanceTaskStatus(tasks, taskId, newStatus) {
    const safeTasks = Array.isArray(tasks) ? tasks : financeTasks;
  
    return safeTasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
          }
        : task
    );
  }
  
  export function getFinanceStaticData() {
    return {
      financeOverview,
      expectedPayments,
      financeTasks,
      dispensaryProfitLines,
      budgetAllocations,
      invoicePlaceholders,
    };
  }