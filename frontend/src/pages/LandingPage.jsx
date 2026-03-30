import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Layers, Zap, Check, Plus, ArrowRight, Clock, TrendingUp, AlertTriangle } from "lucide-react";

const DEMO_CARDS = [
  { label: "Total Spend", value: "$8,420", delta: "+12%", positive: true },
  { label: "Total Leads", value: "312", delta: "+8%", positive: true },
  { label: "Revenue", value: "$28.4K", delta: "+24%", positive: true },
  { label: "ROAS", value: "3.4x", delta: "+0.4", positive: true },
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
  { q: "Does it work with Google Ads and Meta exports?", a: "Yes. Both platforms export standard CSV files. Upload them directly — ReportBridge auto-detects the column headers. If names differ slightly, use column mapping to match them manually." },
];

const PAIN_STEPS = [
  "Export CSVs from Meta / Google Ads",
  "Clean and rename columns manually",
  "Calculate KPIs in a spreadsheet",
  "Format and design the client report",
  "Repeat every single week",
];

const SOLUTION_STEPS = [
  {
    num: "01",
    title: "Upload your CSV exports",
    desc: "Drag and drop files from Meta, Google Ads, HubSpot, or any platform. Multi-file upload included.",
  },
  {
    num: "02",
    title: "Map columns once",
    desc: "Auto-detection handles most platforms. Save your mapping as a template — never map the same columns twice.",
  },
  {
    num: "03",
    title: "Generate reports instantly",
    desc: "KPIs calculated, charts drawn, summary written. One click to export a client-ready PDF.",
  },
];

const OUTCOMES = [
  "KPI dashboards — Spend, Leads, Revenue, CPL, ROAS",
  "Interactive charts and weekly data tables",
  "Client-ready PDF export in one click",
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
          Acme Marketing — 30-Day Report
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
          <p className="font-mono text-[9px] text-gray-400 mb-2">Last 30 Days — KPI Overview</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_CARDS.map((card, i) => (
              <div
                key={i}
                className={`bg-white border p-2 rounded-sm transition-all duration-300 relative ${activeCard === i ? "border-cyan-500 shadow-[0_0_0_2px_rgba(6,182,212,0.2)]" : "border-gray-200"}`}
              >
                {activeCard === i && (
                  <div className="absolute -top-4 left-0 bg-gray-900 text-cyan-400 font-mono text-[8px] px-1.5 py-0.5 rounded-sm whitespace-nowrap z-10">
                    KPI Card · live
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
            {[["font-size", "14px"], ["color", "#06B6D4"], ["border", "1px solid"]].map(([k, v]) => (
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
          <span className="font-mono text-[10px] text-cyan-500 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded-sm">v2.0</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#how-it-works" className="hidden sm:block text-sm text-gray-500 hover:text-gray-700 transition-colors font-sans">How it works</a>
          <Link to="/login" data-testid="nav-login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
          <Link to="/signup" data-testid="nav-signup" className="px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors">
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="fade-in-up-1">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-cyan-600 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            v2.0 — Now with templates &amp; multi-CSV support
          </div>
          <h1 className="font-sans text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
            Turn messy ad CSVs into client-ready reports in 2 minutes
          </h1>
          <p className="font-sans text-lg text-gray-500 leading-relaxed mb-3">
            Stop wasting hours cleaning spreadsheets and building reports manually. Upload your CSV, map once, and generate clean KPI reports instantly.
          </p>
          <p className="font-mono text-sm text-gray-400 mb-8">
            Built for freelancers and small agencies running Meta &amp; Google Ads
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/signup"
              data-testid="hero-cta"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors"
            >
              <Zap size={14} />
              Start free
            </Link>
            <a
              href="#how-it-works"
              data-testid="hero-demo-cta"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-sm hover:border-gray-300 hover:text-gray-900 transition-colors"
            >
              View demo <ArrowRight size={14} />
            </a>
          </div>
          <p className="font-mono text-xs text-gray-400 mt-4">
            No credit card required • Setup in under 2 minutes
          </p>
        </div>
        <div className="fade-in-up-2">
          <DemoBrowser />
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 border-y border-gray-200 py-16" id="how-it-works">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">THE PROBLEM</p>
              <h2 className="font-sans text-2xl font-bold text-gray-900 leading-snug mb-4">
                If you run ads for clients, reporting probably looks like this:
              </h2>
              <p className="font-sans text-sm text-gray-500 leading-relaxed">
                This takes <strong className="text-gray-700">hours every week</strong> and it's the most repetitive part of your work.
                You're a marketer, not a spreadsheet formatter.
              </p>
            </div>
            <div className="bg-[#0d1117] rounded-sm border border-gray-700 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-700/60">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="font-mono text-[10px] text-gray-500 ml-2">weekly-reporting.sh</span>
              </div>
              <div className="p-5 space-y-2">
                {PAIN_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="font-mono text-sm text-red-400 flex-shrink-0 mt-px">→</span>
                    <span className="font-mono text-sm text-gray-300">{step}</span>
                  </div>
                ))}
                <div className="mt-4 pt-3 border-t border-gray-700/60">
                  <span className="font-mono text-xs text-yellow-400">// ~3 hours every reporting cycle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">THE SOLUTION</p>
            <h2 className="font-sans text-2xl font-bold text-gray-900 mb-2">
              ReportBridge automates your entire reporting workflow
            </h2>
            <p className="font-sans text-sm text-gray-500 max-w-xl mx-auto">
              Three steps. One report. Done.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {SOLUTION_STEPS.map(({ num, title, desc }) => (
              <div key={num} className="bg-white border border-gray-200 rounded-sm p-5 relative">
                <span className="font-mono text-4xl font-bold text-gray-100 absolute -top-2 right-3 select-none">{num}</span>
                <div className="w-8 h-8 bg-cyan-50 border border-cyan-200 rounded-sm flex items-center justify-center mb-3">
                  <span className="font-mono text-sm font-bold text-cyan-600">{num}</span>
                </div>
                <h3 className="font-sans font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="font-sans text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-sm p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-4">YOU GET</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {OUTCOMES.map(o => (
                <div key={o} className="flex items-start gap-2.5">
                  <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="font-sans text-sm text-gray-700">{o}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value Section */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-6">THE MATH</p>
          <div className="bg-white border border-gray-200 rounded-sm p-8 mb-8 shadow-sm text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-cyan-50 border border-cyan-200 rounded-sm flex items-center justify-center flex-shrink-0 mt-1">
                <TrendingUp size={18} className="text-cyan-600" />
              </div>
              <div>
                <p className="font-sans text-lg text-gray-700 leading-relaxed mb-3">
                  If your time is worth even{" "}
                  <span className="font-semibold text-gray-900">$10/hour</span> and this saves you{" "}
                  <span className="font-semibold text-gray-900">2–3 hours per report</span>, you're saving{" "}
                  <span className="font-semibold text-[#06B6D4] text-xl">$20–$30 every time.</span>
                </p>
                <p className="font-mono text-sm text-gray-500 border-t border-gray-100 pt-3">
                  ReportBridge costs less than that per month.
                </p>
              </div>
            </div>
          </div>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors"
          >
            Start free <ArrowRight size={14} />
          </Link>
          <p className="font-mono text-xs text-gray-400 mt-3">No credit card required</p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 text-center mb-8">FEATURES</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <p className="font-sans text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Changelog */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
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
      <section className="py-16 bg-white border-t border-gray-200">
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
      <section className="py-16 bg-gray-50 border-t border-gray-200 max-w-2xl mx-auto px-6" style={{ maxWidth: "none" }}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-sans text-2xl font-semibold text-gray-900 mb-8">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-sm overflow-hidden">
                <button
                  data-testid={`faq-toggle-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-sans text-gray-700">{faq.q}</span>
                  <Plus size={14} className={`text-gray-400 flex-shrink-0 ml-4 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 text-sm font-sans text-gray-500 leading-relaxed border-t border-gray-100 bg-gray-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-900 py-20 border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-500 mb-4">GET STARTED</p>
          <h2 className="font-sans text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Stop building reports manually.
          </h2>
          <p className="font-sans text-xl text-gray-400 mb-10">
            Start generating them in minutes.
          </p>
          <Link
            to="/signup"
            data-testid="bottom-cta"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#06B6D4] text-white font-medium rounded-sm hover:bg-[#0891b2] transition-colors text-base"
          >
            <Zap size={16} /> Start free
          </Link>
          <p className="font-mono text-xs text-gray-500 mt-4">
            No credit card required • Setup in under 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="font-mono text-sm font-semibold text-gray-900">ReportBridge</span>
            <span className="font-mono text-xs text-gray-400 ml-3">Built for marketing agencies</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-gray-600 font-sans">How it works</a>
            <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600 font-sans">Log in</Link>
            <Link to="/signup" className="text-sm text-gray-400 hover:text-gray-600 font-sans">Sign up free</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
