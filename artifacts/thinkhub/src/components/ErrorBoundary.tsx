import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-card rounded-xl border border-border p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">Something went wrong</h3>
            <p className="text-sm text-muted-foreground font-display mb-1">
              An unexpected error occurred while rendering this section.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground/60 font-mono bg-secondary rounded-lg p-3 mt-3 mb-4 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-secondary text-foreground text-sm font-display font-medium hover:bg-secondary/80 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="flex items-center gap-2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity"
              >
                <Home className="w-4 h-4" /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline fallback for smaller sections
export function SectionErrorFallback({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <div className="bg-card rounded-xl border border-destructive/20 p-6 text-center">
      <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-2" />
      <p className="text-sm font-display text-foreground mb-1">Failed to load section</p>
      <p className="text-xs text-muted-foreground mb-3">{message || "An error occurred"}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-display font-semibold text-accent hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
