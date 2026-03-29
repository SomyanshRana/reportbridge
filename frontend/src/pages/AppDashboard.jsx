import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { FileText, Plus, Users, Layers, ArrowRight, Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useInspector } from "../contexts/InspectorContext";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-500",
  uploaded: "bg-blue-50 text-blue-600",
  mapped: "bg-yellow-50 text-yellow-600",
  complete: "bg-green-50 text-green-600",
};

export default function AppDashboard() {
  const [reports, setReports] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setContent } = useInspector();

  useEffect(() => {
    // Onboarding redirect: new users (signup OR first login) are sent to demo preview
    const demoReportId = sessionStorage.getItem("onboarding_demo_report");
    if (demoReportId) {
      sessionStorage.removeItem("onboarding_demo_report");
      navigate(`/app/reports/${demoReportId}/preview`);
      return;
    }

    const fetchData = async () => {
      try {
        const [rRes, cRes] = await Promise.all([
          axios.get(`${API}/reports`, { withCredentials: true }),
          axios.get(`${API}/clients`, { withCredentials: true }),
        ]);
        setReports(rRes.data);
        setClients(cRes.data);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    setContent(
      <div className="p-4 space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">Workspace Stats</p>
          <div className="space-y-2">
            {[
              ["clients", clients.length],
              ["reports", reports.length],
              ["complete", reports.filter(r => r.status === "complete").length],
              ["templates", "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-gray-400">{k}</span>
                <span className="font-mono text-[10px] text-gray-700 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    return () => setContent(null);
  }, [clients.length, reports.length, setContent]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="font-mono text-xs text-gray-400">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="font-mono text-xs text-gray-400 mt-0.5">Welcome back, {user?.name}</p>
        </div>
        <Link
          to="/app/reports/new"
          data-testid="new-report-btn"
          className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors"
        >
          <Plus size={14} /> New Report
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Clients", value: clients.length, icon: Users, to: "/app/clients" },
          { label: "Total Reports", value: reports.length, icon: FileText, to: "/app/reports/new" },
          { label: "Complete", value: reports.filter(r => r.status === "complete").length, icon: Layers, to: null },
        ].map(({ label, value, icon: Icon, to }) => (
          <div
            key={label}
            data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
            className="bg-white border border-gray-200 p-4 rounded-sm shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">{label}</span>
              <Icon size={14} className="text-gray-400" />
            </div>
            <p className="font-mono text-2xl font-semibold text-gray-900">{value}</p>
            {to && <Link to={to} className="font-mono text-[10px] text-cyan-500 hover:text-cyan-600 mt-1 inline-flex items-center gap-1">View all <ArrowRight size={10} /></Link>}
          </div>
        ))}
      </div>

      {/* Reports List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-sans text-sm font-semibold text-gray-700">Recent Reports</h2>
          <Link to="/app/reports/new" className="font-mono text-[10px] text-cyan-500 hover:text-cyan-600 flex items-center gap-1">+ New <ArrowRight size={10} /></Link>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-sm p-10 text-center">
            <FileText size={28} className="text-gray-200 mx-auto mb-3" />
            <p className="font-sans text-sm font-semibold text-gray-700 mb-1">No reports yet</p>
            <p className="font-mono text-xs text-gray-400 mb-4">
              Upload a CSV and generate your first client report in minutes.
            </p>
            {clients.length === 0 && (
              <p className="font-mono text-[10px] text-amber-500 mb-3">
                You'll need a client first.{" "}
                <Link to="/app/clients" className="text-cyan-500 hover:underline">Add a client →</Link>
              </p>
            )}
            <Link
              to="/app/reports/new"
              data-testid="create-first-report-btn"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors"
            >
              <Plus size={14} /> Create First Report
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
            <table className="w-full text-sm" data-testid="reports-table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Report", "Client", "Status", "Created", ""].map(h => (
                    <th key={h} className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} data-testid={`report-row-${r.id}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="font-sans text-sm text-gray-900">{r.name}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs text-gray-500">{r.client_name}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-sm ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-500"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => r.status === "complete" ? navigate(`/app/reports/${r.id}/preview`) : navigate(`/app/reports/${r.id}/map`)}
                        data-testid={`view-report-${r.id}`}
                        className="font-mono text-[10px] text-cyan-500 hover:text-cyan-600 flex items-center gap-1 ml-auto"
                      >
                        {r.status === "complete" ? "Preview" : "Continue"} <ArrowRight size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
