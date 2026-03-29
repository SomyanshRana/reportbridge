import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Trash2, Layers, Plus, ArrowRight } from "lucide-react";
import { useInspector } from "../contexts/InspectorContext";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const FIELD_LABELS = { date: "Date", spend: "Spend", leads: "Leads", revenue: "Revenue" };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setContent } = useInspector();

  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get(`${API}/templates`, { withCredentials: true });
      setTemplates(data);
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  useEffect(() => {
    setContent(
      <div className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">TEMPLATES</p>
        <p className="font-mono text-[10px] text-gray-400 leading-relaxed">
          Templates save your column mappings so you can reuse them across reports. Create one during the mapping step.
        </p>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="font-mono text-[10px] text-gray-400">{templates.length} template{templates.length !== 1 ? "s" : ""} saved</p>
        </div>
      </div>
    );
    return () => setContent(null);
  }, [templates.length, setContent]);

  const handleDelete = async (tid) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await axios.delete(`${API}/templates/${tid}`, { withCredentials: true });
      toast.success("Template deleted");
      fetchTemplates();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="font-mono text-xs text-gray-400">Loading...</p></div>;

  return (
    <div className="p-6 fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sans text-xl font-semibold text-gray-900">Templates</h1>
          <p className="font-mono text-xs text-gray-400 mt-0.5">Saved column mapping templates</p>
        </div>
        <button
          onClick={() => navigate("/app/reports/new")}
          data-testid="new-report-from-templates"
          className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors"
        >
          <Plus size={14} /> New Report
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-sm p-10 text-center">
          <Layers size={24} className="text-gray-300 mx-auto mb-3" />
          <p className="font-sans text-sm text-gray-500 mb-2">No templates yet.</p>
          <p className="font-sans text-xs text-gray-400 mb-4">
            When mapping CSV columns, toggle "Save as template" to save it here for future reports.
          </p>
          <button
            onClick={() => navigate("/app/reports/new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors"
          >
            <Plus size={14} /> Create a Report to Generate Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div
              key={t.id}
              data-testid={`template-card-${t.id}`}
              className="bg-white border border-gray-200 rounded-sm p-4 hover:border-cyan-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Layers size={12} className="text-cyan-500" />
                    <p className="font-sans text-sm font-medium text-gray-900">{t.name}</p>
                  </div>
                  <p className="font-mono text-[10px] text-gray-400">
                    {Object.values(t.column_mapping || {}).filter(Boolean).length} fields mapped
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  data-testid={`delete-template-${t.id}`}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  title="Delete template"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Mapping preview */}
              <div className="space-y-1.5 p-3 bg-gray-50 rounded-sm border border-gray-100">
                {Object.entries(t.column_mapping || {}).map(([field, col]) => col ? (
                  <div key={field} className="grid grid-cols-[60px_1fr] items-center">
                    <span className="font-mono text-[10px] text-gray-400">{FIELD_LABELS[field] || field}</span>
                    <span className="font-mono text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded-sm border border-cyan-200">{col}</span>
                  </div>
                ) : null)}
              </div>

              <button
                onClick={() => navigate("/app/reports/new")}
                data-testid={`use-template-${t.id}`}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-cyan-200 text-cyan-600 font-mono text-[10px] rounded-sm hover:bg-cyan-50 transition-colors"
              >
                Use Template <ArrowRight size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
