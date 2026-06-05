import {
  AlertTriangle,
  Database,
  Lock,
  ShieldCheck,
  ToggleRight,
  UserRound,
} from "lucide-react";

import { Badge } from "./Badge";

export function AppStatusStrip({ metrics, activeUser }) {
  return (
    <section className="app-status-strip" aria-label="Application status summary">
      <div className="app-status-item">
        <UserRound size={18} />
        <div>
          <span>Current role</span>
          <strong>{activeUser.role}</strong>
        </div>
      </div>

      <div className="app-status-item">
        <ToggleRight size={18} />
        <div>
          <span>Available modules</span>
          <strong>{metrics.enabledCount}/{metrics.totalModules}</strong>
        </div>
      </div>

      <div className="app-status-item">
        <Lock size={18} />
        <div>
          <span>Unavailable</span>
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
