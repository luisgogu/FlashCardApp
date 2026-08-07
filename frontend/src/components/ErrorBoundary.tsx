import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCw, AlertTriangle } from 'lucide-react';

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
    console.error('Uncaught React Error:', error, errorInfo);
  }

  private handleReload = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#2C2621] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white border border-[#E6E0D4] rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2C2621]">Se ha producido un error al cargar</h2>
              <p className="text-xs text-[#7C746A] mt-1">
                La aplicación ha detectado una versión antigua en caché. Pulsa para recargar.
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full bg-[#2C2621] hover:bg-[#423C35] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCw className="w-4 h-4" />
              <span>Recargar Aplicación</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
