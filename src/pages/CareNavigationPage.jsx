import { AlertTriangle, FileText, ShieldCheck, Stethoscope } from "lucide-react";

import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { SectionHeader } from "../components/SectionHeader";
import { DataTable } from "../components/DataTable";

import { pathways } from "../data/careNavigation";

export function CareNavigationPage() {
  return (
    <>
      <SectionHeader eyebrow="Care Navigation" title="Reception care navigation">
        Future module for telephone call documentation, symptom search, safety questions, pathway prompts and SystmOne-ready notes.
      </SectionHeader>

      <section className="danger-banner">
        <AlertTriangle size={24} />
        <div>
          <strong>High-risk module — governance required</strong>
          <p>
            This must not be used with real patients until pathway approval, clinical safety review,
            information governance review and local operational sign-off are completed.
          </p>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard title="Calls today" value="0" detail="Mock only" icon={Stethoscope} />
        <MetricCard title="Red flags" value="0" detail="Not active yet" icon={AlertTriangle} />
        <MetricCard title="Draft pathways" value={pathways.length} detail="No approved pathways" icon={FileText} />
        <MetricCard title="Approval" value="0%" detail="Clinical review required" icon={ShieldCheck} />
      </section>

      <section className="panel">
        <DataTable
          columns={[
            { key: "name", label: "Pathway" },
            { key: "version", label: "Version" },
            { key: "source", label: "Source labels" },
            { key: "status", label: "Status" },
            { key: "note", label: "Note" },
          ]}
          rows={pathways}
          renderCell={(row, key) => {
            if (key === "name") return <strong>{row.name}</strong>;
            if (key === "status") return <Badge>{row.status}</Badge>;
            return row[key];
          }}
        />
      </section>
    </>
  );
}