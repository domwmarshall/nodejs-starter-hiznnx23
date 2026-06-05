import { AlertTriangle, Database, Lock, ShieldCheck, ToggleRight } from "lucide-react";

import { Badge } from "./Badge";

export function AppStatusStrip({ metrics }) {
  return (
    <section className="app-status-strip" aria-label="Application status summary">
      <div className="app-status-item">
        <ToggleRight size={18} />
        <div>
          <span>Enabled modules</span>
          <strong>{metrics.enabledCount}/{metrics.totalModules}</strong>
        </div>
      </div>

      <div className="app-status-item">
        <Lock size={18} />
        <div>
          <span>Disabled</span>
          <strong>{metrics.disabledCount}</strong>
        </div>
      </div>

      <div className="app-status-item">
        <AlertTriangle size={18} />
        <div>
          <span>High risk</span>
          <strong>{metrics.highRiskCount}</strong>
        </div>
      </div>

      <div className="app-status-item app-status-item-wide">
        <Database size={18} />
        <div>
          <span>Persistence</span>
          <strong>Browser localStorage</strong>
        </div>
      </div>

      <div className="app-status-badge">
        <ShieldCheck size={18} />
        <Badge>Dummy data only</Badge>
      </div>
    </section>
  );
}
