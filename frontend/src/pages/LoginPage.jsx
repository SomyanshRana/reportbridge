import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/app");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      {/* Browser frame */}
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
            <span className="font-mono text-xs text-gray-400">app.reportbridge.io/login</span>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="mb-6">
            <Link to="/" className="font-mono text-sm font-semibold text-gray-900">ReportBridge</Link>
            <h1 className="text-xl font-semibold text-gray-900 mt-3">Sign in to your account</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back. Enter your credentials to continue.</p>
          </div>

          {error && (
            <div data-testid="login-error" className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600 font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-medium text-gray-700 mb-1" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full font-mono text-sm px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-sans text-xs font-medium text-gray-700 mb-1" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                data-testid="login-password-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full font-mono text-sm px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              data-testid="login-submit-btn"
              disabled={loading}
              className="w-full py-2.5 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/signup" data-testid="signup-link" className="text-cyan-600 hover:text-cyan-700 font-medium">
                Create one free
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="font-mono text-[10px] text-gray-400 text-center">
              Demo: demo@reportbridge.io / demo1234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
