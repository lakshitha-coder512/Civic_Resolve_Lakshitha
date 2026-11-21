import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PageRoute, UserSession } from '../types/civic';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  user: UserSession | null;
  onLogout: () => void;
}

const NAV_LINKS: Array<{ id: PageRoute; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'report', label: 'Report Issue' },
  { id: 'track', label: 'Track Complaint' },
  { id: 'dashboard', label: 'Dashboard' },
];

export function Navbar({ currentPage, onNavigate, user, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: PageRoute) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-indigo-100">
      {/* Vibrant top spectrum bar */}
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-indigo-600 via-teal-500 to-amber-500"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-display text-lg font-bold tracking-tight text-navy-900 whitespace-nowrap shrink-0 flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 cursor-pointer"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="55%" stopColor="#0D9488" />
                <stop offset="100%" stopColor="#0EA5E9" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#brandGrad)" />
            <path d="M7 15.5V10.5L10.5 7.5L14 10.5V15.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 15.5H17V11.5" stroke="#FDE047" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="17" cy="8.5" r="1.5" fill="#FDE047" />
          </svg>
          <span className="bg-gradient-to-r from-navy-900 via-indigo-700 to-teal-700 bg-clip-text text-transparent">
            CivicResolve
          </span>
        </button>

        {/* Zone 2: Primary navigation links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
          {NAV_LINKS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 ${
                  isActive
                    ? 'text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-indigo-700'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[19px] h-0.5 bg-gradient-to-r from-indigo-600 to-teal-500"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={onLogout}
              title={`Signed in as ${user.name} (${user.role}). Click to sign out.`}
              className="hidden md:inline-flex items-center px-4 py-2 text-xs font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign Out · {user.name.split(' ')[0]}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNav('login')}
              className="hidden md:inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              Login
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden p-2 text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-indigo-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-50 to-teal-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setMobileOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('login')}
                className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-600 to-teal-600 text-white cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
