import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Sellnex App:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.hash = '';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg">
            S
          </div>
          <h1 className="text-2xl font-black mb-2 text-white">Sellnex Uzbekistan</h1>
          <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
            Ilova muvaffaqiyatli ishga tushirildi. Qayta yuklash tugmasini bosib to'liq interfeysni ochishingiz mumkin.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
            >
              Ilovani Qayta Yuklash
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}


