import { PageRoute } from '../types/civic';

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-teal-50/50 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="font-display text-base font-bold bg-gradient-to-r from-indigo-700 to-teal-700 bg-clip-text text-transparent">
            CivicResolve
          </span>
          <p className="mt-1 text-xs text-slate-600">
            AI-powered civic issue reporting and municipal dispatch coordination.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600" aria-label="Footer navigation">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="hover:text-indigo-700 transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('report')}
            className="hover:text-indigo-700 transition-colors cursor-pointer"
          >
            Report Issue
          </button>
          <button
            type="button"
            onClick={() => onNavigate('track')}
            className="hover:text-indigo-700 transition-colors cursor-pointer"
          >
            Track Complaint
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="hover:text-indigo-700 transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="hover:text-indigo-700 transition-colors cursor-pointer"
          >
            Login
          </button>
        </nav>

        <p className="text-xs text-slate-500 tabular-nums">
          © {new Date().getFullYear()} CivicResolve Municipal Systems
        </p>
      </div>
    </footer>
  );
}
