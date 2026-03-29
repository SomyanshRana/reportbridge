import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const result = await register(email, name, password);
    setLoading(false);
    if (result.success) {
      toast.success("Account created! Here's your demo report to get started.");
      if (result.demo_report_id) {
        navigate(`/app/reports/${result.demo_report_id}/preview`);
      } else {
        navigate("/app");
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
        {/* Chrome */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex gap-1 text-gray-400">
            <button aria-label="back"><ChevronLeft size={13} /></button>
            <button aria-label="forward"><ChevronRight size={13} /></button>
          </div>
          <div className="flex-1 bg-white border border-gray-200 rounded px-3 py-1">
            <span className="font-mono text-xs text-gray-400">app.reportbridge.io/signup</span>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="mb-6">
            <Link to="/" className="font-mono text-sm font-semibold text-gray-900">ReportBridge</Link>
            <h1 className="text-xl font-semibold text-gray-900 mt-3">Create your free account</h1>
            <p className="text-sm text-gray-500 mt-1">Start generating client-ready reports in minutes.</p>
          </div>

          {error && (
            <div data-testid="signup-error" className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-medium text-gray-700 mb-1">Full name</label>
              <input
                data-testid="signup-name-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="w-full font-mono text-sm px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-sans text-xs font-medium text-gray-700 mb-1">Email address</label>
              <input
                data-testid="signup-email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@agency.com"
                required
                className="w-full font-mono text-sm px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-sans text-xs font-medium text-gray-700 mb-1">Password</label>
              <input
                data-testid="signup-password-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full font-mono text-sm px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              data-testid="signup-submit-btn"
              disabled={loading}
              className="w-full py-2.5 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" data-testid="login-link" className="text-cyan-600 hover:text-cyan-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
