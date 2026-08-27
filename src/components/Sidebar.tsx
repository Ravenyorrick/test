import type { NavigationItem } from "../types/voxshift";

const navigation: Array<{ id: NavigationItem; label: string }> = [
  { id: "home", label: "Home" },
  { id: "voices", label: "Voices" },
  { id: "microphone", label: "Microphone" },
  { id: "call-mode", label: "Call Mode" },
  { id: "settings", label: "Settings" },
  { id: "diagnostics", label: "Diagnostics" }
];

type SidebarProps = {
  active: NavigationItem;
  onNavigate: (item: NavigationItem) => void;
  version: string;
};

export function Sidebar({ active, onNavigate, version }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="brand">
        <div className="brand__mark" aria-hidden="true">
          ◉
        </div>
        <div>
          <strong>VOXSHIFT</strong>
          <span>Real-Time Voice</span>
        </div>
      </div>

      <nav className="nav">
        {navigation.map((item) => (
          <button
            className={item.id === active ? "nav__item nav__item--active" : "nav__item"}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="connection">
          <span className="status-dot status-dot--muted" />
          <span>Virtual mic not installed</span>
        </div>
        <span>Version {version}</span>
      </div>
    </aside>
  );
}
