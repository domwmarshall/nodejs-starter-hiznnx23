import { Building2, Clock, FileText, PoundSterling } from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";

import { financeItems } from "../data/finance";

export function FinancePage() {
  return (
    <>
      <SectionHeader eyebrow="Finance" title="Finance & dispensary profitability">
        Future module for CQRS reminders, expected payments, wages, ARRS allocation, drug invoices and GPP CSV imports.
      </SectionHeader>

      <section className="metric-grid">
        <MetricCard title="Expected payments" value="£0" detail="Mock only" icon={PoundSterling} />
        <MetricCard title="Outstanding invoices" value="0" detail="Not connected yet" icon={FileText} />
        <MetricCard title="CQRS reminders" value="1" detail="Mock reminder" icon={Clock} />
        <MetricCard title="Dispensary P&L" value="Planned" detail="Future import module" icon={Building2} />
      </section>

      <section className="panel">
        <DataTable
          columns={[
            { key: "item", label: "Item" },
            { key: "area", label: "Area" },
            { key: "status", label: "Status" },
            { key: "note", label: "Note" },
          ]}
          rows={financeItems}
          renderCell={(row, key) => {
            if (key === "item") return <strong>{row.item}</strong>;
            if (key === "status") return <Badge>{row.status}</Badge>;
            return row[key];
          }}
        />
      </section>
    </>
  );
}