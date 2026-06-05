import { AlertTriangle, Lock } from "lucide-react";

export function Sidebar({ modules, activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div
        className="brand-block brand-card-force"
        style={{
          background: "linear-gradient(135deg, #005eb8, #003087)",
          color: "white",
          borderRadius: "24px",
          padding: "18px",
          marginBottom: "22px",
          boxShadow: "0 18px 35px rgba(0, 94, 184, 0.22)",
        }}
      >
        <div
          className="brand-topline"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "white",
              fontWeight: 900,
              letterSpacing: "0.1em",
              fontSize: "13px",
            }}
          >
            GPOP
          </p>

          <span
            style={{
              background: "rgba(255, 255, 255, 0.16)",
              border: "1px solid rgba(255, 255, 255, 0.35)",
              color: "white",
              borderRadius: "999px",
              padding: "4px 9px",
              fontSize: "11px",
              fontWeight: 950,
            }}
          >
            v0.1
          </span>
        </div>

        <h1
          style={{
            margin: "8px 0 0",
            color: "white",
            fontSize: "19px",
            lineHeight: 1.12,
          }}
        >
          General Practice Operations Portal
        </h1>

        <small
          style={{
            display: "block",
            marginTop: "10px",
            color: "white",
            opacity: 0.86,
            fontSize: "13px",
            fontWeight: 800,
          }}
        >
          Prototype operations hub
        </small>
      </div>

      <nav className="nav-list" aria-label="Primary navigation">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activePage === module.id;
          const isDisabled = module.enabled === false;

          return (
            <button
              key={module.id}
              type="button"
              className={[
                "nav-item",
                isActive ? "nav-item-active" : "",
                isDisabled ? "nav-item-disabled" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onNavigate(module.id)}
              title={isDisabled ? module.lockReason || `${module.name} is unavailable` : module.name}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{module.name}</span>
              {isDisabled ? <Lock size={14} className="nav-lock" /> : null}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-warning">
        <AlertTriangle size={18} />
        <p>
          <strong>Prototype only.</strong>
          <br />
          Do not upload patient-identifiable data.
        </p>
      </div>
    </aside>
  );
}