import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Save, Zap, ChevronDown, Check } from "lucide-react";
import { useInspector } from "../contexts/InspectorContext";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const REQUIRED_FIELDS = [
  { key: "date", label: "Date Column", hint: "e.g. date, week, month" },
  { key: "spend", label: "Spend Column", hint: "e.g. spend, cost, budget" },
  { key: "leads", label: "Leads Column", hint: "e.g. leads, conversions, signups" },
  { key: "revenue", label: "Revenue Column", hint: "e.g. revenue, sales, income" },
];

export default function ColumnMappingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [allHeaders, setAllHeaders] = useState([]);
  const [mapping, setMapping] = useState({ date: "", spend: "", leads: "", revenue: "" });
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { setContent } = useInspector();

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, tRes] = await Promise.all([
          axios.get(`${API}/reports/${id}`, { withCredentials: true }),
          axios.get(`${API}/templates`, { withCredentials: true }),
        ]);
        const r = rRes.data;
        setReport(r);
        setTemplates(tRes.data);
        // Collect all headers from all CSV files
        const headers = r.csv_files?.flatMap(f => f.headers || []) || [];
        setAllHeaders([...new Set(headers)]);
        // Pre-fill from existing mapping or auto-detect
        if (r.column_mapping) {
          setMapping(r.column_mapping);
        } else {
          const autoMap = {};
          const lower = headers.map(h => h.toLowerCase());
          ["date", "spend", "leads", "revenue"].forEach(field => {
            const idx = lower.findIndex(h => h.includes(field) || (field === "leads" && (h.includes("lead") || h.includes("conversion"))));
            if (idx >= 0) autoMap[field] = headers[idx];
          });
          setMapping(prev => ({ ...prev, ...autoMap }));
        }
      } catch {
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    setContent(
      <div className="p-4 space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">DETECTED HEADERS</p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {allHeaders.length > 0 ? allHeaders.map(h => (
              <div key={h} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                <span className="font-mono text-[10px] text-gray-600">{h}</span>
              </div>
            )) : (
              <p className="font-mono text-[10px] text-gray-400">No headers detected</p>
            )}
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">FIELD STATUS</p>
          {REQUIRED_FIELDS.map(f => (
            <div key={f.key} className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="font-mono text-[10px] text-gray-500">{f.key}</span>
              <span className={`font-mono text-[10px] font-medium ${mapping[f.key] ? "text-green-500" : "text-gray-300"}`}>
                {mapping[f.key] ? <Check size={10} /> : "○"}
              </span>
            </div>
          ))}
        </div>
        <div>
          <p className="font-mono text-[10px] text-gray-400">
            {Object.values(mapping).filter(Boolean).length}/4 fields mapped
          </p>
        </div>
      </div>
    );
    return () => setContent(null);
  }, [allHeaders, mapping, setContent]);

  const applyTemplate = (t) => {
    setMapping({ date: "", spend: "", leads: "", revenue: "", ...t.column_mapping });
    toast.success(`Template "${t.name}" applied`);
  };

  const handleSaveMapping = async () => {
    const mappedCount = Object.values(mapping).filter(Boolean).length;
    if (mappedCount < 2) { toast.error("Map at least 2 fields to continue"); return; }
    setSaving(true);
    try {
      await axios.post(
        `${API}/reports/${id}/map-columns`,
        { mapping, save_as_template: saveTemplate && templateName ? templateName : null },
        { withCredentials: true }
      );
      toast.success(saveTemplate && templateName ? `Mapping saved as template "${templateName}"` : "Mapping saved");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to save mapping");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    await handleSaveMapping();
    setGenerating(true);
    try {
      await axios.post(`${API}/reports/${id}/generate`, {}, { withCredentials: true });
      toast.success("Report generated!");
      navigate(`/app/reports/${id}/preview`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="font-mono text-xs text-gray-400">Loading...</p></div>;

  return (
    <div className="p-6 fade-in-up max-w-2xl">
      <div className="mb-6">
        <h1 className="font-sans text-xl font-semibold text-gray-900">Map Columns</h1>
        <p className="font-mono text-xs text-gray-400 mt-0.5">{report?.name} — {report?.client_name}</p>
      </div>

      {/* Apply template */}
      {templates.length > 0 && (
        <div className="mb-4 p-3 bg-cyan-50 border border-cyan-200 rounded-sm">
          <p className="font-mono text-[10px] text-cyan-700 mb-2">Apply a saved template:</p>
          <div className="flex gap-2 flex-wrap">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                data-testid={`apply-template-${t.id}`}
                className="font-mono text-[10px] px-2 py-1 bg-white border border-cyan-300 text-cyan-700 rounded-sm hover:bg-cyan-100 transition-colors"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">COLUMN MAPPING</p>
        </div>
        <div className="p-4 space-y-4">
          {REQUIRED_FIELDS.map(field => (
            <div key={field.key} data-testid={`mapping-row-${field.key}`} className={`grid grid-cols-[140px_1fr] items-center gap-4 p-3 rounded-sm transition-colors ${mapping[field.key] ? "bg-cyan-50 border border-cyan-200" : "bg-gray-50 border border-transparent"}`}>
              <div>
                <p className="font-sans text-xs font-medium text-gray-700">{field.label}</p>
                <p className="font-mono text-[10px] text-gray-400">{field.hint}</p>
              </div>
              <div className="relative">
                <select
                  data-testid={`mapping-select-${field.key}`}
                  value={mapping[field.key] || ""}
                  onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className={`w-full font-mono text-xs px-3 py-2 border rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white appearance-none pr-8 ${mapping[field.key] ? "border-cyan-400" : "border-gray-300"}`}
                >
                  <option value="">— not mapped —</option>
                  {allHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Save as template */}
        <div className="px-4 pb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              data-testid="save-template-toggle"
              type="checkbox"
              checked={saveTemplate}
              onChange={e => setSaveTemplate(e.target.checked)}
              className="w-3 h-3 accent-cyan-500"
            />
            <span className="font-mono text-[10px] text-gray-500">Save as template</span>
          </label>
          {saveTemplate && (
            <input
              data-testid="template-name-input"
              type="text"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              placeholder="Template name (e.g. Google Ads Default)"
              className="mt-2 w-full font-mono text-xs px-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex gap-3">
          <button
            onClick={handleSaveMapping}
            data-testid="save-mapping-btn"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-sm font-sans text-gray-600 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save size={13} /> {saving ? "Saving..." : "Save Mapping"}
          </button>
          <button
            onClick={handleGenerate}
            data-testid="generate-report-btn"
            disabled={generating || saving}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors disabled:opacity-50"
          >
            <Zap size={14} /> {generating ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
