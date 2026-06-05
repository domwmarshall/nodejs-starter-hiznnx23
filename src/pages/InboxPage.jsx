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
import { formatDate, daysUntil, getDueText } from "../utils/dateUtils";

import { inboxItems, inboxQuickFilters } from "../data/inbox";

function GraduationMiniIcon() {
  return <span className="mini-icon">T</span>;
}

export function InboxPage() {
  const [items, setItems] = useLocalStorageState("gpop-inbox-items", inboxItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedItemId, setSelectedItemId] = useState(inboxItems[0].id);

  const enrichedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        dueText: getDueText(item.dueDate),
        daysUntilDue: daysUntil(item.dueDate),
      })),
    [items]
  );

  const filteredItems = enrichedItems.filter((item) => {
    const searchText =
      `${item.title} ${item.module} ${item.type} ${item.assignedTo} ${item.description}`.toLowerCase();

    const matchesSearch = searchText.includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "All" ||
      item.priority === activeFilter ||
      item.status === activeFilter ||
      item.module === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const selectedItem =
    enrichedItems.find((item) => item.id === selectedItemId) || enrichedItems[0];

  const openItems = enrichedItems.filter((item) => item.status === "Open");
  const highPriorityItems = enrichedItems.filter(
    (item) => item.priority === "High" && item.status !== "Done"
  );
  const overdueItems = enrichedItems.filter(
    (item) => item.daysUntilDue < 0 && item.status !== "Done"
  );
  const doneItems = enrichedItems.filter((item) => item.status === "Done");

  function updateItemStatus(itemId, newStatus) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );
  }

  return (
    <>
      <SectionHeader eyebrow="Inbox" title="Notification centre">
        Central command centre for reminders, governance alerts, training, audits,
        rota warnings and operational actions.
      </SectionHeader>

      <section className="metric-grid">
        <MetricCard
          title="Open items"
          value={openItems.length}
          detail="Active alerts and tasks"
          icon={Bell}
        />
        <MetricCard
          title="High priority"
          value={highPriorityItems.length}
          detail="Needs management attention"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Overdue"
          value={overdueItems.length}
          detail="Past due date"
          icon={Clock}
        />
        <MetricCard
          title="Completed"
          value={doneItems.length}
          detail="Marked done in this session"
          icon={CheckCircle2}
        />
      </section>

      <section className="content-grid">
        <div className="panel panel-large">
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
                <button
                  key={filter}
                  type="button"
                  className={
                    activeFilter === filter
                      ? "quick-filter quick-filter-active"
                      : "quick-filter"
                  }
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
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
            renderCell={(row, key) => {
              if (key === "title") {
                return (
                  <button
                    className="text-button"
                    onClick={() => setSelectedItemId(row.id)}
                  >
                    {row.title}
                  </button>
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
        </div>

        <aside className="panel inbox-detail-panel">
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
            <button
              type="button"
              className="primary-button"
              onClick={() => updateItemStatus(selectedItem.id, "Done")}
            >
              Mark done
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => updateItemStatus(selectedItem.id, "Snoozed")}
            >
              Snooze
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => updateItemStatus(selectedItem.id, "Open")}
            >
              Reopen
            </button>
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <div className="panel">
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
              const moduleItems = enrichedItems.filter(
                (item) => item.module === moduleName && item.status !== "Done"
              );

              const highCount = moduleItems.filter(
                (item) => item.priority === "High"
              ).length;

              return (
                <div className="module-alert-card" key={moduleName}>
                  <div>
                    <strong>{moduleName}</strong>
                    <span>{moduleItems.length} open item(s)</span>
                  </div>
                  <Badge>{highCount > 0 ? "High" : "Medium"}</Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
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
        </div>
      </section>
    </>
  );
}