import { Component, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

const CHUNK_LOAD_ERROR = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;
const RELOAD_FLAG = 'motocare-chunk-reload';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    // A stale service-worker cache or a mid-navigation deploy can make a lazy tab's
    // chunk 404 — reload once to pick up the current build before showing an error.
    if (CHUNK_LOAD_ERROR.test(error.message) && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload();
    }
  }

  handleRetry = () => {
    sessionStorage.removeItem(RELOAD_FLAG);
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 px-5 text-center">
          <div className="font-display font-bold text-[15px] text-ink-100">
            โหลดหน้านี้ไม่สำเร็จ · Couldn't load this page
          </div>
          <div className="font-sans text-[12px] text-ink-400">
            อาจเป็นเพราะสัญญาณเน็ตหลุด ลองใหม่อีกครั้ง
          </div>
          <button
            onClick={this.handleRetry}
            className="mt-2 min-h-[44px] px-4 rounded-12 bg-accent text-[#000000] font-display font-bold text-[12px] tracking-[.04em] uppercase flex items-center gap-2"
          >
            <RefreshCw size={15} />
            ลองใหม่ · Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
