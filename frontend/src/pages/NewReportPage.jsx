import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Upload, FileText, X, CheckCircle, AlertCircle, ArrowRight, Download } from "lucide-react";
import { useInspector } from "../contexts/InspectorContext";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

// ── Sample CSV generators ─────────────────────────────────────────────────────
function makeDateStr(base, offsetDays) {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

const SAMPLE_TEMPLATES = [
  {
    id: "standard",
    filename: "standard-template.csv",
    label: "Standard Template",
    description: "date · spend · leads · revenue",
    generate() {
      const rows = ["date,spend,leads,revenue"];
      const base = new Date("2024-01-01");
      for (let i = 0; i < 30; i++) {
        const spend = (950 + Math.sin(i * 0.7) * 250 + i * 12).toFixed(2);
        const leads = Math.max(5, Math.round(32 + Math.sin(i * 0.5) * 14 + i * 0.4));
        const revenue = (parseFloat(spend) * (2.9 + Math.sin(i * 0.4) * 0.4)).toFixed(2);
        rows.push(`${makeDateStr(base, i)},${spend},${leads},${revenue}`);
      }
      return rows.join("\n");
    },
  },
  {
    id: "google-ads",
    filename: "google-ads-sample.csv",
    label: "Google Ads",
    description: "date · campaign · cost · conversions · revenue",
    generate() {
      const rows = ["date,campaign,cost,conversions,revenue"];
      const base = new Date("2024-01-01");
      const campaigns = ["Brand Search", "Generic Search", "Shopping"];
      for (let i = 0; i < 30; i++) {
        campaigns.forEach((c, ci) => {
          const spend = (380 + ci * 140 + Math.sin(i * 0.6 + ci) * 80).toFixed(2);
          const leads = Math.max(2, Math.round(10 + ci * 4 + Math.sin(i * 0.5) * 5));
          const revenue = (parseFloat(spend) * (2.7 + ci * 0.3)).toFixed(2);
          rows.push(`${makeDateStr(base, i)},${c},${spend},${leads},${revenue}`);
        });
      }
      return rows.join("\n");
    },
  },
  {
    id: "meta-ads",
    filename: "meta-ads-sample.csv",
    label: "Meta / Facebook",
    description: "date · ad_set · amount_spent · leads · purchase_value",
    generate() {
      const rows = ["date,ad_set_name,amount_spent,leads,purchase_value"];
      const base = new Date("2024-01-01");
      const adSets = ["Retargeting", "Lookalike Audience"];
      for (let i = 0; i < 30; i++) {
        adSets.forEach((a, ai) => {
          const spend = (480 + ai * 210 + Math.sin(i * 0.8 + ai) * 95).toFixed(2);
          const leads = Math.max(3, Math.round(16 + ai * 7 + Math.sin(i * 0.5) * 7));
          const revenue = (parseFloat(spend) * (2.5 + ai * 0.4)).toFixed(2);
          rows.push(`${makeDateStr(base, i)},${a},${spend},${leads},${revenue}`);
        });
      }
      return rows.join("\n");
    },
  },
];

function downloadCSV(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function NewReportPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportId, setReportId] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [step, setStep] = useState(1);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const { setContent } = useInspector();

  useEffect(() => {
    axios.get(`${API}/clients`, { withCredentials: true })
      .then(r => setClients(r.data))
      .catch(() => toast.error("Failed to load clients"));
  }, []);

  useEffect(() => {
    setContent(
      <div className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">UPLOAD STATUS</p>
        {uploadedFiles.length > 0 ? (
          <div className="space-y-3">
            {uploadedFiles.map(f => (
              <div key={f.filename} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={10} className="text-green-500 flex-shrink-0" />
                  <span className="font-mono text-[10px] text-gray-700 truncate">{f.filename}</span>
                </div>
                <p className="font-mono text-[10px] text-gray-400 pl-4">{f.row_count} rows</p>
                {f.headers?.length > 0 && (
                  <div className="pl-4">
                    <p className="font-mono text-[10px] text-gray-400 mb-1">Detected headers:</p>
                    <div className="max-h-32 overflow-y-auto space-y-0.5">
                      {f.headers.map(h => (
                        <div key={h} className="flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-cyan-400" />
                          <span className="font-mono text-[10px] text-cyan-600">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-[10px] text-gray-400">Upload CSV files to see detected headers here.</p>
        )}
      </div>
    );
    return () => setContent(null);
  }, [uploadedFiles, setContent]);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!clientId) { toast.error("Please select a client"); return; }
    try {
      const { data } = await axios.post(`${API}/reports`, { client_id: clientId, name: reportName }, { withCredentials: true });
      setReportId(data.id);
      setStep(2);
      toast.success("Report created. Now upload your CSV files.");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create report");
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) { toast.error("Please select at least one CSV file"); return; }
    setUploading(true);
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    try {
      const { data } = await axios.post(`${API}/reports/${reportId}/upload-csv`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploadedFiles(data.csv_files);
      toast.success(`${data.csv_files.length} file${data.csv_files.length > 1 ? "s" : ""} uploaded successfully`);
      setStep(3);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const validateFile = (f) => {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error(`"${f.name}" is not a CSV file — only .csv files are accepted`);
      return false;
    }
    if (f.size === 0) {
      toast.error(`"${f.name}" is empty`);
      return false;
    }
    if (f.size > 15 * 1024 * 1024) {
      toast.error(`"${f.name}" exceeds the 15 MB size limit`);
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(validateFile);
    if (dropped.length === 0) return;
    setFiles(prev => [...prev, ...dropped].slice(0, 3));
  };

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

  return (
    <div className="p-6 fade-in-up max-w-2xl">
      <div className="mb-6">
        <h1 className="font-sans text-xl font-semibold text-gray-900">New Report</h1>
        <p className="font-mono text-xs text-gray-400 mt-0.5">Create a report, upload CSVs, then map columns</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {[["1", "Create Report"], ["2", "Upload CSVs"], ["3", "Map Columns"]].map(([num, label], i) => (
          <div key={num} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-sm flex items-center justify-center font-mono text-xs ${step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-400"}`}>
              {step > i + 1 ? <CheckCircle size={12} /> : num}
            </div>
            <span className={`font-sans text-xs ${step === i + 1 ? "text-gray-900 font-medium" : "text-gray-400"}`}>{label}</span>
            {i < 2 && <ArrowRight size={12} className="text-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: Create Report */}
      {step === 1 && (
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <h2 className="font-sans text-sm font-semibold text-gray-700 mb-4">Report Details</h2>
          <form onSubmit={handleCreateReport} className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-medium text-gray-700 mb-1">Client *</label>
              <select
                data-testid="report-client-select"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                required
                className="w-full font-mono text-sm px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
              >
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {clients.length === 0 && (
                <p className="font-mono text-[10px] text-amber-500 mt-1">
                  No clients found. <a href="/app/clients" className="text-cyan-500 hover:underline">Add a client first →</a>
                </p>
              )}
            </div>
            <div>
              <label className="block font-sans text-xs font-medium text-gray-700 mb-1">Report Name *</label>
              <input
                data-testid="report-name-input"
                type="text"
                value={reportName}
                onChange={e => setReportName(e.target.value)}
                placeholder="Q1 2024 Performance Report"
                required
                className="w-full font-mono text-sm px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              data-testid="create-report-btn"
              className="w-full py-2.5 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors flex items-center justify-center gap-2"
            >
              Create Report &amp; Continue <ArrowRight size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Upload CSVs */}
      {step === 2 && (
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <h2 className="font-sans text-sm font-semibold text-gray-700 mb-1">Upload CSV Files (max 3)</h2>
          <p className="font-mono text-xs text-gray-400 mb-4">
            Upload your ad platform CSV — Meta Ads, Google Ads, HubSpot, or any marketing platform export.
          </p>

          {/* Sample downloads */}
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">SAMPLE DATA</p>
              <span className="font-mono text-[10px] text-gray-400">No CSV? Download a ready-made template</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {SAMPLE_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  data-testid={`download-sample-${t.id}`}
                  onClick={() => {
                    downloadCSV(t.filename, t.generate());
                    toast.success(`Downloaded "${t.label}" sample (${t.filename})`);
                  }}
                  className="flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-sm hover:border-cyan-400 hover:text-cyan-600 transition-colors"
                  title={t.description}
                >
                  <Download size={10} className="flex-shrink-0" />
                  {t.label}
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px] text-gray-300 mt-2">
              Hover a button to see the column layout. Upload the downloaded file straight away to test the full flow.
            </p>
          </div>
          <div
            data-testid="csv-drop-zone"
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${dragging ? "border-cyan-500 bg-cyan-50" : "border-gray-200 hover:border-cyan-300 hover:bg-gray-50"}`}
          >
            <Upload size={24} className="text-gray-300 mx-auto mb-3" />
            <p className="font-mono text-sm text-gray-500">Drop CSV files here, or click to browse</p>
            <p className="font-mono text-xs text-gray-400 mt-1">Supports up to 3 CSV files, 500 rows each</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              multiple
              onChange={e => {
                const valid = Array.from(e.target.files).filter(validateFile);
                setFiles(prev => [...prev, ...valid].slice(0, 3));
                e.target.value = "";
              }}
              className="hidden"
              data-testid="csv-file-input"
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f, i) => (
                <div key={i} data-testid={`file-item-${i}`} className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm">
                  <FileText size={14} className="text-cyan-500 flex-shrink-0" />
                  <span className="font-mono text-xs text-gray-700 flex-1 truncate">{f.name}</span>
                  <span className="font-mono text-[10px] text-gray-400">{(f.size / 1024).toFixed(1)}KB</span>
                  <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-200 text-sm font-sans text-gray-600 rounded-sm hover:bg-gray-50 transition-colors">
              Back
            </button>
            <button
              onClick={handleUpload}
              data-testid="upload-csv-btn"
              disabled={uploading || files.length === 0}
              className="flex-1 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? "Uploading..." : <>Upload &amp; Detect Headers <ArrowRight size={14} /></>}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Proceed to mapping */}
      {step === 3 && (
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-green-500" />
            <h2 className="font-sans text-sm font-semibold text-gray-700">Files uploaded successfully</h2>
          </div>
          <div className="space-y-2 mb-5">
            {uploadedFiles.map(f => (
              <div key={f.filename} className="flex items-center gap-3 px-3 py-2 bg-green-50 border border-green-200 rounded-sm">
                <CheckCircle size={12} className="text-green-500" />
                <span className="font-mono text-xs text-gray-700 flex-1">{f.filename}</span>
                <span className="font-mono text-[10px] text-gray-500">{f.row_count} rows, {f.headers.length} columns</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(`/app/reports/${reportId}/map`)}
            data-testid="go-to-mapping-btn"
            className="w-full py-2.5 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors flex items-center justify-center gap-2"
          >
            Map Columns <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
