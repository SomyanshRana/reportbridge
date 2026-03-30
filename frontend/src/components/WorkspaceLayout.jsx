import { useContext } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Layers, LogOut, ChevronLeft, ChevronRight, Plus, Zap } from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { InspectorProvider, InspectorContext } from "../contexts/InspectorContext";
import { toast } from "sonner";

const NAV_ITEMS = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/clients", label: "Clients", icon: Users },
  { to: "/app/reports/new", label: "New Report", icon: FileText },
  { to: "/app/templates", label: "Templates", icon: Layers },
];

function LeftSidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("Logged out");
  };

  return (
    <div
      data-testid="left-sidebar"
      className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden no-print"
    >
      {/* Logo */}
      <div className="px-4 py-3 border-b border-gray-200">
        <span className="font-mono text-sm font-semibold text-gray-900">ReportBridge</span>
        <span className="ml-2 font-mono text-[10px] text-cyan-500 bg-cyan-50 px-1 py-0.5 rounded-sm border border-cyan-200">v2.0</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-cyan-50 text-cyan-600 border-r-2 border-cyan-500 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Icon size={16} />
            <span className="font-sans">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Keyboard shortcuts */}
      <div className="px-3 py-2 border-t border-gray-100 space-y-1">
        <button
          onClick={() => navigate("/app/reports/new")}
          data-testid="shortcut-new-report"
          className="w-full flex items-center gap-2 px-2 py-1 text-left hover:bg-gray-50 rounded-sm transition-colors"
        >
          <span className="font-mono text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-1 rounded">⌘N</span>
          <span className="font-mono text-[10px] text-gray-500">New Report</span>
        </button>
      </div>

      {/* Plan indicator */}
      <div className="px-3 py-2.5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400">Starter Plan</span>
          <button
            data-testid="sidebar-upgrade-link"
            onClick={() => toast.info("Upgrade coming soon — enjoy Starter plan for now")}
            className="font-mono text-[9px] text-cyan-500 hover:text-cyan-600 transition-colors"
          >
            Upgrade →
          </button>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-1 bg-cyan-500 rounded-full" style={{ width: "40%" }} />
        </div>
        <p className="font-mono text-[9px] text-gray-400 mt-1">Free tier · unlimited PDF exports</p>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
          <span className="font-mono text-[10px] text-cyan-700">{user?.name?.[0]?.toUpperCase() || "U"}</span>
        </div>
        <span className="font-mono text-xs text-gray-600 flex-1 truncate">{user?.email}</span>
        <button
          onClick={handleLogout}
          data-testid="logout-btn"
          title="Log out"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}

function RightInspector() {
  const { content } = useContext(InspectorContext);

  return (
    <div
      data-testid="right-inspector"
      className="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden no-print"
    >
      <div className="px-4 py-2 border-b border-gray-200">
        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Inspector</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {content || <DefaultInspector />}
      </div>

      {/* Typography */}
      <div className="border-t border-gray-100 p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">Typography</p>
        <div className="grid grid-cols-[80px_1fr] gap-y-1.5 text-[10px]">
          <span className="font-mono text-gray-400">font-family</span>
          <span className="font-mono text-gray-600">Inter, JetBrains Mono</span>
          <span className="font-mono text-gray-400">font-size</span>
          <span className="font-mono text-gray-600">10px – 18px</span>
          <span className="font-mono text-gray-400">line-height</span>
          <span className="font-mono text-gray-600">1.5</span>
        </div>
      </div>

      {/* Colors */}
      <div className="border-t border-gray-100 p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">Colors</p>
        <div className="space-y-1.5">
          {[["#06B6D4","Accent Cyan"],["#f3f4f6","Background"],["#ffffff","Panel"],["#111827","Text Primary"]].map(([hex, name]) => (
            <div key={hex} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm border border-gray-200 flex-shrink-0" style={{ backgroundColor: hex }} />
              <span className="font-mono text-[10px] text-gray-500">{hex}</span>
              <span className="font-mono text-[10px] text-gray-400">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DefaultInspector() {
  return (
    <div className="p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">Quick Actions</p>
      <div className="space-y-2">
        <NavLink to="/app/reports/new" className="flex items-center gap-2 text-xs font-sans text-cyan-600 hover:text-cyan-700">
          <Plus size={12} /> New Report
        </NavLink>
        <NavLink to="/app/clients" className="flex items-center gap-2 text-xs font-sans text-gray-500 hover:text-gray-700">
          <Users size={12} /> Manage Clients
        </NavLink>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="font-mono text-[10px] text-gray-400">Select a report to inspect its properties and export options.</p>
      </div>
    </div>
  );
}

function WorkspaceBrowserBar() {
  const location = useLocation();
  const pageName = location.pathname.split("/").filter(Boolean).pop() || "dashboard";

  return (
    <div className="bg-gray-100 border-b border-gray-200 no-print">
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex gap-1 text-gray-400">
          <button className="p-1 hover:text-gray-600 transition-colors" aria-label="Back"><ChevronLeft size={13} /></button>
          <button className="p-1 hover:text-gray-600 transition-colors" aria-label="Forward"><ChevronRight size={13} /></button>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-gray-500 flex-1 max-w-sm">
          <span className="text-gray-300">app.reportbridge.io/</span>
          <span className="text-gray-600">{pageName}</span>
        </div>
        {/* Active tab */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-t-2 border-t-cyan-500 border-x border-gray-200 text-xs font-sans text-gray-700 rounded-t-sm -mb-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-100 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-cyan-500" />
          </div>
          ReportBridge
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            data-testid="upgrade-btn"
            onClick={() => toast.info("Upgrade coming soon — you're on Starter plan")}
            className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] text-cyan-600 bg-cyan-50 border border-cyan-200 rounded-sm hover:bg-cyan-100 transition-colors"
          >
            <Zap size={9} /> Upgrade
          </button>
          <div className="w-8 h-7 rounded bg-cyan-50 border border-cyan-200 flex items-center justify-center">
            <span className="font-mono text-[10px] text-cyan-600 font-semibold">RB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspaceContent() {
  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <WorkspaceBrowserBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main
          data-testid="center-stage"
          className="flex-1 overflow-y-auto bg-gray-100"
          style={{ backgroundImage: "repeating-linear-gradient(#e5e7eb 0 1px, transparent 1px 20px), repeating-linear-gradient(90deg, #e5e7eb 0 1px, transparent 1px 20px)", backgroundSize: "20px 20px", backgroundOpacity: 0.3 }}
        >
          <Outlet />
        </main>
        <RightInspector />
      </div>
    </div>
  );
}

export default function WorkspaceLayout() {
  return (
    <InspectorProvider>
      <WorkspaceContent />
    </InspectorProvider>
  );
}
