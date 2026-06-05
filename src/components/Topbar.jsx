import { Badge } from "./Badge";
import { QuickModuleJump } from "./QuickModuleJump";

export function Topbar({ activeModule, modules, activePage, onNavigate }) {
  return (
    <header className="topbar">
      <div>
        <p className="topbar-label">Current module</p>
        <h2>{activeModule.name}</h2>
        {activeModule.summary ? (
          <p className="topbar-summary">{activeModule.summary}</p>
        ) : null}
      </div>

      <div className="topbar-actions">
        <QuickModuleJump
          modules={modules}
          activePage={activePage}
          onNavigate={onNavigate}
        />

        <div className="topbar-badges">
          <Badge>
            {activeModule.enabled === false ? "Disabled" : activeModule.status}
          </Badge>
          <Badge>{activeModule.risk} risk</Badge>
        </div>
      </div>
    </header>
  );
}
