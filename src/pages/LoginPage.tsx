import { useState, type FormEvent } from 'react';
import { ArrowRight, Building2, ShieldCheck, UserCheck } from 'lucide-react';
import { UserSession } from '../types/civic';

interface LoginPageProps {
  onLogin: (session: UserSession) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [role, setRole] = useState<'Citizen' | 'Municipal Official'>('Citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Department of Transportation & Roadways');
  const [error, setError] = useState<string | null>(null);

  const fillDemo = (targetRole: 'Citizen' | 'Municipal Official') => {
    setRole(targetRole);
    setError(null);
    if (targetRole === 'Citizen') {
      setName('Elena Rostova');
      setEmail('elena.rostova@civic-resident.org');
      setPassword('civicresolve-demo');
    } else {
      setName('Officer Maya Lin');
      setEmail('m.lin@city-operations.gov');
      setPassword('municipal-ops-demo');
      setDepartment('Municipal Water & Sewerage Board');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@') || !password.trim()) {
      setError('Enter a valid email address and password to continue.');
      return;
    }

    const derivedName =
      name.trim() ||
      email
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (ch) => ch.toUpperCase());

    onLogin({
      name: derivedName,
      email: email.trim(),
      role,
      department: role === 'Municipal Official' ? department : undefined,
    });
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="border border-indigo-200 rounded-2xl bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm">
        {/* Left: Municipal Portal Summary */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-navy-900 to-teal-800 text-white p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-300">CivicResolve Access</p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
              Citizen &amp; Municipal Portal
            </h1>
            <p className="mt-3 text-sm text-indigo-100 leading-relaxed">
              Sign in as a resident to pre-fill neighborhood reports, or sign in as a municipal official to manage field crew dispatches in the operations dashboard.
            </p>
          </div>

          <div className="mt-8 space-y-4 border-t border-white/15 pt-6 text-xs text-indigo-100">
            <div className="flex items-start gap-3">
              <UserCheck className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-white">Citizen Accounts</p>
                <p className="mt-0.5 text-indigo-100/90">
                  Submit verified complaints, upload site photos, and follow repair milestones.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-white">Municipal Officials</p>
                <p className="mt-0.5 text-indigo-100/90">
                  Coordinate department queues, update field statuses, and verify closed tickets.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sign-In Form */}
        <div className="lg:col-span-7 p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-indigo-50 border border-indigo-100 rounded-lg" role="tablist" aria-label="Account role">
              {(['Citizen', 'Municipal Official'] as const).map((tab) => {
                const active = role === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setRole(tab)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-indigo-700'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fillDemo('Citizen')}
                className="px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-xs font-medium text-sky-900 cursor-pointer"
              >
                Fill Citizen Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemo('Municipal Official')}
                className="px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-xs font-medium text-teal-900 cursor-pointer"
              >
                Fill Official Demo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-name" className="block text-xs font-semibold text-navy-900 mb-1.5">
                Full Name
              </label>
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'Citizen' ? 'e.g., Elena Rostova' : 'e.g., Officer Maya Lin'}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-navy-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-navy-900 mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-navy-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            {role === 'Municipal Official' && (
              <div>
                <label htmlFor="login-dept" className="block text-xs font-semibold text-navy-900 mb-1.5">
                  Municipal Department
                </label>
                <select
                  id="login-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-navy-900 focus:outline-none focus:border-teal-600"
                >
                  <option>Department of Transportation &amp; Roadways</option>
                  <option>Municipal Water &amp; Sewerage Board</option>
                  <option>Electrical &amp; Street Lighting Division</option>
                  <option>Solid Waste Management Authority</option>
                  <option>Traffic Engineering Bureau</option>
                  <option>Parks &amp; Urban Forestry</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-navy-900 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-navy-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Sign In as {role}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
