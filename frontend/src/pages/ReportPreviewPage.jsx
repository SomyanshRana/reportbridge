import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Download, Edit3, Save, ArrowLeft, TrendingUp, Users, DollarSign, Target, X, Info, BarChart2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useInspector } from "../contexts/InspectorContext";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const KPI_DEFS = [
  { key: "total_spend", label: "Total Spend", format: "currency", icon: DollarSign, color: "#06B6D4" },
  { key: "total_leads", label: "Total Leads", format: "number", icon: Users, color: "#10b981" },
  { key: "total_revenue", label: "Total Revenue", format: "currency", icon: TrendingUp, color: "#8b5cf6" },
  { key: "cpl", label: "Cost Per Lead", format: "currency", icon: Target, color: "#f59e0b" },
  { key: "roas", label: "ROAS", format: "multiplier", icon: TrendingUp, color: "#ef4444" },
];

function fmt(val, type) {
  const n = Number(val);
  if (val == null || isNaN(n) || !isFinite(n)) return "—";
  if (type === "currency") return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (type === "multiplier") return `${n.toFixed(2)}x`;
  return n.toLocaleString();
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 p-2 shadow-sm rounded-sm">
      <p className="font-mono text-[10px] text-gray-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="font-mono text-[10px]" style={{ color: p.color }}>
          {p.dataKey}: {typeof p.value === "number" ? p.value.toLocaleString("en-US", { maximumFractionDigits: 0 }) : p.value}
        </p>
      ))}
    </div>
  );
};

const ROW_LIMIT = 50;

export default function ReportPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [summary, setSummary] = useState("");
  const [editingSummary, setEditingSummary] = useState(false);
  const [savingSummary, setSavingSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeKpi, setActiveKpi] = useState(null);
  const [demoBannerVisible, setDemoBannerVisible] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);
  const { setContent } = useInspector();

  useEffect(() => {
    axios.get(`${API}/reports/${id}`, { withCredentials: true })
      .then(r => {
        setReport(r.data);
        setSummary(r.data.summary || "");
        if (r.data.is_demo) {
          setDemoBannerVisible(true);
          // Mark as seen so subsequent logins don't auto-redirect
          axios.post(`${API}/auth/mark-demo-seen`, {}, { withCredentials: true })
            .then(() => console.log("[DEMO] marked as seen"))
            .catch(() => {});
        }
      })
      .catch(err => {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
        } else {
          toast.error("Failed to load report");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!report) return;
    setContent(
      <div className="p-4 space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">REPORT META</p>
        {[
          ["name", report.name],
          ["client", report.client_name],
          ["status", report.status],
          ["rows", report.csv_files?.reduce((a, f) => a + (f.row_count || 0), 0) || "demo data"],
          ["updated", report.updated_at ? new Date(report.updated_at).toLocaleDateString() : "—"],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[60px_1fr] gap-1">
            <span className="font-mono text-[10px] text-gray-400">{k}</span>
            <span className="font-mono text-[10px] text-gray-700 font-medium truncate">{String(v)}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#06B6D4] text-white font-mono text-[10px] rounded-sm hover:bg-[#0891b2] transition-colors"
          >
            <Download size={10} /> Export PDF
          </button>
        </div>
      </div>
    );
    return () => setContent(null);
  }, [report, setContent]);

  const handleSaveSummary = async () => {
    setSavingSummary(true);
    try {
      await axios.put(`${API}/reports/${id}/summary`, { summary }, { withCredentials: true });
      setEditingSummary(false);
      toast.success("Summary saved");
    } catch {
      toast.error("Failed to save summary");
    } finally {
      setSavingSummary(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="font-mono text-xs text-gray-400">Loading report...</p>
    </div>
  );

  if (!report) return (
    <div className="p-6 text-center">
      <BarChart2 size={28} className="text-gray-200 mx-auto mb-3" />
      <p className="font-sans text-sm text-gray-500 mb-3">Report not found or you don't have access.</p>
      <Link to="/app" className="font-mono text-xs text-cyan-500 hover:text-cyan-600">
        <ArrowLeft size={10} className="inline mr-1" />Back to Dashboard
      </Link>
    </div>
  );

  const kpi = report.kpi_data || {};
  const chartData = report.chart_data || [];
  const displayRows = showAllRows ? chartData : chartData.slice(0, ROW_LIMIT);

  return (
    <div className="p-6 fade-in-up report-preview-container">

      {/* Demo Banner */}
      {demoBannerVisible && (
        <div
          data-testid="demo-banner"
          className="mb-4 flex items-start sm:items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-sm no-print"
        >
          <div className="flex items-start sm:items-center gap-2">
            <Info size={14} className="text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="font-mono text-xs text-amber-700">
              <strong>👋 This is a demo report.</strong> Upload your own CSV to generate reports like this in under 2 minutes.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/app/reports/new"
              data-testid="demo-banner-cta"
              className="font-mono text-[10px] px-2.5 py-1 bg-amber-500 text-white rounded-sm hover:bg-amber-600 transition-colors whitespace-nowrap"
            >
              Create Real Report
            </Link>
            <button
              onClick={() => setDemoBannerVisible(false)}
              data-testid="demo-banner-dismiss"
              aria-label="Dismiss demo banner"
              className="text-amber-400 hover:text-amber-600 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <Link to="/app" className="font-mono text-[10px] text-gray-400 hover:text-cyan-500 flex items-center gap-1 mb-1">
            <ArrowLeft size={10} /> Back to dashboard
          </Link>
          <h1 className="font-sans text-xl font-semibold text-gray-900">{report.name}</h1>
          <p className="font-mono text-xs text-gray-400">{report.client_name}</p>
        </div>
        <button
          onClick={() => window.print()}
          data-testid="export-pdf-btn"
          className="flex flex-col items-end gap-0.5 text-right"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors">
            <Download size={14} /> Export PDF
          </span>
          <span className="font-mono text-[10px] text-gray-400">Send this report to your client in seconds</span>
        </button>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="font-sans text-2xl font-bold text-gray-900">{report.name}</h1>
        <p className="font-sans text-base text-gray-500">Client: {report.client_name}</p>
        <p className="font-mono text-sm text-gray-400">Generated: {new Date().toLocaleDateString()}</p>
        <hr className="mt-4 border-gray-200" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 print-area">
        {KPI_DEFS.map(kpiDef => (
          <div
            key={kpiDef.key}
            data-testid={`kpi-${kpiDef.key}`}
            onClick={() => setActiveKpi(activeKpi === kpiDef.key ? null : kpiDef.key)}
            className={`bg-white border rounded-sm p-3 cursor-pointer transition-all duration-200 relative ${
              activeKpi === kpiDef.key
                ? "border-[#06B6D4] shadow-[0_0_0_2px_rgba(6,182,212,0.15)]"
                : "border-gray-200 hover:border-cyan-300"
            }`}
          >
            {activeKpi === kpiDef.key && (
              <div className="absolute -top-5 left-0 bg-gray-900 text-cyan-400 font-mono text-[8px] px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                div.kpi-card
              </div>
            )}
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400">{kpiDef.label}</span>
              <kpiDef.icon size={12} style={{ color: kpiDef.color }} />
            </div>
            <p className="font-mono text-lg font-semibold text-gray-900">{fmt(kpi[kpiDef.key], kpiDef.format)}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print-area">
          <div className="bg-white border border-gray-200 rounded-sm p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">SPEND vs REVENUE</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontFamily: '"JetBrains Mono"', fontSize: 9 }} />
                <YAxis tick={{ fontFamily: '"JetBrains Mono"', fontSize: 9 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontFamily: '"JetBrains Mono"', fontSize: 10 }} />
                <Line type="monotone" dataKey="spend" stroke="#06B6D4" strokeWidth={2} dot={false} name="Spend" />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-gray-200 rounded-sm p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">LEADS OVER TIME</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontFamily: '"JetBrains Mono"', fontSize: 9 }} />
                <YAxis tick={{ fontFamily: '"JetBrains Mono"', fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="leads" fill="#06B6D4" radius={[2, 2, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-sm p-10 text-center mb-6">
          <BarChart2 size={28} className="text-gray-200 mx-auto mb-3" />
          <p className="font-mono text-xs text-gray-400">No chart data available for this report.</p>
          <p className="font-mono text-[10px] text-gray-300 mt-1">
            Make sure your CSV includes a date column and at least one numeric column.
          </p>
        </div>
      )}

      {/* Data Table */}
      {chartData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden mb-6 print-area">
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">DATA TABLE</p>
            <p className="font-mono text-[10px] text-gray-400">{chartData.length} rows</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  {["Date", "Spend", "Leads", "Revenue"].map(h => (
                    <th key={h} className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">{row.date}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">{fmt(row.spend, "currency")}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">
                      {row.leads != null && !isNaN(Number(row.leads)) ? Number(row.leads).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">{fmt(row.revenue, "currency")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {chartData.length > ROW_LIMIT && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
              <button
                onClick={() => setShowAllRows(v => !v)}
                data-testid="show-all-rows-btn"
                className="font-mono text-[10px] text-cyan-500 hover:text-cyan-600 transition-colors"
              >
                {showAllRows ? "Show fewer rows" : `Show all ${chartData.length} rows`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 print-area">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">EXECUTIVE SUMMARY</p>
          {!editingSummary ? (
            <button
              onClick={() => setEditingSummary(true)}
              data-testid="edit-summary-btn"
              className="no-print flex items-center gap-1 font-mono text-[10px] text-cyan-500 hover:text-cyan-600"
            >
              <Edit3 size={10} /> Edit
            </button>
          ) : (
            <button
              onClick={handleSaveSummary}
              data-testid="save-summary-btn"
              disabled={savingSummary}
              className="no-print flex items-center gap-1 font-mono text-[10px] text-green-500 hover:text-green-600 disabled:opacity-50"
            >
              <Save size={10} /> {savingSummary ? "Saving..." : "Save"}
            </button>
          )}
        </div>
        {editingSummary ? (
          <textarea
            data-testid="summary-textarea"
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={4}
            placeholder="Write an executive summary for this report..."
            className="w-full font-mono text-xs text-gray-700 p-3 border border-cyan-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none bg-cyan-50/30"
          />
        ) : (
          <p className="font-mono text-sm text-gray-600 leading-relaxed">
            {summary || <span className="text-gray-300 italic">No summary yet. Click Edit to add one.</span>}
          </p>
        )}
      </div>
    </div>
  );
}
