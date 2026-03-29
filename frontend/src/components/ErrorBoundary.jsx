import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
          <div className="bg-white border border-red-200 rounded-sm p-8 max-w-md w-full text-center shadow-sm">
            <div className="w-10 h-10 bg-red-50 rounded-sm flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <h2 className="font-sans text-base font-semibold text-gray-800 mb-2">Something went wrong</h2>
            <p className="font-mono text-xs text-gray-500 mb-1">An unexpected error occurred in this section.</p>
            {this.state.error?.message && (
              <p className="font-mono text-[10px] text-red-400 bg-red-50 border border-red-100 px-3 py-2 rounded-sm mt-2 mb-4 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors"
            >
              <RefreshCw size={13} /> Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
