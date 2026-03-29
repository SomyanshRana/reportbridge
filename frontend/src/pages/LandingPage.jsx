import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, FileText, Layers, Zap, Check, Plus } from "lucide-react";

const DEMO_CARDS = [
  { label: "Total Spend", value: "$45,200", delta: "+12%", positive: true },
  { label: "Total Leads", value: "1,248", delta: "+8%", positive: true },
  { label: "Revenue", value: "$180K", delta: "+24%", positive: true },
  { label: "ROAS", value: "4.0x", delta: "+0.4", positive: true },
];

const CHANGELOGS = [
  "column auto-detection for CSV fields",
  "basic KPI calculations (spend, leads, revenue, CPL, ROAS)",
  "PDF report export from browser print",
  "mapping templates — save and reuse column mappings",
  "multi-file CSV upload with status tracking",
  "editable report summary with inline textarea",
  "dark README-style manifesto section on landing page",
  "3-panel DevTools IDE workspace (explorer, canvas, inspector)",
];

const FAQS = [
  { q: "What CSV formats are supported?", a: "Any standard CSV from Google Ads, Meta Ads, HubSpot, Salesforce, or any marketing platform. As long as it has columns for spend, leads, revenue, and date — you're good." },
  { q: "How does column mapping work?", a: "After uploading your CSVs, you map each column to a standard field: date, spend, leads, revenue. ReportBridge auto-detects likely matches. Save the mapping as a template to reuse it next time." },
  { q: "Can I save mappings for future reports?", a: "Yes — after mapping columns, toggle 'Save as template' and give it a name. Find all templates under the Templates section. Apply a template to any new report in seconds." },
  { q: "How is the PDF generated?", a: "We use browser-native print. Click 'Export PDF' on the report preview page and your browser prints the report — no server-side rendering, no dependencies, just clean output." },
];

function DemoBrowser() {
  const [activeCard, setActiveCard] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveCard(p => (p + 1) % 4), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg bg-white">
      {/* Chrome */}
      <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-white border border-gray-200 rounded px-2 py-0.5">
          <span className="font-mono text-[10px] text-gray-400">app.reportbridge.io</span>
        </div>
      </div>
      {/* Tab */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 flex">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-t-2 border-t-cyan-500 border-x border-gray-200 text-xs font-sans text-gray-600">
          <div className="w-2 h-2 rounded-full bg-cyan-100" />
          Acme Digital — Q1 Report
        </div>
      </div>
      {/* Workspace preview */}
      <div className="flex h-52">
        {/* Left mini sidebar */}
        <div className="w-24 border-r border-gray-200 p-2 space-y-1 bg-white">
          <p className="font-mono text-[8px] uppercase text-gray-400 mb-2">Explorer</p>
          {["Dashboard", "Clients", "Reports", "Templates"].map((item, i) => (
            <div key={item} className={`px-2 py-1 rounded-sm text-[9px] font-sans flex items-center gap-1 ${i === 2 ? "bg-cyan-50 text-cyan-600" : "text-gray-500"}`}>
              {i === 2 && <div className="w-1 h-1 rounded-full bg-cyan-500" />}
              {item}
            </div>
          ))}
        </div>
        {/* Center cards */}
        <div className="flex-1 p-3 bg-gray-50">
          <p className="font-mono text-[9px] text-gray-400 mb-2">Q1 2024 — KPI Overview</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_CARDS.map((card, i) => (
              <div
                key={i}
                className={`bg-white border p-2 rounded-sm transition-all duration-300 relative ${activeCard === i ? "border-cyan-500 shadow-[0_0_0_2px_rgba(6,182,212,0.2)]" : "border-gray-200"}`}
              >
                {activeCard === i && (
                  <div className="absolute -top-4 left-0 bg-gray-900 text-cyan-400 font-mono text-[8px] px-1.5 py-0.5 rounded-sm whitespace-nowrap z-10">
                    KPI Card · 240×80
                  </div>
                )}
                <p className="font-mono text-[8px] text-gray-400">{card.label}</p>
                <p className="font-mono text-sm font-semibold text-gray-900">{card.value}</p>
                <p className="font-mono text-[8px] text-green-500">{card.delta}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Right mini inspector */}
        <div className="w-28 border-l border-gray-200 p-2 bg-white">
          <p className="font-mono text-[8px] uppercase text-gray-400 mb-2">Inspector</p>
          <div className="space-y-1.5">
            {[["font-size","14px"],["color","#06B6D4"],["border","1px solid"]].map(([k,v]) => (
              <div key={k}>
                <p className="font-mono text-[7px] text-gray-400">{k}</p>
                <p className="font-mono text-[8px] text-gray-700 bg-gray-50 px-1 rounded-sm border border-gray-200">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur z-50 no-print">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-gray-900">ReportBridge</span>
          <span className="font-mono text-[10px] text-cyan-500 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded-sm pulse-cyan">v2.0</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" data-testid="nav-login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
          <Link to="/signup" data-testid="nav-signup" className="px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="fade-in-up-1">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-cyan-600 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            v2.0 RELEASED — Now with templates &amp; multi-CSV support
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
            ReportBridge
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed mb-8">
            Turn messy CSV exports into clean, client-ready reports in minutes. Upload, map columns, generate KPI dashboards, and export as PDF.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/signup"
              data-testid="hero-cta"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-transparent hover:text-[#06B6D4] border border-[#06B6D4] transition-all duration-200"
            >
              <Zap size={14} />
              Start for free
            </Link>
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Already have an account →
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-gray-400 font-sans">
            {["No credit card required", "Free forever plan", "Export unlimited reports"].map(t => (
              <span key={t} className="flex items-center gap-1.5"><Check size={12} className="text-green-500" />{t}</span>
            ))}
          </div>
        </div>
        <div className="fade-in-up-2">
          <DemoBrowser />
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-y border-gray-200 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: FileText, title: "Upload Any CSV", desc: "Drag and drop CSVs from Google Ads, Meta, HubSpot, or any platform. Auto-detects headers instantly." },
            { icon: Layers, title: "Map & Template", desc: "Map CSV columns to standard fields once. Save as a template and reuse it for every future report." },
            { icon: Zap, title: "Generate & Export", desc: "Instantly calculate KPIs — Spend, Leads, Revenue, CPL, ROAS. Export clean PDF reports in one click." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm">
              <div className="w-8 h-8 rounded-sm bg-cyan-50 border border-cyan-200 flex items-center justify-center mb-3">
                <Icon size={16} className="text-cyan-600" />
              </div>
              <h3 className="font-sans font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-sans">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Changelog */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-12">
            <div className="w-48 flex-shrink-0">
              <p className="font-sans text-xs font-medium uppercase tracking-widest text-gray-400">CHANGELOG</p>
              <hr className="mt-2 border-gray-200" />
              <div className="mt-4 space-y-1">
                <p className="font-mono text-xs text-cyan-600 font-medium">v2.0.0</p>
                <p className="font-mono text-xs text-gray-400">February 2024</p>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {CHANGELOGS.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Plus size={12} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                  <span className="font-mono text-sm text-gray-700">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* README Manifesto */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <div className="bg-[#161b22] px-4 py-2 flex items-center justify-between border-b border-gray-700">
              <span className="font-mono text-xs text-gray-400">README.md</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
              </div>
            </div>
            <div className="bg-[#0d1117] p-6 font-mono text-sm">
              <p className="text-cyan-400 text-base font-semibold mb-3">### How it works</p>
              <p className="text-gray-300 leading-relaxed mb-4">
                ReportBridge takes the pain out of marketing reporting. Your clients don't care about raw data — they care about <span className="text-cyan-400">results</span>. Upload your CSVs, map the columns once, and we'll generate a clean, professional report you can hand off directly.
              </p>
              <p className="text-cyan-400 text-sm font-semibold mb-2">### The core loop</p>
              <p className="text-gray-300 mb-1">1. Upload CSVs from any marketing platform</p>
              <p className="text-gray-300 mb-1">2. Map columns to standard fields (date, spend, leads, revenue)</p>
              <p className="text-gray-300 mb-1">3. Save as a template for instant reuse</p>
              <p className="text-gray-300 mb-4">4. Export to PDF — one click, client-ready</p>
              <p className="text-cyan-400 text-sm font-semibold mb-2">### API Export</p>
              <div className="bg-[#161b22] rounded p-4 border border-gray-700">
                <pre className="text-[#e6e6e6] text-xs leading-relaxed">{`curl https://app.reportbridge.io/reports/12345 \\
  -H "Authorization: Bearer $TOKEN" \\
  --data 'format=pdf'`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 max-w-2xl mx-auto px-6">
        <h2 className="font-sans text-2xl font-semibold text-gray-900 mb-8">Technical FAQ</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-sm overflow-hidden">
              <button
                data-testid={`faq-toggle-${i}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-sans text-gray-700">{faq.q}</span>
                <Plus size={14} className={`text-gray-400 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-sm font-sans text-gray-500 leading-relaxed border-t border-gray-100 bg-gray-50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-mono text-sm text-gray-400">ReportBridge v2.0 — Built for marketing agencies</span>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600 font-sans">Login</Link>
            <Link to="/signup" className="text-sm text-gray-400 hover:text-gray-600 font-sans">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
