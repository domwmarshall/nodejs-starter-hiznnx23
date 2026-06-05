import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { formatDate } from "../utils/dateUtils";

import { inboxItems, inboxQuickFilters } from "../data/inbox";

import {
  INBOX_STORAGE_KEY,
  enrichInboxItems,
  filterInboxItems,
  getInboxMetrics,
  getInboxModuleSummary,
  updateInboxItemStatus,
} from "../services/inboxService";

import {
  AlertBanner,
  Button,
  PageHeader,
  Panel,
} from "../components/ui";

function GraduationMiniIcon() {
  return <span className="mini-icon">T</span>;
}

export function InboxPage() {
  const [items, setItems] = useLocalStorageState(INBOX_STORAGE_KEY, inboxItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedItemId, setSelectedItemId] = useState(inboxItems[0].id);

  const enrichedItems = useMemo(() => enrichInboxItems(items), [items]);

  const filteredItems = useMemo(
    () => filterInboxItems(enrichedItems, searchTerm, activeFilter),
    [enrichedItems, searchTerm, activeFilter]
  );

  const metrics = useMemo(() => getInboxMetrics(items), [items]);

  const selectedItem =
    enrichedItems.find((item) => item.id === selectedItemId) || enrichedItems[0];

  function updateItemStatus(itemId, newStatus) {
    setItems((currentItems) =>
      updateInboxItemStatus(currentItems, itemId, newStatus)
    );
  }

  return (
    <>
      <PageHeader eyebrow="Inbox" title="Notification centre">
        Central command centre for reminders, governance alerts, training,
        audits, rota warnings and operational actions.
      </PageHeader>

      <section className="metric-grid">
        <MetricCard
          title="Open items"
          value={metrics.openItems.length}
          detail="Active alerts and tasks"
          icon={Bell}
        />
        <MetricCard
          title="High priority"
          value={metrics.highPriorityItems.length}
          detail="Needs management attention"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Overdue"
          value={metrics.overdueItems.length}
          detail="Past due date"
          icon={Clock}
        />
        <MetricCard
          title="Completed"
          value={metrics.doneItems.length}
          detail="Marked done in this session"
          icon={CheckCircle2}
        />
      </section>

      {metrics.overdueItems.length > 0 ? (
        <AlertBanner
          tone="warning"
          title="Overdue inbox items"
          icon={AlertTriangle}
        >
          {metrics.overdueItems.length} inbox item
          {metrics.overdueItems.length === 1 ? " is" : "s are"} overdue and may
          need management attention.
        </AlertBanner>
      ) : null}

      <section className="content-grid">
        <Panel className="panel panel-large">
          <SectionHeader eyebrow="Inbox list" title="Action queue">
            Search, filter and select an item. Buttons update mock state and now
            survive refresh using localStorage.
          </SectionHeader>

          <div className="inbox-toolbar">
            <label className="search-input">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search alerts, modules, owners..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="quick-filter-list">
              {inboxQuickFilters.map((filter) => (
                <Button
                  key={filter}
                  type="button"
                  size="sm"
                  variant={activeFilter === filter ? "primary" : "secondary"}
                  className={
                    activeFilter === filter
                      ? "quick-filter quick-filter-active"
                      : "quick-filter"
                  }
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          <DataTable
            columns={[
              { key: "title", label: "Item" },
              { key: "module", label: "Module" },
              { key: "priority", label: "Priority" },
              { key: "assignedTo", label: "Assigned to" },
              { key: "dueDate", label: "Due" },
              { key: "status", label: "Status" },
            ]}
            rows={filteredItems}
            emptyTitle="No inbox items found"
            emptyMessage="Try clearing the search box or changing the quick filter."
            renderCell={(row, key) => {
              if (key === "title") {
                return (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-button"
                    style={{ padding: 0, justifyContent: "flex-start" }}
                    onClick={() => setSelectedItemId(row.id)}
                  >
                    {row.title}
                  </Button>
                );
              }

              if (key === "module" || key === "priority" || key === "status") {
                return <Badge>{row[key]}</Badge>;
              }

              if (key === "dueDate") {
                return (
                  <div className="stacked-cell">
                    <strong>{formatDate(row.dueDate)}</strong>
                    <span>{row.dueText}</span>
                  </div>
                );
              }

              return row[key];
            }}
          />
        </Panel>

        <Panel as="aside" className="panel inbox-detail-panel">
          <SectionHeader eyebrow="Selected item" title={selectedItem.title}>
            {selectedItem.description}
          </SectionHeader>

          <div className="policy-detail-grid">
            <div>
              <span>Module</span>
              <Badge>{selectedItem.module}</Badge>
            </div>
            <div>
              <span>Priority</span>
              <Badge>{selectedItem.priority}</Badge>
            </div>
            <div>
              <span>Type</span>
              <strong>{selectedItem.type}</strong>
            </div>
            <div>
              <span>Status</span>
              <Badge>{selectedItem.status}</Badge>
            </div>
            <div>
              <span>Assigned to</span>
              <strong>{selectedItem.assignedTo}</strong>
            </div>
            <div>
              <span>Due date</span>
              <strong>{formatDate(selectedItem.dueDate)}</strong>
            </div>
            <div>
              <span>Due status</span>
              <strong>{selectedItem.dueText}</strong>
            </div>
            <div>
              <span>Suggested action</span>
              <strong>{selectedItem.action}</strong>
            </div>
          </div>

          <div className="policy-actions">
            <Button
              type="button"
              variant="primary"
              onClick={() => updateItemStatus(selectedItem.id, "Done")}
            >
              Mark done
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => updateItemStatus(selectedItem.id, "Snoozed")}
            >
              Snooze
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => updateItemStatus(selectedItem.id, "Open")}
            >
              Reopen
            </Button>
          </div>
        </Panel>
      </section>

      <section className="content-grid">
        <Panel className="panel">
          <SectionHeader eyebrow="Module summary" title="Alerts by module">
            A future version will generate these automatically from each module.
          </SectionHeader>

          <div className="module-alert-grid">
            {[
              "Compliance",
              "Training",
              "Audits",
              "Calendar",
              "Staff",
              "Finance",
              "Care Navigation",
            ].map((moduleName) => {
              const moduleSummary = getInboxModuleSummary(items, moduleName);

              return (
                <div className="module-alert-card" key={moduleName}>
                  <div>
                    <strong>{moduleName}</strong>
                    <span>{moduleSummary.moduleItems.length} open item(s)</span>
                  </div>
                  <Badge>{moduleSummary.riskLabel}</Badge>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel className="panel">
          <SectionHeader eyebrow="Governance" title="Inbox rules planned">
            These rules will decide what appears here automatically.
          </SectionHeader>

          <div className="rule-list">
            <div>
              <ShieldCheck size={18} />
              <span>Overdue policy reviews create high-priority alerts</span>
            </div>
            <div>
              <GraduationMiniIcon />
              <span>Overdue training creates staff-specific reminders</span>
            </div>
            <div>
              <Clock size={18} />
              <span>Daily audits create same-day completion alerts</span>
            </div>
            <div>
              <AlertTriangle size={18} />
              <span>High-risk modules create governance alerts</span>
            </div>
          </div>
        </Panel>
      </section>
    </>
  );
}