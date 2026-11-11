import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { isDemoMode } from '@/lib/demoMode';
import { ApiError } from '@/types/api';
import { Eye, EyeOff, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';

export function Login() {
  const [identifier, setIdentifier] = useState(isDemoMode() ? 'admin@ohpea.org' : '');
  const [password, setPassword] = useState(isDemoMode() ? 'admin123' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    if (!identifier.trim()) {
      setFieldErrors((prev) => ({ ...prev, identifier: 'Please enter your username or email' }));
      return;
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Please enter your password' }));
      return;
    }

    try {
      setLoading(true);
      await login(identifier.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error('[login] failed request URL:', `${import.meta.env.VITE_API_URL || '(unset)'}/auth/login`);
      if (err instanceof ApiError) {
        if (err.fields) {
          setFieldErrors(err.fields);
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage('Unable to connect to login server. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F6F8F7]">
      {/* Left Brand Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B3D2E] text-white p-12 flex-col justify-between relative overflow-hidden border-r border-[#14573F]">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C9A24A" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Top brand header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#C9A24A] text-[#0B3D2E] font-extrabold text-base flex items-center justify-center shadow-md border border-[#F1E3B8]">
            OH
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              OHPEA
            </h1>
            <p className="text-xs text-[#C9A24A] font-medium tracking-wide">
              Waldaa Ogeeyyii Keessummeessuu fi Tuuriizimii Oromiyaa
            </p>
          </div>
        </div>

        {/* Central mission quote */}
        <div className="relative z-10 max-w-lg space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#14573F] text-[#F1E3B8] border border-[#C9A24A]/30">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24A]" />
            Official Administrative Gateway
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight text-balance">
            Advancing Professional Excellence in Oromia Hospitality &amp; Tourism
          </h2>
          <p className="text-xs text-emerald-200/80 leading-relaxed">
            Centralized portal for member registries, professional accreditation, financial contributions, and cultural tourism content across all regional clusters.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-2xs text-emerald-400/70 flex items-center justify-between border-t border-[#14573F] pt-4">
          <span>Oromia, Ethiopia · Finfinnee &amp; Regional Desks</span>
          <span>Security Protocol TLS 1.3</span>
        </div>
      </div>

      {/* Right Login Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
          {/* Mobile Brand Emblem */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#0B3D2E] text-[#F1E3B8] font-bold text-sm flex items-center justify-center">
              OH
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">OHPEA Portal</h2>
              <p className="text-2xs text-[#C9A24A] font-medium">Oromia Hospitality &amp; Tourism</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Staff Administrator Sign In
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Access the administrative dashboard using your verified credentials.
            </p>
          </div>

          {errorMessage && (
            <div
              className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-medium"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username or Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username or Email Address
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (fieldErrors.identifier) {
                      setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                    }
                  }}
                  placeholder="admin@ohpea.org or username"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all ${
                    fieldErrors.identifier || fieldErrors.usernameOrEmail
                      ? 'border-red-400'
                      : 'border-slate-200'
                  }`}
                  autoComplete="username"
                />
              </div>
              {(fieldErrors.identifier || fieldErrors.usernameOrEmail) && (
                <p className="mt-1 text-2xs text-red-600 font-medium">
                  {fieldErrors.identifier || fieldErrors.usernameOrEmail}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-2xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2 text-xs rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all ${
                    fieldErrors.password ? 'border-red-400' : 'border-slate-200'
                  }`}
                  autoComplete="current-password"
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-2xs text-red-600 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#0B3D2E] focus:ring-[#0B3D2E]"
                />
                <span className="text-xs text-slate-600">Remember this station</span>
              </label>

              <span className="text-2xs text-slate-400">
                Contact Super Admin for password reset
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#0B3D2E] hover:bg-[#14573F] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#C9A24A]" />
                </>
              )}
            </button>
          </form>

          {/* Demo account quick login helper (shown in demo mode only) */}
          {isDemoMode() && (
            <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-2xs text-slate-600 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {import.meta.env.VITE_API_URL ? `Live Backend: ${import.meta.env.VITE_API_URL}` : 'Interactive Demo Mode Active'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('admin@ohpea.org');
                    setPassword('admin123');
                  }}
                  className="text-2xs font-bold text-[#0B3D2E] hover:underline"
                >
                  Auto-fill
                </button>
              </div>
              <p className="text-slate-500">
                Credentials: <code className="font-mono text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-200">admin@ohpea.org</code> / <code className="font-mono text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-200">admin123</code>
              </p>
              {!import.meta.env.VITE_API_URL && (
                <p className="text-2xs text-slate-400 italic">
                  No external API URL configured. The app runs fully with in-memory fixtures. Configure <code className="font-mono">VITE_API_URL</code> in your environment to connect your real backend.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
