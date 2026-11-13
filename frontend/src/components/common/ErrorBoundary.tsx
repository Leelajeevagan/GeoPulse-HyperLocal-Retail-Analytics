import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GeoPulse ErrorBoundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-800 border border-rose-500/30 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Dashboard Component Notice</h2>
            <p className="text-xs text-slate-300 mb-4">
              {this.state.error?.message || 'An unexpected rendering issue occurred. Click below to reload.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

