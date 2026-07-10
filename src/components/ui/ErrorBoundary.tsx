"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle className="size-8 text-red-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">
            Terjadi Kesalahan
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mb-4">
            {this.state.error?.message || "Terjadi kesalahan yang tidak terduga."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-brand-blue-dark hover:bg-brand-blue-medium transition-colors"
          >
            <RefreshCw className="size-3.5" />
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
