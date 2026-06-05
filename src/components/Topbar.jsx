import { Badge } from "./Badge";
import { QuickModuleJump } from "./QuickModuleJump";
import { UserSwitcher } from "./UserSwitcher";

export function Topbar({
  activeModule,
  modules,
  activePage,
  onNavigate,
  users,
  activeUser,
  onUserChange,
}) {
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
        <UserSwitcher
          users={users}
          activeUser={activeUser}
          onChange={onUserChange}
        />

        <QuickModuleJump
          modules={modules}
          activePage={activePage}
          onNavigate={onNavigate}
        />

        <div className="topbar-badges">
          <Badge>
            {activeModule.enabled === false ? "Unavailable" : activeModule.status}
          </Badge>
          <Badge>{activeModule.roleAccess || "View"}</Badge>
          <Badge>{activeModule.risk} risk</Badge>
        </div>
      </div>
    </header>
  );
}
