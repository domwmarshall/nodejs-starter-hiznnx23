import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Clock,
  FileText,
  PoundSterling,
  Search,
  Upload,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { formatDate, getDueText } from "../utils/dateUtils";

import {
  financeOverview,
  expectedPayments,
  dispensaryProfitLines,
  budgetAllocations,
  invoicePlaceholders,
} from "../data/finance";

import {
  FINANCE_TASKS_STORAGE_KEY,
  enrichExpectedPayments,
  filterExpectedPayments,
  formatMoney,
  getBudgetTotals,
  getDefaultFinanceTasks,
  getDispensaryMargin,
  getFinanceTaskMetrics,
  getPaymentTotals,
  updateFinanceTaskStatus,
} from "../services/financeService";

export function FinancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState(expectedPayments[0].id);

  const [tasks, setTasks] = useLocalStorageState(
    FINANCE_TASKS_STORAGE_KEY,
    getDefaultFinanceTasks()
  );

  const enrichedPayments = useMemo(
    () => enrichExpectedPayments(expectedPayments),
    []
  );

  const filteredPayments = useMemo(
    () => filterExpectedPayments(enrichedPayments, searchTerm),
    [enrichedPayments, searchTerm]
  );

  const selectedPayment =
    enrichedPayments.find((payment) => payment.id === selectedPaymentId) ||
    enrichedPayments[0];

  const taskMetrics = useMemo(() => getFinanceTaskMetrics(tasks), [tasks]);
  const paymentTotals = useMemo(() => getPaymentTotals(expectedPayments), []);
  const dispensaryMargin = useMemo(() => getDispensaryMargin(), []);
  const budgetTotals = useMemo(() => getBudgetTotals(), []);

  function updateTaskStatus(taskId, newStatus) {
    setTasks((currentTasks) =>
      updateFinanceTaskStatus(currentTasks, taskId, newStatus)
    );
  }

  return (
    <>
      <SectionHeader eyebrow="Finance" title="Finance & dispensary profitability">
        Finance v1 tracks expected payments, CQRS tasks, invoice placeholders,
        budget allocation and mock dispensary profitability. No real financial
        data is connected yet.
      </SectionHeader>

      <section className="metric-grid">
        <MetricCard
          title="Expected income"
          value={formatMoney(paymentTotals.totalExpected)}
          detail={`${formatMoney(paymentTotals.totalReceived)} received`}
          icon={PoundSterling}
        />
        <MetricCard
          title="Outstanding"
          value={formatMoney(paymentTotals.outstanding)}
          detail="Expected but not yet received"
          icon={Clock}
        />
        <MetricCard
          title="Dispensary margin"
          value={formatMoney(dispensaryMargin)}
          detail="Mock line-level estimate"
          icon={Building2}
        />
        <MetricCard
          title="Open finance tasks"
          value={taskMetrics.openTasks.length}
          detail={`${taskMetrics.highPriorityTasks.length} high priority`}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Monthly costs"
          value={formatMoney(budgetTotals.totalMonthlyCosts)}
          detail={`${formatMoney(budgetTotals.totalReclaimable)} reclaimable`}
          icon={FileText}
        />
        <MetricCard
          title="Invoice uploads"
          value={invoicePlaceholders.length}
          detail="Placeholder supplier invoices"
          icon={Upload}
        />
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
          <SectionHeader eyebrow="Expected payments" title="Payment tracker">
            Search expected income and select a payment to view details. This is
            mock data only for now.
          </SectionHeader>

          <div className="compliance-toolbar">
            <label className="search-input">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search payments, categories, notes..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="finance-summary-chip">
              <strong>{formatMoney(paymentTotals.outstanding)}</strong>
              <span>Outstanding</span>
            </div>
          </div>

          <DataTable
            columns={[
              { key: "source", label: "Source" },
              { key: "category", label: "Category" },
              { key: "expectedDate", label: "Expected date" },
              { key: "expectedAmount", label: "Expected" },
              { key: "receivedAmount", label: "Received" },
              { key: "variance", label: "Variance" },
              { key: "status", label: "Status" },
            ]}
            rows={filteredPayments}
            emptyTitle="No payments found"
            emptyMessage="Try clearing the search box."
            renderCell={(row, key) => {
              if (key === "source") {
                return (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setSelectedPaymentId(row.id)}
                  >
                    {row.source}
                  </button>
                );
              }

              if (key === "expectedDate") {
                return (
                  <div className="stacked-cell">
                    <strong>{formatDate(row.expectedDate)}</strong>
                    <span>{row.dueText}</span>
                  </div>
                );
              }

              if (
                key === "expectedAmount" ||
                key === "receivedAmount" ||
                key === "variance"
              ) {
                return formatMoney(row[key]);
              }

              if (key === "status" || key === "category") {
                return <Badge>{row[key]}</Badge>;
              }

              return row[key];
            }}
          />
        </div>

        <aside className="panel policy-detail-panel">
          <SectionHeader eyebrow="Selected payment" title={selectedPayment.source}>
            {selectedPayment.note}
          </SectionHeader>

          <div className="policy-detail-grid">
            <div>
              <span>Category</span>
              <Badge>{selectedPayment.category}</Badge>
            </div>
            <div>
              <span>Status</span>
              <Badge>{selectedPayment.status}</Badge>
            </div>
            <div>
              <span>Expected date</span>
              <strong>{formatDate(selectedPayment.expectedDate)}</strong>
            </div>
            <div>
              <span>Due status</span>
              <strong>{selectedPayment.dueText}</strong>
            </div>
            <div>
              <span>Expected amount</span>
              <strong>{formatMoney(selectedPayment.expectedAmount)}</strong>
            </div>
            <div>
              <span>Received amount</span>
              <strong>{formatMoney(selectedPayment.receivedAmount)}</strong>
            </div>
            <div>
              <span>Variance</span>
              <strong>{formatMoney(selectedPayment.variance)}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <div className="panel">
          <SectionHeader eyebrow="Tasks" title="Finance action queue">
            These task statuses persist in browser localStorage.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "title", label: "Task" },
              { key: "area", label: "Area" },
              { key: "owner", label: "Owner" },
              { key: "dueDate", label: "Due" },
              { key: "priority", label: "Priority" },
              { key: "status", label: "Status" },
              { key: "actions", label: "Actions" },
            ]}
            rows={tasks}
            renderCell={(row, key) => {
              if (key === "title") return <strong>{row.title}</strong>;

              if (key === "dueDate") {
                return (
                  <div className="stacked-cell">
                    <strong>{formatDate(row.dueDate)}</strong>
                    <span>{getDueText(row.dueDate)}</span>
                  </div>
                );
              }

              if (key === "priority" || key === "status" || key === "area") {
                return <Badge>{row[key]}</Badge>;
              }

              if (key === "actions") {
                return (
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="small-button approve-button"
                      onClick={() => updateTaskStatus(row.id, "Done")}
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      className="small-button settings-toggle-button"
                      onClick={() => updateTaskStatus(row.id, "Snoozed")}
                    >
                      Snooze
                    </button>
                    <button
                      type="button"
                      className="small-button reject-button"
                      onClick={() => updateTaskStatus(row.id, "Open")}
                    >
                      Reopen
                    </button>
                  </div>
                );
              }

              return row[key];
            }}
          />
        </div>

        <div className="panel">
          <SectionHeader eyebrow="Overview" title="Monthly position">
            Mock management summary for the selected finance period.
          </SectionHeader>

          <div className="finance-overview-grid">
            <div>
              <span>Month</span>
              <strong>{financeOverview.month}</strong>
            </div>
            <div>
              <span>Expected income</span>
              <strong>{formatMoney(financeOverview.expectedIncome)}</strong>
            </div>
            <div>
              <span>Confirmed income</span>
              <strong>{formatMoney(financeOverview.confirmedIncome)}</strong>
            </div>
            <div>
              <span>Expected costs</span>
              <strong>{formatMoney(financeOverview.expectedCosts)}</strong>
            </div>
            <div>
              <span>Estimated surplus</span>
              <strong>{formatMoney(financeOverview.estimatedSurplus)}</strong>
            </div>
            <div>
              <span>Dispensary profit estimate</span>
              <strong>{formatMoney(financeOverview.dispensaryEstimatedProfit)}</strong>
            </div>
          </div>

          {taskMetrics.overdueTasks.length > 0 ? (
            <div className="danger-banner compact-danger">
              <AlertTriangle size={22} />
              <div>
                <strong>Overdue finance tasks</strong>
                <p>
                  {taskMetrics.overdueTasks.length} finance task
                  {taskMetrics.overdueTasks.length === 1 ? " is" : "s are"} overdue.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <SectionHeader eyebrow="Dispensary" title="Profitability snapshot">
            Mock line-level view to support future GPP, invoice and e-CASS
            reconciliation.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "item", label: "Item" },
              { key: "supplierCost", label: "Supplier cost" },
              { key: "reimbursement", label: "Reimbursement" },
              { key: "margin", label: "Margin" },
              { key: "status", label: "Status" },
            ]}
            rows={dispensaryProfitLines}
            renderCell={(row, key) => {
              if (key === "item") return <strong>{row.item}</strong>;
              if (
                key === "supplierCost" ||
                key === "reimbursement" ||
                key === "margin"
              ) {
                return formatMoney(row[key]);
              }
              if (key === "status") return <Badge>{row.status}</Badge>;
              return row[key];
            }}
          />
        </div>

        <div className="panel">
          <SectionHeader eyebrow="Budgets" title="Wage and budget allocation">
            Mock split between practice, dispensary and ARRS budget areas.
          </SectionHeader>

          <DataTable
            columns={[
              { key: "area", label: "Area" },
              { key: "budget", label: "Budget" },
              { key: "monthlyCost", label: "Monthly cost" },
              { key: "reclaimable", label: "Reclaimable" },
              { key: "status", label: "Status" },
            ]}
            rows={budgetAllocations}
            renderCell={(row, key) => {
              if (key === "area") return <strong>{row.area}</strong>;
              if (key === "monthlyCost" || key === "reclaimable") {
                return formatMoney(row[key]);
              }
              if (key === "budget" || key === "status") return <Badge>{row[key]}</Badge>;
              return row[key];
            }}
          />
        </div>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Invoices" title="Supplier invoice placeholders">
          Future version: upload supplier invoice files, extract line items, match
          against GPP/e-CASS reimbursement and flag losses.
        </SectionHeader>

        <DataTable
          columns={[
            { key: "supplier", label: "Supplier" },
            { key: "invoiceMonth", label: "Month" },
            { key: "amount", label: "Amount" },
            { key: "status", label: "Status" },
            { key: "note", label: "Note" },
          ]}
          rows={invoicePlaceholders}
          renderCell={(row, key) => {
            if (key === "supplier") return <strong>{row.supplier}</strong>;
            if (key === "amount") return formatMoney(row.amount);
            if (key === "status") return <Badge>{row.status}</Badge>;
            return row[key];
          }}
        />
      </section>
    </>
  );
}