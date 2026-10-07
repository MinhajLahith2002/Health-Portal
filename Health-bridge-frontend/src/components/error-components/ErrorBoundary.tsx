"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorState } from "./ErrorState";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("HealthBridge Uncaught Error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <ErrorState
            type="500"
            title="System Exception Caught"
            description={this.state.error?.message || "An unexpected error occurred in the HealthBridge frontend application."}
            onRetry={this.handleReset}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
