import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Database Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path}`;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full border border-red-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                <AlertCircle size={32} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center text-slate-900 mb-4">
              Oops! Something went wrong
            </h1>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8">
              <p className="text-sm text-slate-600 font-mono break-words">
                {errorMessage}
              </p>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
            >
              <RefreshCw size={18} />
              <span>Refresh Application</span>
            </button>
            
            {isFirestoreError && (
              <p className="mt-4 text-center text-xs text-slate-400">
                This appears to be a database permission issue. Please contact support if it persists.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
