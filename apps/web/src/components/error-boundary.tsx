"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@kononia/ui/components/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
            <p className="text-destructive font-medium">Something went wrong</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <Button onClick={() => this.setState({ hasError: false })}>
              Try again
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
